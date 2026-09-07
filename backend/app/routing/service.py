from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
import uuid
from datetime import datetime, timezone

from ..database.models import (
    StaffProfile, Ticket, TicketAssignment,
    TicketStatusHistory, Department, User
)

ACTIVE_TICKET_STATUSES = ["ASSIGNED", "IN_PROGRESS", "REOPENED"]

def _now() -> datetime:
    """Return current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)


def get_staff_capacity(db: Session, department_id: uuid.UUID) -> Dict[str, Any]:
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        return {"department": None, "staff": []}
    
    staff_profiles = db.query(StaffProfile).filter(StaffProfile.department_id == department_id).all()
    
    staff_capacity = []
    for staff in staff_profiles:
        active_tickets = db.query(Ticket).join(
            TicketAssignment, Ticket.id == TicketAssignment.ticket_id
        ).filter(
            TicketAssignment.staff_id == staff.id,
            TicketAssignment.unassigned_at.is_(None),
            Ticket.status.in_(ACTIVE_TICKET_STATUSES)
        ).count()
        
        high_priority_tickets = db.query(Ticket).join(
            TicketAssignment, Ticket.id == TicketAssignment.ticket_id
        ).filter(
            TicketAssignment.staff_id == staff.id,
            TicketAssignment.unassigned_at.is_(None),
            Ticket.status.in_(ACTIVE_TICKET_STATUSES),
            Ticket.priority.in_(["HIGH", "CRITICAL"])
        ).count()
        
        staff_capacity.append({
            "staff_id": str(staff.id),
            "name": staff.user.full_name if staff.user else f"Staff {staff.employee_code}",
            "active_tickets": active_tickets,
            "high_priority_tickets": high_priority_tickets,
            "max_capacity": staff.max_capacity,
            "remaining_capacity": staff.max_capacity - active_tickets,
            "is_available": staff.is_available
        })
        
    return {
        "department": department.name,
        "staff": staff_capacity
    }

def _assign_manual_triage(db: Session, ticket: Ticket, reason: str) -> Dict[str, Any]:
    old_status = ticket.status
    ticket.status = "MANUAL_TRIAGE"
    ticket.updated_at = _now()
    
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status="MANUAL_TRIAGE",
        reason=reason
    )
    db.add(history)
    db.commit()
    
    return {
        "ticket_id": str(ticket.id),
        "routing_status": "MANUAL_TRIAGE",
        "reason": reason
    }

def assign_ticket(
    db: Session, 
    ticket_id: uuid.UUID, 
    staff_id: uuid.UUID, 
    assignment_method: str, 
    reason: str,
    current_ticket: Optional[Ticket] = None
) -> Dict[str, Any]:
    
    if current_ticket:
        ticket = current_ticket
    else:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).with_for_update().first()
        
    if not ticket:
        raise ValueError("Ticket not found")
        
    staff = db.query(StaffProfile).filter(StaffProfile.id == staff_id).with_for_update().first()
    if not staff:
        raise ValueError("Staff not found")
        
    if staff.department_id != ticket.department_id:
        raise ValueError("Staff belongs to a different department")
        
    if not staff.is_available:
        raise ValueError("Staff is not available")
        
    active_count = db.query(Ticket).join(
        TicketAssignment, Ticket.id == TicketAssignment.ticket_id
    ).filter(
        TicketAssignment.staff_id == staff.id,
        TicketAssignment.unassigned_at.is_(None),
        Ticket.status.in_(ACTIVE_TICKET_STATUSES)
    ).count()
    
    if active_count >= staff.max_capacity:
        raise ValueError("Staff is at maximum capacity")
        
    old_status = ticket.status
    ticket.status = "ASSIGNED"
    ticket.updated_at = _now()
    
    assignment = TicketAssignment(
        ticket_id=ticket.id,
        staff_id=staff.id,
        assignment_method=assignment_method,
        reason=reason
    )
    db.add(assignment)
    
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status="ASSIGNED",
        reason=reason
    )
    db.add(history)
    
    db.commit()
    
    department = db.query(Department).filter(Department.id == staff.department_id).first()
    
    return {
        "ticket_id": str(ticket.id),
        "routing_status": "ASSIGNED",
        "department": department.name if department else "Unknown",
        "staff": {
            "id": str(staff.id),
            "name": staff.user.full_name if staff.user else f"Staff {staff.employee_code}"
        },
        "reason": reason
    }

def route_ticket(db: Session, ticket_id: uuid.UUID) -> Dict[str, Any]:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).with_for_update().first()
    if not ticket:
        raise ValueError("Ticket not found")
        
    if ticket.status not in ["NEW", "AI_ANALYZED"]:
        raise ValueError("Ticket is not in a routable state")

    if not ticket.department_id:
        return _assign_manual_triage(db, ticket, "No department assigned to ticket")

    capacity_data = get_staff_capacity(db, ticket.department_id)
    
    eligible_staff = []
    for s in capacity_data["staff"]:
        if s["is_available"] and s["active_tickets"] < s["max_capacity"]:
            eligible_staff.append(s)
            
    if not eligible_staff:
        return _assign_manual_triage(db, ticket, "No available staff member has remaining capacity.")
        
    eligible_staff.sort(key=lambda x: (
        x["active_tickets"],
        x["high_priority_tickets"],
        x["staff_id"]
    ))
    
    selected_staff = eligible_staff[0]
    
    return assign_ticket(
        db=db,
        ticket_id=ticket.id,
        staff_id=uuid.UUID(selected_staff["staff_id"]),
        assignment_method="AI_MCP",
        reason=f"Lowest active workload among available {capacity_data['department']} staff.",
        current_ticket=ticket
    )

def reassign_ticket(
    db: Session, 
    ticket_id: uuid.UUID, 
    staff_id: uuid.UUID, 
    reason: str
) -> Dict[str, Any]:
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).with_for_update().first()
    if not ticket:
        raise ValueError("Ticket not found")
        
    active_assignment = db.query(TicketAssignment).filter(
        TicketAssignment.ticket_id == ticket.id,
        TicketAssignment.unassigned_at.is_(None)
    ).first()
    
    if active_assignment:
        active_assignment.unassigned_at = _now()
        
    return assign_ticket(
        db=db,
        ticket_id=ticket.id,
        staff_id=staff_id,
        assignment_method="REASSIGNMENT",
        reason=reason,
        current_ticket=ticket
    )

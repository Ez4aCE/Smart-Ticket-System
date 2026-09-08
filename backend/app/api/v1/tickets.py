from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from uuid import UUID
from typing import List

from ...database.session import get_db
from ...database.models import User, StaffProfile, Ticket
from ...core.dependencies import get_current_user, require_staff_or_admin, require_admin
from ...schemas.ticket import (
    TicketUpdate,
    TicketCreate, TicketResponse, TicketDetailResponse,
    TicketStatusUpdate, TicketReopenRequest, ReassignRequest,
    CommentCreate, CommentResponse,
)
from ...services import ticket_service
from ...services.notification_service import notify_status_changed

router = APIRouter()


@router.post("", response_model=TicketResponse, status_code=201)
def create_ticket(
    body: TicketCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = ticket_service.create_ticket(db, current_user.id, body.title, body.description)
    return ticket


@router.get("", response_model=List[TicketResponse])
def list_tickets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "STUDENT":
        return ticket_service.get_tickets_for_student(db, current_user.id)
    elif current_user.role == "STAFF":
        staff = db.query(StaffProfile).filter(StaffProfile.user_id == current_user.id).first()
        if not staff:
            return []
        return ticket_service.get_tickets_for_staff(db, staff.id)
    return ticket_service.get_all_tickets(db)


@router.get("/{ticket_id}", response_model=TicketDetailResponse)
def get_ticket(
    ticket_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "STUDENT" and ticket.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    current_assignment = ticket_service.get_current_assignment(db, ticket_id)
    comments = []
    for c in ticket.comments:
        comments.append({
            "id": c.id, "ticket_id": c.ticket_id, "author_id": c.author_id,
            "author_name": c.author.full_name if c.author else "",
            "comment": c.comment, "created_at": c.created_at,
        })
    status_history = [
        {"id": h.id, "old_status": h.old_status, "new_status": h.new_status,
         "reason": h.reason, "created_at": h.created_at}
        for h in ticket.status_history
    ]
    assignment_data = None
    if current_assignment:
        staff_user = current_assignment.staff.user if current_assignment.staff else None
        assignment_data = {
            "id": current_assignment.id,
            "staff_id": current_assignment.staff_id,
            "staff_name": staff_user.full_name if staff_user else "Unknown",
            "assignment_method": current_assignment.assignment_method,
            "reason": current_assignment.reason,
            "assigned_at": current_assignment.assigned_at,
            "unassigned_at": current_assignment.unassigned_at,
        }
    ticket_dict = {c.name: getattr(ticket, c.name) for c in ticket.__table__.columns}
    return {**ticket_dict, "comments": comments, "status_history": status_history, "current_assignment": assignment_data}


@router.patch("/{ticket_id}", response_model=TicketResponse)
def update_ticket_info(
    ticket_id: UUID,
    body: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    if body.title is not None: ticket.title = body.title
    if body.description is not None: ticket.description = body.description
    if body.priority is not None: ticket.priority = body.priority
    if body.status is not None:
        try:
            ticket_service.transition_status(db, ticket, body.status, current_user.id, "Admin updated ticket")
        except ValueError as e:
            raise HTTPException(status_code=409, detail=str(e))
            
    # Resolve category/department by string name if provided
    from ...database.models import Category, Department
    if body.category is not None:
        cat = db.query(Category).filter(Category.name.ilike(body.category)).first()
        if cat: ticket.category_id = cat.id
    if body.department is not None:
        dept = db.query(Department).filter(Department.name.ilike(body.department)).first()
        if dept: ticket.department_id = dept.id
        
    db.commit()
    db.refresh(ticket)
    return ticket

@router.patch("/{ticket_id}/status", response_model=TicketResponse)
def update_status(
    ticket_id: UUID,
    body: TicketStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    try:
        ticket_service.transition_status(db, ticket, body.status, current_user.id, body.reason)
        db.commit()
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/reopen", response_model=TicketResponse)
def reopen_ticket(
    ticket_id: UUID,
    body: TicketReopenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "STUDENT" and ticket.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if ticket.status not in ("RESOLVED", "CLOSED"):
        raise HTTPException(status_code=409, detail="Only RESOLVED or CLOSED tickets can be reopened")
    ticket_service.transition_status(db, ticket, "REOPENED", current_user.id, body.reason)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/comments", response_model=CommentResponse, status_code=201)
def add_comment(
    ticket_id: UUID,
    body: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if current_user.role == "STUDENT" and ticket.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    comment = ticket_service.add_comment(db, ticket_id, current_user.id, body.comment)
    return {
        "id": comment.id, "ticket_id": comment.ticket_id, "author_id": comment.author_id,
        "author_name": current_user.full_name, "comment": comment.comment,
        "created_at": comment.created_at,
    }


class TriageRequest(BaseModel):
    department_id: UUID
    reason: str = "Manually triaged by admin"

@router.post("/{ticket_id}/triage", response_model=TicketResponse)
def triage_ticket(
    ticket_id: UUID,
    body: TriageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    from ...database.models import Department
    from ...routing.service import route_ticket
    
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
        
    dept = db.query(Department).filter(Department.id == body.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
        
    # Reset status to NEW so routing algorithm can process it
    ticket.department_id = dept.id
    ticket.status = "NEW"
    db.commit()
    
    # Run the auto-routing logic
    try:
        route_ticket(db, ticket.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Routing failed: {e}")
        
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/reassign", response_model=TicketResponse)
def reassign_ticket(
    ticket_id: UUID,
    body: ReassignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    ticket = ticket_service.get_ticket(db, ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    target_staff = db.query(StaffProfile).filter(StaffProfile.id == body.staff_id).first()
    if not target_staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    if target_staff.department_id != ticket.department_id:
        raise HTTPException(status_code=409, detail="Staff belongs to a different department")
    if not target_staff.is_available:
        raise HTTPException(status_code=409, detail="Staff is not available")
    ticket_service.close_assignment(db, ticket_id)
    ticket_service.create_assignment(db, ticket, body.staff_id, "REASSIGNMENT", body.reason, current_user.id)
    ticket.status = "ASSIGNED"
    ticket.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(ticket)
    return ticket


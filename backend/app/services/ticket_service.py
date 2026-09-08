from ..ai.service import AIService
from ..routing.service import route_ticket
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from ..database.models import (
    Ticket, TicketStatusHistory, TicketComment, TicketAssignment,
    AIPrediction, Notification, User, StaffProfile, Department, Category
)

VALID_STATUSES = {
    "NEW", "AI_ANALYZED", "MANUAL_TRIAGE", "ASSIGNED",
    "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"
}

VALID_TRANSITIONS: Dict[str, set] = {
    "NEW": {"AI_ANALYZED", "MANUAL_TRIAGE"},
    "AI_ANALYZED": {"ASSIGNED", "MANUAL_TRIAGE"},
    "MANUAL_TRIAGE": {"ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"},
    "ASSIGNED": {"IN_PROGRESS", "MANUAL_TRIAGE", "RESOLVED", "CLOSED"},
    "IN_PROGRESS": {"RESOLVED", "MANUAL_TRIAGE", "CLOSED"},
    "RESOLVED": {"CLOSED", "REOPENED"},
    "CLOSED": {"REOPENED"},
    "REOPENED": {"ASSIGNED", "IN_PROGRESS"},
}

ACTIVE_TICKET_STATUSES = ["ASSIGNED", "IN_PROGRESS", "REOPENED"]


def _now() -> datetime:
    return datetime.now(timezone.utc)


def generate_ticket_number(db: Session) -> str:
    now = datetime.now(timezone.utc)
    date_str = now.strftime("%Y%m%d")
    count = db.query(Ticket).filter(Ticket.ticket_number.like(f"TKT-{date_str}-%")).count()
    return f"TKT-{date_str}-{count + 1:04d}"


def create_ticket(db: Session, student_id: uuid.UUID, title: str, description: str) -> Ticket:
    CONFIDENCE_THRESHOLD = 0.75
    ticket_number = generate_ticket_number(db)
    
    # 1. Run AI analysis
    ai_service = AIService()
    prediction = ai_service.analyze_ticket(title, description)
    
    # 2. Look up department and category by name (the AI returns string names)
    dept = db.query(Department).filter(Department.name.ilike(prediction.department)).first()
    cat = db.query(Category).filter(Category.name.ilike(prediction.category)).first()

    # 3. Decide initial status based on confidence
    confidence = float(prediction.confidence) if prediction.confidence else 0.0
    if confidence < CONFIDENCE_THRESHOLD:
        initial_status = "MANUAL_TRIAGE"
        triage_reason = f"AI confidence ({confidence:.0%}) below threshold ({CONFIDENCE_THRESHOLD:.0%}). Requires manual review."
    else:
        initial_status = "NEW"
        triage_reason = None

    ticket = Ticket(
        ticket_number=ticket_number,
        student_id=student_id,
        title=title,
        description=description,
        status=initial_status,
        priority=prediction.priority,
        ai_confidence=prediction.confidence,
        department_id=dept.id if dept else None,
        category_id=cat.id if cat else None,
    )
    db.add(ticket)
    db.flush()

    # Record initial status
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=None,
        new_status="NEW",
        reason="Ticket submitted by student.",
    )
    db.add(history)

    # If low confidence, record the triage transition
    if initial_status == "MANUAL_TRIAGE":
        triage_history = TicketStatusHistory(
            ticket_id=ticket.id,
            old_status="NEW",
            new_status="MANUAL_TRIAGE",
            reason=triage_reason,
        )
        db.add(triage_history)

    db.commit()
    db.refresh(ticket)
    
    # 4. Only auto-route if confidence is high enough
    if initial_status == "NEW":
        try:
            route_ticket(db, ticket.id)
        except Exception as e:
            print(f"Routing failed: {e}")
        db.refresh(ticket)
    
    return ticket


def get_ticket(db: Session, ticket_id: uuid.UUID) -> Optional[Ticket]:
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def get_tickets_for_student(db: Session, student_id: uuid.UUID) -> List[Ticket]:
    return db.query(Ticket).filter(Ticket.student_id == student_id).order_by(Ticket.created_at.desc()).all()


def get_tickets_for_staff(db: Session, staff_profile_id: uuid.UUID) -> List[Ticket]:
    return (
        db.query(Ticket)
        .join(TicketAssignment, Ticket.id == TicketAssignment.ticket_id)
        .filter(
            TicketAssignment.staff_id == staff_profile_id,
            TicketAssignment.unassigned_at.is_(None),
        )
        .order_by(Ticket.created_at.desc())
        .all()
    )


def get_all_tickets(db: Session) -> List[Ticket]:
    return db.query(Ticket).order_by(Ticket.created_at.desc()).all()


def transition_status(
    db: Session,
    ticket: Ticket,
    new_status: str,
    changed_by: Optional[uuid.UUID] = None,
    reason: Optional[str] = None,
) -> Ticket:
    if new_status not in VALID_STATUSES:
        raise ValueError(f"Unknown status: {new_status}")
    allowed = VALID_TRANSITIONS.get(ticket.status, set())
    if new_status not in allowed:
        raise ValueError(
            f"Cannot transition from {ticket.status} to {new_status}. Allowed: {allowed}"
        )
    old_status = ticket.status
    ticket.status = new_status
    ticket.updated_at = _now()
    if new_status == "RESOLVED":
        ticket.resolved_at = _now()
    elif new_status == "CLOSED":
        ticket.closed_at = _now()
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        reason=reason,
    )
    db.add(history)
    return ticket


def force_status(
    db: Session,
    ticket: Ticket,
    new_status: str,
    changed_by: Optional[uuid.UUID] = None,
    reason: Optional[str] = None,
) -> Ticket:
    """Force status without transition validation — for use by routing service."""
    old_status = ticket.status
    ticket.status = new_status
    ticket.updated_at = _now()
    if new_status == "RESOLVED":
        ticket.resolved_at = _now()
    elif new_status == "CLOSED":
        ticket.closed_at = _now()
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        reason=reason,
    )
    db.add(history)
    return ticket


def add_comment(db: Session, ticket_id: uuid.UUID, author_id: uuid.UUID, comment: str) -> TicketComment:
    tc = TicketComment(ticket_id=ticket_id, author_id=author_id, comment=comment)
    db.add(tc)
    db.commit()
    db.refresh(tc)
    return tc


def get_available_staff(db: Session, department_id: uuid.UUID) -> List[StaffProfile]:
    staff = db.query(StaffProfile).filter(
        StaffProfile.department_id == department_id,
        StaffProfile.is_available == True,
    ).all()
    eligible = []
    for s in staff:
        active = _count_active_tickets(db, s.id)
        if active < s.max_capacity:
            eligible.append(s)
    return eligible


def get_staff_workload(db: Session, staff_id: uuid.UUID) -> Dict[str, Any]:
    staff = db.query(StaffProfile).filter(StaffProfile.id == staff_id).first()
    if not staff:
        return {}
    active = _count_active_tickets(db, staff_id)
    high_priority = _count_high_priority_tickets(db, staff_id)
    return {
        "staff_id": str(staff_id),
        "active_tickets": active,
        "high_priority_tickets": high_priority,
        "max_capacity": staff.max_capacity,
        "remaining_capacity": staff.max_capacity - active,
        "is_available": staff.is_available,
    }


def _count_active_tickets(db: Session, staff_id: uuid.UUID) -> int:
    return (
        db.query(Ticket)
        .join(TicketAssignment, Ticket.id == TicketAssignment.ticket_id)
        .filter(
            TicketAssignment.staff_id == staff_id,
            TicketAssignment.unassigned_at.is_(None),
            Ticket.status.in_(ACTIVE_TICKET_STATUSES),
        )
        .count()
    )


def _count_high_priority_tickets(db: Session, staff_id: uuid.UUID) -> int:
    return (
        db.query(Ticket)
        .join(TicketAssignment, Ticket.id == TicketAssignment.ticket_id)
        .filter(
            TicketAssignment.staff_id == staff_id,
            TicketAssignment.unassigned_at.is_(None),
            Ticket.status.in_(ACTIVE_TICKET_STATUSES),
            Ticket.priority.in_(["HIGH", "CRITICAL"]),
        )
        .count()
    )


def create_assignment(
    db: Session,
    ticket: Ticket,
    staff_id: uuid.UUID,
    assignment_method: str,
    reason: Optional[str] = None,
    assigned_by: Optional[uuid.UUID] = None,
) -> TicketAssignment:
    assignment = TicketAssignment(
        ticket_id=ticket.id,
        staff_id=staff_id,
        assignment_method=assignment_method,
        reason=reason,
        assigned_by=assigned_by,
    )
    db.add(assignment)
    return assignment


def close_assignment(db: Session, ticket_id: uuid.UUID) -> Optional[TicketAssignment]:
    assignment = (
        db.query(TicketAssignment)
        .filter(
            TicketAssignment.ticket_id == ticket_id,
            TicketAssignment.unassigned_at.is_(None),
        )
        .first()
    )
    if assignment:
        assignment.unassigned_at = _now()
    return assignment


def get_current_assignment(db: Session, ticket_id: uuid.UUID) -> Optional[TicketAssignment]:
    return (
        db.query(TicketAssignment)
        .filter(
            TicketAssignment.ticket_id == ticket_id,
            TicketAssignment.unassigned_at.is_(None),
        )
        .first()
    )


def save_ai_prediction(
    db: Session,
    ticket_id: uuid.UUID,
    model_type: str,
    model_version: str,
    predicted_category_id: Optional[uuid.UUID],
    predicted_department_id: Optional[uuid.UUID],
    predicted_priority: Optional[str],
    confidence: float,
    reason: Optional[str] = None,
) -> AIPrediction:
    prediction = AIPrediction(
        ticket_id=ticket_id,
        model_type=model_type,
        model_version=model_version,
        predicted_category_id=predicted_category_id,
        predicted_department_id=predicted_department_id,
        predicted_priority=predicted_priority,
        confidence=confidence,
        reason=reason,
        is_accepted=None,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


def apply_ai_prediction(
    db: Session,
    ticket: Ticket,
    prediction: AIPrediction,
    confidence_threshold: float = 0.75,
) -> str:
    ticket.category_id = prediction.predicted_category_id
    ticket.department_id = prediction.predicted_department_id
    ticket.priority = prediction.predicted_priority
    ticket.ai_confidence = float(prediction.confidence)
    ticket.updated_at = _now()
    new_status = "AI_ANALYZED" if float(prediction.confidence) >= confidence_threshold else "MANUAL_TRIAGE"
    old_status = ticket.status
    ticket.status = new_status
    history = TicketStatusHistory(
        ticket_id=ticket.id,
        old_status=old_status,
        new_status=new_status,
        reason=f"AI prediction applied. Confidence: {prediction.confidence}.",
    )
    db.add(history)
    prediction.is_accepted = True
    db.commit()
    return new_status


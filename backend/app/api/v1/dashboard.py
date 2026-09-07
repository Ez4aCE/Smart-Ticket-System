from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ...database.session import get_db
from ...database.models import Ticket, StaffProfile, Department
from ...core.dependencies import require_admin
from ...services import ticket_service

router = APIRouter()


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db), _ = Depends(require_admin)):
    status_counts = {}
    rows = db.query(Ticket.status, func.count(Ticket.id)).group_by(Ticket.status).all()
    for st, count in rows:
        status_counts[st.lower()] = count
    total = sum(status_counts.values())

    dept_rows = (
        db.query(Department.name, func.count(Ticket.id))
        .outerjoin(Ticket, Ticket.department_id == Department.id)
        .group_by(Department.name)
        .all()
    )
    departments = [{"department": name, "ticket_count": count or 0} for name, count in dept_rows]

    staff_profiles = db.query(StaffProfile).all()
    staff_workload = []
    for s in staff_profiles:
        wl = ticket_service.get_staff_workload(db, s.id)
        if wl:
            staff_workload.append({
                "staff_id": str(s.id),
                "name": s.user.full_name if s.user else "Unknown",
                "active_tickets": wl["active_tickets"],
                "max_capacity": wl["max_capacity"],
                "is_available": wl["is_available"],
            })

    return {
        "total_tickets": total,
        **status_counts,
        "departments": departments,
        "staff_workload": staff_workload,
    }

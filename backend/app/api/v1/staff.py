from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ...database.session import get_db
from ...database.models import StaffProfile, User
from ...core.dependencies import require_admin, require_staff, get_current_user
from ...schemas.staff import StaffResponse, CapacityUpdate, AvailabilityUpdate
from ...schemas.ticket import TicketResponse
from ...services import ticket_service

router = APIRouter()


def _staff_to_dict(s: StaffProfile) -> dict:
    user = s.user
    return {
        "id": s.id, "user_id": s.user_id, "department_id": s.department_id,
        "employee_code": s.employee_code, "max_capacity": s.max_capacity,
        "is_available": s.is_available,
        "full_name": user.full_name if user else "",
        "email": user.email if user else "",
    }


@router.get("", response_model=List[StaffResponse])
def list_staff(db: Session = Depends(get_db), _ = Depends(require_admin)):
    return [_staff_to_dict(s) for s in db.query(StaffProfile).all()]


@router.get("/me/tickets", response_model=List[TicketResponse])
def my_tickets(db: Session = Depends(get_db), current_user: User = Depends(require_staff)):
    staff = db.query(StaffProfile).filter(StaffProfile.user_id == current_user.id).first()
    if not staff:
        return []
    return ticket_service.get_tickets_for_staff(db, staff.id)


@router.patch("/{staff_id}/capacity", response_model=StaffResponse)
def update_capacity(
    staff_id: UUID, body: CapacityUpdate,
    db: Session = Depends(get_db), _ = Depends(require_admin),
):
    if body.max_capacity < 1 or body.max_capacity > 100:
        raise HTTPException(status_code=422, detail="max_capacity must be between 1 and 100")
    staff = db.query(StaffProfile).filter(StaffProfile.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    staff.max_capacity = body.max_capacity
    db.commit()
    db.refresh(staff)
    return _staff_to_dict(staff)


@router.patch("/{staff_id}/availability", response_model=StaffResponse)
def update_availability(
    staff_id: UUID, body: AvailabilityUpdate,
    db: Session = Depends(get_db), _ = Depends(require_admin),
):
    staff = db.query(StaffProfile).filter(StaffProfile.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    staff.is_available = body.is_available
    db.commit()
    db.refresh(staff)
    return _staff_to_dict(staff)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from ...database.session import get_db
from ...database.models import Department
from ...core.dependencies import require_admin, get_current_user
from ...schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse

router = APIRouter()


@router.get("", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db), _ = Depends(get_current_user)):
    return db.query(Department).filter(Department.is_active == True).all()


@router.post("", response_model=DepartmentResponse, status_code=201)
def create_department(body: DepartmentCreate, db: Session = Depends(get_db), _ = Depends(require_admin)):
    existing = db.query(Department).filter(
        (Department.name == body.name) | (Department.code == body.code)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Department name or code already exists")
    dept = Department(name=body.name, code=body.code, description=body.description)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: UUID,
    body: DepartmentUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin),
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(dept, field, value)
    db.commit()
    db.refresh(dept)
    return dept

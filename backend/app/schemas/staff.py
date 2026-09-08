from pydantic import BaseModel
from typing import Optional
from uuid import UUID


class CapacityUpdate(BaseModel):
    max_capacity: int


class AvailabilityUpdate(BaseModel):
    is_available: bool


class StaffResponse(BaseModel):
    id: UUID
    user_id: UUID
    department_id: UUID
    employee_code: str
    max_capacity: int
    is_available: bool
    full_name: str
    email: str

    model_config = {"from_attributes": True}

class StaffCreate(BaseModel):
    full_name: str
    email: str
    password: str
    department_id: UUID
    employee_code: str


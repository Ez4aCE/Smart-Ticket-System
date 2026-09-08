from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class TicketCreate(BaseModel):
    title: str
    description: str


class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    department: Optional[str] = None

class TicketStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None


class TicketReopenRequest(BaseModel):
    reason: Optional[str] = "Ticket reopened."


class ReassignRequest(BaseModel):
    staff_id: UUID
    reason: str


class CommentCreate(BaseModel):
    comment: str


class CommentResponse(BaseModel):
    id: UUID
    ticket_id: UUID
    author_id: UUID
    author_name: str
    comment: str
    created_at: datetime

    model_config = {"from_attributes": True}


class StatusHistoryResponse(BaseModel):
    id: UUID
    old_status: Optional[str] = None
    new_status: str
    reason: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AssignmentResponse(BaseModel):
    id: UUID
    staff_id: UUID
    staff_name: str
    assignment_method: str
    reason: Optional[str] = None
    assigned_at: datetime
    unassigned_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TicketResponse(BaseModel):
    id: UUID
    ticket_number: str
    title: str
    description: str
    status: str
    priority: Optional[str] = None
    ai_confidence: Optional[float] = None
    category_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    student_id: UUID
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TicketDetailResponse(TicketResponse):
    comments: List[CommentResponse] = []
    status_history: List[StatusHistoryResponse] = []
    current_assignment: Optional[AssignmentResponse] = None


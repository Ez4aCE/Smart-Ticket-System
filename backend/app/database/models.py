import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text, Float, DateTime, Uuid as UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(150), nullable=False, default="")
    password_hash = Column(String(255), nullable=False, default="")
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    default_priority = Column(String(20), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

class StaffProfile(Base):
    __tablename__ = "staff_profiles"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), unique=True, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'), nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False, default="")
    max_capacity = Column(Integer, nullable=False, default=10)
    is_available = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    user = relationship("User")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(30), unique=True, nullable=False, default="")
    student_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey('categories.id'))
    department_id = Column(UUID(as_uuid=True), ForeignKey('departments.id'))
    priority = Column(String(20))
    status = Column(String(30), nullable=False, default="NEW")
    ai_confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    resolved_at = Column(DateTime(timezone=True))
    closed_at = Column(DateTime(timezone=True))

class TicketAssignment(Base):
    __tablename__ = "ticket_assignments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey('tickets.id'), nullable=False)
    staff_id = Column(UUID(as_uuid=True), ForeignKey('staff_profiles.id'), nullable=False)
    assigned_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    assignment_method = Column(String(30), nullable=False)
    reason = Column(Text)
    assigned_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    unassigned_at = Column(DateTime(timezone=True))

class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(UUID(as_uuid=True), ForeignKey('tickets.id'), nullable=False)
    old_status = Column(String(30))
    new_status = Column(String(30), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    reason = Column(Text)
    created_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

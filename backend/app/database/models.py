import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Boolean, ForeignKey, Text,
    Float, DateTime, Numeric, BigInteger, Index, Uuid
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False, default="")
    full_name = Column(String(150), nullable=False, default="")
    role = Column(String(20), nullable=False)  # STUDENT | STAFF | ADMIN
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False)
    tickets = relationship("Ticket", back_populates="student", foreign_keys="Ticket.student_id")
    comments = relationship("TicketComment", back_populates="author", foreign_keys="TicketComment.author_id")


class Department(Base):
    __tablename__ = "departments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    categories = relationship("Category", back_populates="department")
    staff_profiles = relationship("StaffProfile", back_populates="department")
    routing_rules = relationship("RoutingRule", back_populates="department")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    default_priority = Column(String(20), nullable=False, default="MEDIUM")
    department_id = Column(Uuid(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    department = relationship("Department", back_populates="categories")
    routing_rules = relationship("RoutingRule", back_populates="category")


class StaffProfile(Base):
    __tablename__ = "staff_profiles"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    department_id = Column(Uuid(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    employee_code = Column(String(50), unique=True, nullable=False, default="")
    max_capacity = Column(Integer, nullable=False, default=10)
    is_available = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    user = relationship("User", back_populates="staff_profile")
    department = relationship("Department", back_populates="staff_profiles")
    assignments = relationship("TicketAssignment", back_populates="staff")


class RoutingRule(Base):
    __tablename__ = "routing_rules"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(Uuid(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    department_id = Column(Uuid(as_uuid=True), ForeignKey("departments.id"), nullable=False)
    priority = Column(String(20), nullable=False, default="MEDIUM")
    confidence_threshold = Column(Numeric(5, 4), nullable=False, default=0.7500)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    category = relationship("Category", back_populates="routing_rules")
    department = relationship("Department", back_populates="routing_rules")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_number = Column(String(30), unique=True, nullable=False, default="", index=True)
    student_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Uuid(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    department_id = Column(Uuid(as_uuid=True), ForeignKey("departments.id"), nullable=True, index=True)
    priority = Column(String(20), nullable=True)
    status = Column(String(30), nullable=False, default="NEW", index=True)
    ai_confidence = Column(Numeric(5, 4), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    student = relationship("User", back_populates="tickets", foreign_keys=[student_id])
    category = relationship("Category")
    department = relationship("Department")
    ai_predictions = relationship("AIPrediction", back_populates="ticket")
    assignments = relationship("TicketAssignment", back_populates="ticket")
    comments = relationship("TicketComment", back_populates="ticket")
    status_history = relationship("TicketStatusHistory", back_populates="ticket")
    attachments = relationship("Attachment", back_populates="ticket")
    notifications = relationship("Notification", back_populates="ticket")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    model_type = Column(String(50), nullable=False)
    model_version = Column(String(50), nullable=False, default="1.0")
    predicted_category_id = Column(Uuid(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    predicted_department_id = Column(Uuid(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    predicted_priority = Column(String(20), nullable=True)
    confidence = Column(Numeric(5, 4), nullable=False)
    reason = Column(Text, nullable=True)
    is_accepted = Column(Boolean, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)

    ticket = relationship("Ticket", back_populates="ai_predictions")
    predicted_category = relationship("Category", foreign_keys=[predicted_category_id])
    predicted_department = relationship("Department", foreign_keys=[predicted_department_id])


class TicketAssignment(Base):
    __tablename__ = "ticket_assignments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False, index=True)
    staff_id = Column(Uuid(as_uuid=True), ForeignKey("staff_profiles.id"), nullable=False, index=True)
    assigned_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    assignment_method = Column(String(30), nullable=False)
    reason = Column(Text, nullable=True)
    assigned_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    unassigned_at = Column(DateTime(timezone=True), nullable=True)

    ticket = relationship("Ticket", back_populates="assignments")
    staff = relationship("StaffProfile", back_populates="assignments")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by])


class TicketComment(Base):
    __tablename__ = "ticket_comments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False, index=True)
    author_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    updated_at = Column(DateTime(timezone=True), nullable=False, default=_now, onupdate=_now)

    ticket = relationship("Ticket", back_populates="comments")
    author = relationship("User", back_populates="comments", foreign_keys=[author_id])


class TicketStatusHistory(Base):
    __tablename__ = "ticket_status_history"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False, index=True)
    old_status = Column(String(30), nullable=True)
    new_status = Column(String(30), nullable=False)
    changed_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)

    ticket = relationship("Ticket", back_populates="status_history")
    changed_by_user = relationship("User", foreign_keys=[changed_by])


class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    uploaded_by = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    content_type = Column(String(100), nullable=True)
    file_size = Column(BigInteger, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)

    ticket = relationship("Ticket", back_populates="attachments")
    uploader = relationship("User", foreign_keys=[uploaded_by])


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ticket_id = Column(Uuid(as_uuid=True), ForeignKey("tickets.id"), nullable=False)
    recipient_id = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)
    channel = Column(String(20), nullable=False, default="EMAIL")
    status = Column(String(20), nullable=False, default="PENDING")
    subject = Column(String(255), nullable=True)
    sent_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, default=_now)
    error_message = Column(Text, nullable=True)

    ticket = relationship("Ticket", back_populates="notifications")
    recipient = relationship("User", foreign_keys=[recipient_id])

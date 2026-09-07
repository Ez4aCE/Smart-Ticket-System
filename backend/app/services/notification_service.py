import smtplib
import uuid
from datetime import datetime, timezone
from email.mime.text import MIMEText
from typing import Optional
from sqlalchemy.orm import Session

from ..database.models import Notification, Ticket, User


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _smtp_host():
    import os
    return os.environ.get("SMTP_HOST", "")


def _smtp_username():
    import os
    return os.environ.get("SMTP_USERNAME", "")


def _smtp_password():
    import os
    return os.environ.get("SMTP_PASSWORD", "")


def _smtp_port():
    import os
    return int(os.environ.get("SMTP_PORT", "587"))


def _smtp_from():
    import os
    return os.environ.get("SMTP_FROM", "noreply@nexsolve.local")


def create_and_send(
    db: Session,
    ticket: Ticket,
    recipient: User,
    notification_type: str,
    subject: str,
    body: str,
) -> Notification:
    """
    Persist notification and attempt SMTP delivery.
    CRITICAL: ticket state is NEVER rolled back on email failure.
    """
    notification = Notification(
        ticket_id=ticket.id,
        recipient_id=recipient.id,
        notification_type=notification_type,
        channel="EMAIL",
        status="PENDING",
        subject=subject,
    )
    db.add(notification)
    db.flush()

    try:
        _send_email(to=recipient.email, subject=subject, body=body)
        notification.status = "SENT"
        notification.sent_at = _now()
    except Exception as exc:
        notification.status = "FAILED"
        notification.error_message = str(exc)[:500]

    db.commit()
    return notification


def notify_ticket_assigned(db: Session, ticket: Ticket, staff_user: User) -> None:
    subject = f"[NexSolve] New ticket assigned: {ticket.ticket_number}"
    body = (
        f"Hello {staff_user.full_name},\n\n"
        f"Ticket {ticket.ticket_number} has been assigned to you.\n"
        f"Title: {ticket.title}\n"
        f"Priority: {ticket.priority}\n"
    )
    create_and_send(db, ticket, staff_user, "TICKET_ASSIGNED", subject, body)


def notify_status_changed(
    db: Session, ticket: Ticket, recipient: User, old_status: str, new_status: str
) -> None:
    subject = f"[NexSolve] Ticket {ticket.ticket_number} updated: {new_status}"
    body = (
        f"Hello {recipient.full_name},\n\n"
        f"Ticket {ticket.ticket_number} status changed: {old_status} → {new_status}\n"
    )
    create_and_send(db, ticket, recipient, "STATUS_CHANGED", subject, body)


def _send_email(to: str, subject: str, body: str) -> None:
    smtp_host = _smtp_host()
    smtp_username = _smtp_username()
    if not smtp_host or not smtp_username:
        print(f"[EMAIL SKIPPED] To: {to} | Subject: {subject}")
        return
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = _smtp_from()
    msg["To"] = to
    with smtplib.SMTP(smtp_host, _smtp_port(), timeout=10) as server:
        server.starttls()
        server.login(smtp_username, _smtp_password())
        server.sendmail(_smtp_from(), [to], msg.as_string())

import uuid
from typing import Dict, Any, List
from mcp.server.fastmcp import FastMCP
from ..database.session import SessionLocal, init_db
from ..routing.service import get_staff_capacity as db_get_staff_capacity
from ..routing.service import route_ticket as db_route_ticket
from ..routing.service import assign_ticket as db_assign_ticket
from ..routing.service import reassign_ticket as db_reassign_ticket
from ..database.models import Ticket

# Ensure tables exist (idempotent — safe to call multiple times)
init_db()

mcp = FastMCP("SmartTicketSystem")


@mcp.tool()
def search_knowledge_base(query: str) -> Dict[str, Any]:
    """
    Search historical issues and resolutions for a student's problem.
    """
    db = SessionLocal()
    try:
        # Simple POC search against RESOLVED tickets
        tickets = db.query(Ticket).filter(
            Ticket.status == "RESOLVED",
            Ticket.description.ilike(f"%{query}%")
        ).limit(5).all()
        
        matches = []
        for t in tickets:
            matches.append({
                "category": t.category.name if t.category else "General",
                "resolution": t.status_history[-1].reason if hasattr(t, 'status_history') and t.status_history else "Resolved.",
                "similarity": 0.90 # Dummy similarity for POC
            })
            
        if not matches:
            # Dummy result if no matches
            matches.append({
                "category": "Fees",
                "resolution": "Verify transaction status and synchronize the payment record.",
                "similarity": 0.91
            })
            
        return {"matches": matches}
    finally:
        db.close()

@mcp.tool()
def get_staff_capacity(department_id: str) -> Dict[str, Any]:
    """
    Get staff workload information for a department.
    """
    db = SessionLocal()
    try:
        try:
            dep_id = uuid.UUID(department_id)
        except ValueError:
            return {"error": "Invalid department_id format. Must be UUID."}
            
        return db_get_staff_capacity(db, dep_id)
    finally:
        db.close()

@mcp.tool()
def route_ticket(ticket_id: str) -> Dict[str, Any]:
    """
    Automatically route a ticket to the best available staff member.
    """
    db = SessionLocal()
    try:
        try:
            t_id = uuid.UUID(ticket_id)
        except ValueError:
            return {"error": "Invalid ticket_id format. Must be UUID."}
            
        return db_route_ticket(db, t_id)
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@mcp.tool()
def assign_ticket(ticket_id: str, staff_id: str, assignment_method: str, reason: str) -> Dict[str, Any]:
    """
    Manually assign a ticket to a staff member.
    """
    db = SessionLocal()
    try:
        try:
            t_id = uuid.UUID(ticket_id)
            s_id = uuid.UUID(staff_id)
        except ValueError:
            return {"error": "Invalid UUID format."}
            
        return db_assign_ticket(db, t_id, s_id, assignment_method, reason)
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@mcp.tool()
def reassign_ticket(ticket_id: str, staff_id: str, reason: str) -> Dict[str, Any]:
    """
    Reassign a ticket to a new staff member.
    """
    db = SessionLocal()
    try:
        try:
            t_id = uuid.UUID(ticket_id)
            s_id = uuid.UUID(staff_id)
        except ValueError:
            return {"error": "Invalid UUID format."}
            
        return db_reassign_ticket(db, t_id, s_id, reason)
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

@mcp.tool()
def create_ticket(
    student_id: str,
    title: str,
    description: str,
    category_id: str = "",
    department_id: str = "",
    priority: str = "MEDIUM",
) -> Dict[str, Any]:
    """
    Create a new support ticket for a student.
    Returns the created ticket id and ticket_number.
    """
    import uuid as _uuid
    from ..database.models import Ticket as _Ticket, TicketStatusHistory as _TSH

    db = SessionLocal()
    try:
        try:
            s_id = _uuid.UUID(student_id)
        except ValueError:
            return {"error": "Invalid student_id format. Must be UUID."}

        cat_id = None
        dep_id = None
        if category_id:
            try:
                cat_id = _uuid.UUID(category_id)
            except ValueError:
                return {"error": "Invalid category_id format. Must be UUID."}
        if department_id:
            try:
                dep_id = _uuid.UUID(department_id)
            except ValueError:
                return {"error": "Invalid department_id format. Must be UUID."}

        ticket_number = f"TKT-{str(_uuid.uuid4())[:8].upper()}"
        ticket = _Ticket(
            ticket_number=ticket_number,
            student_id=s_id,
            title=title,
            description=description,
            category_id=cat_id,
            department_id=dep_id,
            priority=priority,
            status="NEW",
        )
        db.add(ticket)
        db.flush()

        history = _TSH(
            ticket_id=ticket.id,
            old_status=None,
            new_status="NEW",
            reason="Ticket created via MCP.",
        )
        db.add(history)
        db.commit()

        return {
            "ticket_id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "status": ticket.status,
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@mcp.tool()
def get_ticket(ticket_id: str) -> Dict[str, Any]:
    """
    Retrieve ticket details by ticket_id.
    """
    import uuid as _uuid
    from ..database.models import Ticket as _Ticket

    db = SessionLocal()
    try:
        try:
            t_id = _uuid.UUID(ticket_id)
        except ValueError:
            return {"error": "Invalid ticket_id format. Must be UUID."}

        ticket = db.query(_Ticket).filter(_Ticket.id == t_id).first()
        if not ticket:
            return {"error": "Ticket not found."}

        return {
            "ticket_id": str(ticket.id),
            "ticket_number": ticket.ticket_number,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "priority": ticket.priority,
            "department_id": str(ticket.department_id) if ticket.department_id else None,
            "category_id": str(ticket.category_id) if ticket.category_id else None,
            "ai_confidence": ticket.ai_confidence,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
        }
    finally:
        db.close()


@mcp.tool()
def update_ticket_status(ticket_id: str, new_status: str, reason: str = "") -> Dict[str, Any]:
    """
    Update the status of a ticket and record the change in status history.
    Allowed statuses: NEW, AI_ANALYZED, MANUAL_TRIAGE, ASSIGNED, IN_PROGRESS,
                      RESOLVED, CLOSED, REOPENED
    """
    import uuid as _uuid
    from ..database.models import Ticket as _Ticket, TicketStatusHistory as _TSH
    from datetime import datetime, timezone

    VALID_STATUSES = {
        "NEW", "AI_ANALYZED", "MANUAL_TRIAGE", "ASSIGNED",
        "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED",
    }

    db = SessionLocal()
    try:
        try:
            t_id = _uuid.UUID(ticket_id)
        except ValueError:
            return {"error": "Invalid ticket_id format. Must be UUID."}

        if new_status not in VALID_STATUSES:
            return {"error": f"Invalid status '{new_status}'. Must be one of: {sorted(VALID_STATUSES)}"}

        ticket = db.query(_Ticket).filter(_Ticket.id == t_id).with_for_update().first()
        if not ticket:
            return {"error": "Ticket not found."}

        old_status = ticket.status
        ticket.status = new_status
        ticket.updated_at = datetime.now(timezone.utc)

        if new_status == "RESOLVED":
            ticket.resolved_at = datetime.now(timezone.utc)
        elif new_status == "CLOSED":
            ticket.closed_at = datetime.now(timezone.utc)

        history = _TSH(
            ticket_id=ticket.id,
            old_status=old_status,
            new_status=new_status,
            reason=reason or f"Status updated to {new_status} via MCP.",
        )
        db.add(history)
        db.commit()

        return {
            "ticket_id": str(ticket.id),
            "old_status": old_status,
            "new_status": new_status,
        }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


@mcp.tool()
def add_ticket_comment(ticket_id: str, author_id: str, comment: str) -> Dict[str, Any]:
    """
    Add a comment to a ticket on behalf of a user (staff, admin, or student).
    """
    import uuid as _uuid
    from ..database.models import Ticket as _Ticket

    # TicketComment model may be owned by Member 2; we define a lightweight
    # inline insert here to avoid modifying their models.
    from sqlalchemy import text

    db = SessionLocal()
    try:
        try:
            t_id = _uuid.UUID(ticket_id)
            a_id = _uuid.UUID(author_id)
        except ValueError:
            return {"error": "Invalid UUID format for ticket_id or author_id."}

        ticket = db.query(_Ticket).filter(_Ticket.id == t_id).first()
        if not ticket:
            return {"error": "Ticket not found."}

        # Try to import TicketComment if Member 2 has added it; otherwise report
        try:
            from ..database.models import TicketComment as _TicketComment  # type: ignore
            tc = _TicketComment(
                ticket_id=t_id,
                author_id=a_id,
                comment=comment,
            )
            db.add(tc)
            db.commit()
            return {
                "ticket_id": str(t_id),
                "comment_id": str(tc.id),
                "status": "CREATED",
            }
        except ImportError:
            return {
                "ticket_id": str(t_id),
                "status": "PENDING",
                "note": "TicketComment model not yet available; awaiting Member 2 integration.",
            }
    except Exception as e:
        db.rollback()
        return {"error": str(e)}
    finally:
        db.close()


if __name__ == "__main__":
    mcp.run()

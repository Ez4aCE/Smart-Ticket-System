"""
MCP tool tests.

Each MCP tool is tested for:
  - Valid input → correct structured output shape
  - Invalid UUID input → error key in response (not exception)
  - Tool is callable (discoverable)
"""

import uuid
import os

# Force in-memory SQLite so MCP tools use a clean DB for each test module load.
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from backend.app.mcp.server import (
    search_knowledge_base,
    get_staff_capacity,
    route_ticket,
    assign_ticket,
    reassign_ticket,
    create_ticket,
    get_ticket,
    update_ticket_status,
    add_ticket_comment,
)


# ---------------------------------------------------------------------------
# Discoverability
# ---------------------------------------------------------------------------

def test_all_mcp_tools_callable():
    for fn in [
        search_knowledge_base, get_staff_capacity, route_ticket,
        assign_ticket, reassign_ticket, create_ticket, get_ticket,
        update_ticket_status, add_ticket_comment,
    ]:
        assert callable(fn), f"{fn} is not callable"


# ---------------------------------------------------------------------------
# search_knowledge_base
# ---------------------------------------------------------------------------

def test_search_knowledge_base_returns_matches():
    result = search_knowledge_base("fee payment not reflected")
    assert "matches" in result
    assert isinstance(result["matches"], list)
    assert len(result["matches"]) > 0
    first = result["matches"][0]
    assert "category" in first
    assert "resolution" in first
    assert "similarity" in first


# ---------------------------------------------------------------------------
# get_staff_capacity — invalid UUID
# ---------------------------------------------------------------------------

def test_get_staff_capacity_invalid_uuid():
    result = get_staff_capacity("not-a-uuid")
    assert "error" in result


def test_get_staff_capacity_unknown_dept():
    result = get_staff_capacity(str(uuid.uuid4()))
    # Valid UUID but no matching dept → returns empty staff list
    assert result.get("department") is None or result.get("staff") == []


# ---------------------------------------------------------------------------
# route_ticket — invalid UUID
# ---------------------------------------------------------------------------

def test_route_ticket_invalid_uuid():
    result = route_ticket("bad-id")
    assert "error" in result


def test_route_ticket_nonexistent_ticket():
    result = route_ticket(str(uuid.uuid4()))
    assert "error" in result


# ---------------------------------------------------------------------------
# assign_ticket — invalid UUIDs
# ---------------------------------------------------------------------------

def test_assign_ticket_invalid_ticket_uuid():
    result = assign_ticket("bad", str(uuid.uuid4()), "AI_MCP", "reason")
    assert "error" in result


def test_assign_ticket_invalid_staff_uuid():
    result = assign_ticket(str(uuid.uuid4()), "bad", "AI_MCP", "reason")
    assert "error" in result


def test_assign_ticket_nonexistent_ticket():
    result = assign_ticket(str(uuid.uuid4()), str(uuid.uuid4()), "AI_MCP", "reason")
    assert "error" in result


# ---------------------------------------------------------------------------
# reassign_ticket — invalid UUIDs
# ---------------------------------------------------------------------------

def test_reassign_ticket_invalid_uuid():
    result = reassign_ticket("bad", "bad", "reason")
    assert "error" in result


def test_reassign_ticket_nonexistent():
    result = reassign_ticket(str(uuid.uuid4()), str(uuid.uuid4()), "reason")
    assert "error" in result


# ---------------------------------------------------------------------------
# create_ticket — invalid student UUID
# ---------------------------------------------------------------------------

def test_create_ticket_invalid_student_uuid():
    result = create_ticket("not-a-uuid", "Title", "Description")
    assert "error" in result


# ---------------------------------------------------------------------------
# get_ticket — invalid and nonexistent
# ---------------------------------------------------------------------------

def test_get_ticket_invalid_uuid():
    result = get_ticket("not-a-uuid")
    assert "error" in result


def test_get_ticket_nonexistent():
    result = get_ticket(str(uuid.uuid4()))
    assert "error" in result


# ---------------------------------------------------------------------------
# update_ticket_status — invalid status / UUID
# ---------------------------------------------------------------------------

def test_update_ticket_status_invalid_uuid():
    result = update_ticket_status("bad", "RESOLVED")
    assert "error" in result


def test_update_ticket_status_invalid_status():
    result = update_ticket_status(str(uuid.uuid4()), "INVALID_STATUS")
    assert "error" in result


def test_update_ticket_status_nonexistent_ticket():
    result = update_ticket_status(str(uuid.uuid4()), "RESOLVED")
    assert "error" in result


# ---------------------------------------------------------------------------
# add_ticket_comment — invalid UUIDs
# ---------------------------------------------------------------------------

def test_add_comment_invalid_uuids():
    result = add_ticket_comment("bad", "bad", "hello")
    assert "error" in result


def test_add_comment_nonexistent_ticket():
    result = add_ticket_comment(str(uuid.uuid4()), str(uuid.uuid4()), "hello")
    assert "error" in result

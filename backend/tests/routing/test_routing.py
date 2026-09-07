"""
Routing service tests — covers every case specified in the DoD:

1.  Select least-loaded staff.
2.  Exclude unavailable staff.
3.  Exclude staff at capacity.
4.  Select correct department staff only.
5.  Tie-break by high-priority count.
6.  Final tie-break by staff ID (ascending UUID string).
7.  No eligible staff → MANUAL_TRIAGE.
8.  Capacity boundary: active=9, max=10 → eligible.
9.  Capacity boundary: active=10, max=10 → not eligible.
10. Reassignment preserves old assignment + creates new one.
"""

import pytest
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database.models import (
    Base, Department, StaffProfile, Ticket, TicketAssignment, User,
)
from backend.app.routing.service import (
    route_ticket, get_staff_capacity, reassign_ticket, assign_ticket,
)

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def _user(db, email, role="STAFF"):
    u = User(email=email, role=role)
    db.add(u)
    db.commit()
    return u


def _dept(db, name, code):
    d = Department(name=name, code=code)
    db.add(d)
    db.commit()
    return d


def _staff(db, user, dept, employee_code, max_capacity=10, is_available=True, staff_id=None):
    kwargs = dict(
        user_id=user.id,
        department_id=dept.id,
        employee_code=employee_code,
        max_capacity=max_capacity,
        is_available=is_available,
    )
    if staff_id:
        kwargs["id"] = staff_id
    s = StaffProfile(**kwargs)
    db.add(s)
    db.commit()
    return s


def _ticket(db, student, dept, status="ASSIGNED", priority="LOW"):
    t = Ticket(
        ticket_number=str(uuid.uuid4()),
        student_id=student.id,
        department_id=dept.id,
        title="Test ticket",
        description="Test description",
        priority=priority,
        status=status,
    )
    db.add(t)
    db.commit()
    return t


def _assign(db, ticket, staff):
    db.add(TicketAssignment(
        ticket_id=ticket.id,
        staff_id=staff.id,
        assignment_method="TEST",
    ))
    db.commit()


def _load_staff(db, student, dept, staff, n_total, n_high):
    """Give `staff` n_total active tickets, of which n_high are HIGH priority."""
    for i in range(n_total):
        priority = "HIGH" if i < n_high else "LOW"
        t = _ticket(db, student, dept, status="ASSIGNED", priority=priority)
        _assign(db, t, staff)


# ---------------------------------------------------------------------------
# Test 1: Select least-loaded staff (spec example)
#   Staff A: active=5, high=1
#   Staff B: active=3, high=2
#   Staff C: active=3, high=1  ← expected winner
# ---------------------------------------------------------------------------

def test_route_selects_least_loaded(db):
    dept = _dept(db, "Finance", "FIN")
    student = _user(db, "student@x.com", "STUDENT")
    u1 = _user(db, "a@x.com")
    u2 = _user(db, "b@x.com")
    u3 = _user(db, "c@x.com")

    s1 = _staff(db, u1, dept, "EMP-A", staff_id=uuid.UUID(int=1))
    s2 = _staff(db, u2, dept, "EMP-B", staff_id=uuid.UUID(int=2))
    s3 = _staff(db, u3, dept, "EMP-C", staff_id=uuid.UUID(int=3))

    _load_staff(db, student, dept, s1, 5, 1)   # A: 5 active, 1 high
    _load_staff(db, student, dept, s2, 3, 2)   # B: 3 active, 2 high
    _load_staff(db, student, dept, s3, 3, 1)   # C: 3 active, 1 high ← wins

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"
    assert result["staff"]["id"] == str(s3.id)


# ---------------------------------------------------------------------------
# Test 2: Tie-break by high-priority count (spec example)
#   Staff A: active=3, high=2
#   Staff B: active=3, high=1  ← expected winner
# ---------------------------------------------------------------------------

def test_tiebreak_by_high_priority(db):
    dept = _dept(db, "Exam Cell", "EXAM")
    student = _user(db, "stu2@x.com", "STUDENT")
    u1 = _user(db, "ea@x.com")
    u2 = _user(db, "eb@x.com")

    s1 = _staff(db, u1, dept, "EXA", staff_id=uuid.UUID(int=10))
    s2 = _staff(db, u2, dept, "EXB", staff_id=uuid.UUID(int=20))

    _load_staff(db, student, dept, s1, 3, 2)  # A: 3 active, 2 high
    _load_staff(db, student, dept, s2, 3, 1)  # B: 3 active, 1 high ← wins

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"
    assert result["staff"]["id"] == str(s2.id)


# ---------------------------------------------------------------------------
# Test 3: Final tie-break by staff_id (ascending)
# ---------------------------------------------------------------------------

def test_tiebreak_by_staff_id(db):
    dept = _dept(db, "IT Support", "IT")
    student = _user(db, "stu3@x.com", "STUDENT")
    u1 = _user(db, "it1@x.com")
    u2 = _user(db, "it2@x.com")

    # Same active count, same high-priority count — lowest UUID wins
    s_low = _staff(db, u1, dept, "IT-LOW", staff_id=uuid.UUID(int=5))
    s_high = _staff(db, u2, dept, "IT-HIGH", staff_id=uuid.UUID(int=99))

    _load_staff(db, student, dept, s_low, 2, 1)
    _load_staff(db, student, dept, s_high, 2, 1)

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"
    assert result["staff"]["id"] == str(s_low.id)


# ---------------------------------------------------------------------------
# Test 4: Exclude unavailable staff
# ---------------------------------------------------------------------------

def test_excludes_unavailable_staff(db):
    dept = _dept(db, "Hostel Office", "HOS")
    student = _user(db, "stu4@x.com", "STUDENT")
    u1 = _user(db, "h1@x.com")
    u2 = _user(db, "h2@x.com")

    # s_busy is unavailable; s_ok should get the ticket
    s_busy = _staff(db, u1, dept, "H-BUSY", is_available=False)
    s_ok = _staff(db, u2, dept, "H-OK", is_available=True)

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"
    assert result["staff"]["id"] == str(s_ok.id)


# ---------------------------------------------------------------------------
# Test 5: Exclude staff at full capacity
# ---------------------------------------------------------------------------

def test_excludes_staff_at_capacity(db):
    dept = _dept(db, "Finance2", "FIN2")
    student = _user(db, "stu5@x.com", "STUDENT")
    u1 = _user(db, "f1@x.com")

    s_full = _staff(db, u1, dept, "F-FULL", max_capacity=3)
    _load_staff(db, student, dept, s_full, 3, 0)  # exactly at capacity

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "MANUAL_TRIAGE"


# ---------------------------------------------------------------------------
# Test 6: Capacity boundary — active=9, max=10 → eligible
# ---------------------------------------------------------------------------

def test_capacity_boundary_eligible(db):
    dept = _dept(db, "Transport Office", "TRP")
    student = _user(db, "stu6@x.com", "STUDENT")
    u1 = _user(db, "tr1@x.com")

    s = _staff(db, u1, dept, "TR-9", max_capacity=10)
    _load_staff(db, student, dept, s, 9, 0)  # 9/10 — still eligible

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"


# ---------------------------------------------------------------------------
# Test 7: Capacity boundary — active=10, max=10 → not eligible → MANUAL_TRIAGE
# ---------------------------------------------------------------------------

def test_capacity_boundary_at_max(db):
    dept = _dept(db, "Placement Cell", "PLC")
    student = _user(db, "stu7@x.com", "STUDENT")
    u1 = _user(db, "pl1@x.com")

    s = _staff(db, u1, dept, "PL-10", max_capacity=10)
    _load_staff(db, student, dept, s, 10, 0)  # 10/10 — over limit

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "MANUAL_TRIAGE"


# ---------------------------------------------------------------------------
# Test 8: No eligible staff → MANUAL_TRIAGE
# ---------------------------------------------------------------------------

def test_no_staff_produces_manual_triage(db):
    dept = _dept(db, "Scholarship Office", "SCH")
    student = _user(db, "stu8@x.com", "STUDENT")

    new = _ticket(db, student, dept, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "MANUAL_TRIAGE"


# ---------------------------------------------------------------------------
# Test 9: Only correct-department staff are considered
# ---------------------------------------------------------------------------

def test_only_correct_department_staff_selected(db):
    dept_a = _dept(db, "Dept A", "DA")
    dept_b = _dept(db, "Dept B", "DB")
    student = _user(db, "stu9@x.com", "STUDENT")
    u1 = _user(db, "da1@x.com")
    u2 = _user(db, "db1@x.com")

    _staff(db, u1, dept_a, "DA-STAFF")   # wrong department
    s_b = _staff(db, u2, dept_b, "DB-STAFF")  # correct

    new = _ticket(db, student, dept_b, status="NEW")
    result = route_ticket(db, new.id)

    assert result["routing_status"] == "ASSIGNED"
    assert result["staff"]["id"] == str(s_b.id)


# ---------------------------------------------------------------------------
# Test 10: Reassignment — old preserved, new created
# ---------------------------------------------------------------------------

def test_reassign_preserves_history(db):
    dept = _dept(db, "IT Reassign", "ITR")
    student = _user(db, "stu10@x.com", "STUDENT")
    u1 = _user(db, "itr1@x.com")
    u2 = _user(db, "itr2@x.com")

    s1 = _staff(db, u1, dept, "ITR-1")
    s2 = _staff(db, u2, dept, "ITR-2")

    t1 = _ticket(db, student, dept, status="NEW")

    # Initial assignment
    route_ticket(db, t1.id)

    # Reassign to s2
    reassign_ticket(db, t1.id, s2.id, "Better fit after review")

    assignments = (
        db.query(TicketAssignment)
        .filter(TicketAssignment.ticket_id == t1.id)
        .order_by(TicketAssignment.assigned_at)
        .all()
    )
    assert len(assignments) == 2
    assert assignments[0].unassigned_at is not None, "Original assignment must be closed"
    assert assignments[1].staff_id == s2.id
    assert assignments[1].unassigned_at is None, "New assignment must still be open"
    assert assignments[1].assignment_method == "REASSIGNMENT"

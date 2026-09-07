"""
Person 2 backend tests — uses SQLite in-memory.
"""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "test_secret_backend")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.app.database.models import Base, User, Department, Category, StaffProfile
from backend.app.database.session import get_db
from backend.app.main import app
from backend.app.core.security import hash_password

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def _seed(db):
    dept = Department(name="Finance", code="FIN")
    db.add(dept)
    db.commit()
    cat = Category(name="Fees", code="FEES", default_priority="HIGH", department_id=dept.id)
    db.add(cat)
    student = User(email="student@test.com", full_name="Test Student",
                   role="STUDENT", password_hash=hash_password("pass123"))
    staff_user = User(email="staff@test.com", full_name="Test Staff",
                      role="STAFF", password_hash=hash_password("pass123"))
    admin = User(email="admin@test.com", full_name="Admin User",
                 role="ADMIN", password_hash=hash_password("admin123"))
    db.add_all([student, staff_user, admin])
    db.commit()
    profile = StaffProfile(user_id=staff_user.id, department_id=dept.id,
                           employee_code="EMP-001", max_capacity=10)
    db.add(profile)
    db.commit()
    return student, staff_user, admin, dept, cat, profile


def _login(email, password):
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


# ── Auth ─────────────────────────────────────────────────────────────────────

def test_login_valid():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    r = client.post("/api/v1/auth/login", json={"email": "student@test.com", "password": "pass123"})
    assert r.status_code == 200
    assert "access_token" in r.json()
    assert r.json()["user"]["role"] == "STUDENT"


def test_login_wrong_password():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    r = client.post("/api/v1/auth/login", json={"email": "student@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_inactive_user():
    db = TestingSessionLocal()
    _seed(db)
    u = db.query(User).filter(User.email == "student@test.com").first()
    u.is_active = False
    db.commit()
    db.close()
    r = client.post("/api/v1/auth/login", json={"email": "student@test.com", "password": "pass123"})
    assert r.status_code == 403


def test_unauthorized_without_token():
    r = client.get("/api/v1/tickets")
    assert r.status_code in (401, 403)


# ── Tickets ───────────────────────────────────────────────────────────────────

def test_create_ticket():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    token = _login("student@test.com", "pass123")
    r = client.post("/api/v1/tickets",
                    json={"title": "Fee issue", "description": "Payment not reflected in portal."},
                    headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201
    assert r.json()["ticket_number"].startswith("TKT-")
    assert r.json()["status"] == "NEW"


def test_ticket_numbers_unique():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    token = _login("student@test.com", "pass123")
    nums = []
    for i in range(3):
        r = client.post("/api/v1/tickets",
                        json={"title": f"Issue {i}", "description": "A description long enough."},
                        headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 201
        nums.append(r.json()["ticket_number"])
    assert len(nums) == len(set(nums))


def test_student_cannot_see_other_ticket():
    db = TestingSessionLocal()
    _seed(db)
    student2 = User(email="s2@test.com", full_name="Student2", role="STUDENT",
                    password_hash=hash_password("pass123"))
    db.add(student2)
    db.commit()
    db.close()
    t1 = _login("student@test.com", "pass123")
    t2 = _login("s2@test.com", "pass123")
    r = client.post("/api/v1/tickets",
                    json={"title": "Private", "description": "Only for student one."},
                    headers={"Authorization": f"Bearer {t1}"})
    tid = r.json()["id"]
    r2 = client.get(f"/api/v1/tickets/{tid}", headers={"Authorization": f"Bearer {t2}"})
    assert r2.status_code == 403


# ── Status Transitions ───────────────────────────────────────────────────────

def test_valid_status_transition():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    st = _login("student@test.com", "pass123")
    ad = _login("admin@test.com", "admin123")
    r = client.post("/api/v1/tickets",
                    json={"title": "Test", "description": "A description long enough."},
                    headers={"Authorization": f"Bearer {st}"})
    tid = r.json()["id"]
    r2 = client.patch(f"/api/v1/tickets/{tid}/status",
                      json={"status": "AI_ANALYZED", "reason": "Done."},
                      headers={"Authorization": f"Bearer {ad}"})
    assert r2.status_code == 200
    assert r2.json()["status"] == "AI_ANALYZED"


def test_invalid_status_transition():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    st = _login("student@test.com", "pass123")
    ad = _login("admin@test.com", "admin123")
    r = client.post("/api/v1/tickets",
                    json={"title": "Test", "description": "A description long enough."},
                    headers={"Authorization": f"Bearer {st}"})
    tid = r.json()["id"]
    r2 = client.patch(f"/api/v1/tickets/{tid}/status",
                      json={"status": "RESOLVED", "reason": "Skip."},
                      headers={"Authorization": f"Bearer {ad}"})
    assert r2.status_code == 409


def test_reopen_ticket():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    st = _login("student@test.com", "pass123")
    ad = _login("admin@test.com", "admin123")
    r = client.post("/api/v1/tickets",
                    json={"title": "Reopen", "description": "This will be reopened later."},
                    headers={"Authorization": f"Bearer {st}"})
    tid = r.json()["id"]
    for s in ["AI_ANALYZED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"]:
        client.patch(f"/api/v1/tickets/{tid}/status",
                     json={"status": s, "reason": "."},
                     headers={"Authorization": f"Bearer {ad}"})
    r2 = client.post(f"/api/v1/tickets/{tid}/reopen",
                     json={"reason": "Not resolved."},
                     headers={"Authorization": f"Bearer {st}"})
    assert r2.status_code == 200
    assert r2.json()["status"] == "REOPENED"


# ── Departments ───────────────────────────────────────────────────────────────

def test_list_departments():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    token = _login("student@test.com", "pass123")
    r = client.get("/api/v1/departments", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert len(r.json()) >= 1


def test_create_department_requires_admin():
    db = TestingSessionLocal()
    _seed(db)
    db.close()
    token = _login("student@test.com", "pass123")
    r = client.post("/api/v1/departments",
                    json={"name": "New", "code": "NEW"},
                    headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403


# ── Health ────────────────────────────────────────────────────────────────────

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

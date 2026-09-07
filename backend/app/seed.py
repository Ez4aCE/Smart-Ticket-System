import uuid
from sqlalchemy.orm import Session
from .database.session import SessionLocal, init_db
from .database.models import User, Department, Category, StaffProfile, RoutingRule
from .core.security import hash_password

DEPARTMENTS = [
    {"name": "Finance",            "code": "FINANCE"},
    {"name": "Exam Cell",          "code": "EXAM_CELL"},
    {"name": "Hostel Office",      "code": "HOSTEL"},
    {"name": "Placement Cell",     "code": "PLACEMENT"},
    {"name": "Scholarship Office", "code": "SCHOLARSHIP"},
    {"name": "IT Support",         "code": "IT_SUPPORT"},
    {"name": "Admission Office",   "code": "ADMISSION"},
    {"name": "Transport Office",   "code": "TRANSPORT"},
]

CATEGORIES = [
    {"name": "Fees",         "code": "FEES",        "dept": "FINANCE",     "priority": "HIGH"},
    {"name": "Examination",  "code": "EXAMINATION", "dept": "EXAM_CELL",   "priority": "HIGH"},
    {"name": "Hostel",       "code": "HOSTEL_CAT",  "dept": "HOSTEL",      "priority": "MEDIUM"},
    {"name": "Placement",    "code": "PLACEMENT",   "dept": "PLACEMENT",   "priority": "MEDIUM"},
    {"name": "Scholarship",  "code": "SCHOLARSHIP", "dept": "SCHOLARSHIP", "priority": "LOW"},
    {"name": "IT / Network", "code": "IT_NETWORK",  "dept": "IT_SUPPORT",  "priority": "MEDIUM"},
    {"name": "Admission",    "code": "ADMISSION",   "dept": "ADMISSION",   "priority": "LOW"},
    {"name": "Transport",    "code": "TRANSPORT",   "dept": "TRANSPORT",   "priority": "LOW"},
]

STAFF_USERS = [
    {"email": "finance@nexsolve.local",     "name": "Finance Staff 01",   "dept": "FINANCE",     "emp": "EMP-FIN-01"},
    {"email": "exam@nexsolve.local",        "name": "Exam Staff 01",      "dept": "EXAM_CELL",   "emp": "EMP-EXM-01"},
    {"email": "hostel@nexsolve.local",      "name": "Hostel Staff 01",    "dept": "HOSTEL",      "emp": "EMP-HOS-01"},
    {"email": "placement@nexsolve.local",   "name": "Placement Staff 01", "dept": "PLACEMENT",   "emp": "EMP-PLC-01"},
    {"email": "scholarship@nexsolve.local", "name": "Scholar Staff 01",   "dept": "SCHOLARSHIP", "emp": "EMP-SCH-01"},
    {"email": "itsupport@nexsolve.local",   "name": "IT Staff 01",        "dept": "IT_SUPPORT",  "emp": "EMP-IT-01"},
    {"email": "admission@nexsolve.local",   "name": "Admission Staff 01", "dept": "ADMISSION",   "emp": "EMP-ADM-01"},
    {"email": "transport@nexsolve.local",   "name": "Transport Staff 01", "dept": "TRANSPORT",   "emp": "EMP-TRP-01"},
]


def seed(db: Session) -> None:
    print("Seeding departments...")
    dept_map = {}
    for d in DEPARTMENTS:
        obj = db.query(Department).filter(Department.code == d["code"]).first()
        if not obj:
            obj = Department(name=d["name"], code=d["code"])
            db.add(obj)
            db.flush()
        dept_map[d["code"]] = obj
    db.commit()

    print("Seeding categories + routing rules...")
    for c in CATEGORIES:
        cat = db.query(Category).filter(Category.code == c["code"]).first()
        if not cat:
            cat = Category(
                name=c["name"], code=c["code"],
                default_priority=c["priority"],
                department_id=dept_map[c["dept"]].id,
            )
            db.add(cat)
            db.flush()
            rule = RoutingRule(
                category_id=cat.id,
                department_id=dept_map[c["dept"]].id,
                priority=c["priority"],
                confidence_threshold="0.7500",
            )
            db.add(rule)
    db.commit()

    print("Seeding users...")
    admin = db.query(User).filter(User.email == "admin@nexsolve.local").first()
    if not admin:
        db.add(User(email="admin@nexsolve.local", full_name="System Admin", role="ADMIN",
                    password_hash=hash_password("admin123")))
    student = db.query(User).filter(User.email == "student@nexsolve.local").first()
    if not student:
        db.add(User(email="student@nexsolve.local", full_name="Demo Student", role="STUDENT",
                    password_hash=hash_password("student123")))
    db.flush()

    for su in STAFF_USERS:
        user = db.query(User).filter(User.email == su["email"]).first()
        if not user:
            user = User(email=su["email"], full_name=su["name"], role="STAFF",
                        password_hash=hash_password("staff123"))
            db.add(user)
            db.flush()
            profile = StaffProfile(
                user_id=user.id,
                department_id=dept_map[su["dept"]].id,
                employee_code=su["emp"],
            )
            db.add(profile)
    db.commit()
    print("Seed complete.")


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()

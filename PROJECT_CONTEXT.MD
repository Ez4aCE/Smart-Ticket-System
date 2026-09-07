# Smart Student Ticket Auto-Assignment System

## 1. Project Context

Build a working Proof-of-Concept (POC) for the Micron NexSolve Hackathon.

The system is an AI-powered college student ticket management and auto-assignment platform.

The system must allow students to submit issues related to:

* Admissions
* Fees
* Examinations
* Hostels
* Transport
* Scholarships
* Placements
* IT / Network

The system analyzes student requests using AI/ML, predicts:

* Category
* Priority
* Department
* Confidence

The system then automatically routes the ticket to the appropriate department and assigns it to the most suitable available staff member based on workload/capacity.

Students can track ticket progress.

Staff can view assigned tickets, comment, update status, reassign tickets, and resolve tickets.

Administrators can manage departments, routing rules, staff capacity, and view summary reports.

Low-confidence AI predictions or unavailable AI models must be routed to Manual Triage.

The system must use both:

1. An ML baseline using TF-IDF + Logistic Regression.
2. An LLM.
3. MCP for controlled AI access to enterprise ticket/routing operations.

The POC must be practical to implement within approximately 6 hours.

---

# 2. Primary Objective

Build an end-to-end working flow:

```text
Student
  ↓
Create Ticket
  ↓
AI/ML Analysis
  ↓
Category + Priority + Department + Confidence
  ↓
Confidence Check
  ↓
 ┌──────────────────────────────┐
 │                              │
High Confidence            Low Confidence
 │                              │
 ▼                              ▼
Automatic Routing          Manual Triage
 │
 ▼
MCP Tool
 │
 ▼
Get Department Staff Capacity
 │
 ▼
Select Best Available Staff
 │
 ▼
Create Assignment
 │
 ▼
Staff Works Ticket
 │
 ▼
IN_PROGRESS
 │
 ▼
RESOLVED
 │
 ▼
Student Closes or Reopens
 │
 ▼
Status Notifications
```

This flow is the primary demo and must work before any secondary feature is considered complete.

---

# 3. Product Positioning

Do not position this as merely an "AI chatbot".

Position it as:

> AI-powered enterprise student-service ticket orchestration with capacity-aware automatic assignment.

The architectural story is:

```text
LLM
  ↓
Understand natural language
  ↓
ML classification + confidence
  ↓
MCP
  ↓
Controlled enterprise operations
  ↓
Ticketing + routing + staff capacity
  ↓
PostgreSQL
```

The LLM is the reasoning/interface layer.

The ML model provides a measurable classification baseline.

MCP provides governed access to enterprise actions.

The backend and database remain the source of truth.

Never allow the LLM to directly modify PostgreSQL.

---

# 4. Technology Stack

Use the following stack unless the existing repository already establishes an equivalent technology.

## Frontend

* React
* Bootstrap
* JavaScript or TypeScript according to existing repository conventions

## Backend

* Python
* FastAPI
* Pydantic
* SQLAlchemy
* PostgreSQL
* JWT authentication

## AI / ML

* Python
* scikit-learn
* TF-IDF
* Logistic Regression
* LLM API using the configured provider/API key

## MCP

Use an MCP server exposing controlled tools for:

* Ticket creation
* Staff capacity lookup
* Ticket assignment
* Ticket retrieval
* Status updates
* Comments
* Reassignment
* Notifications where appropriate

## Email

Use SMTP for the POC unless an existing email provider is already configured.

## Deployment

* Docker
* Docker Compose

## Testing

* pytest
* FastAPI TestClient
* Integration tests for the core workflow

---

# 5. Architecture

Use a modular monolith.

Do NOT build microservices for this POC.

```text
smart-student-ticket-system/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── departments/
│   │   ├── categories/
│   │   ├── staff/
│   │   ├── routing/
│   │   ├── ai/
│   │   ├── mcp/
│   │   ├── notifications/
│   │   └── database/
│   │
│   ├── tests/
│   └── requirements.txt
│
├── frontend/
│   └── src/
│
├── ml/
│   ├── data/
│   ├── training/
│   ├── models/
│   └── evaluation/
│
├── mcp-server/
│
├── docker-compose.yml
└── README.md
```

Keep the actual directory structure consistent with the repository if it already exists.

Do not unnecessarily restructure an existing repository.

---

# 6. User Roles

The system has four logical actors.

## STUDENT

Can:

* Login
* Create tickets
* Add ticket description
* Upload attachments
* View AI prediction
* Track tickets
* View ticket updates
* View comments
* Close resolved tickets
* Reopen tickets

## STAFF

Can:

* Login
* View assigned tickets
* View ticket details
* Comment
* Update ticket status
* Resolve tickets
* Reassign tickets where permitted

## ADMIN

Can:

* Login
* View summary dashboard
* Manage departments
* Manage categories
* Manage routing rules
* Manage staff
* Configure staff capacity
* View ticket statistics
* View manual triage queue

## AI/ML SERVICE

Responsible for:

* Natural language understanding
* Category prediction
* Priority prediction
* Department prediction
* Confidence estimation
* Explanation
* Routing decision assistance

AI must not directly mutate database state.

---

# 7. Categories and Departments

Seed these categories.

| Category     | Code        | Department         | Default Priority |
| ------------ | ----------- | ------------------ | ---------------- |
| Fees         | FEES        | Finance            | HIGH             |
| Examination  | EXAMINATION | Exam Cell          | HIGH             |
| Hostel       | HOSTEL      | Hostel Office      | MEDIUM           |
| Placement    | PLACEMENT   | Placement Cell     | MEDIUM           |
| Scholarship  | SCHOLARSHIP | Scholarship Office | LOW              |
| IT / Network | IT_NETWORK  | IT Support         | MEDIUM           |
| Admission    | ADMISSION   | Admission Office   | LOW              |
| Transport    | TRANSPORT   | Transport Office   | LOW              |

Example routing:

```text
Fees
  ↓
Finance

Examination
  ↓
Exam Cell

Hostel
  ↓
Hostel Office

Placement
  ↓
Placement Cell

Scholarship
  ↓
Scholarship Office

IT / Network
  ↓
IT Support

Admission
  ↓
Admission Office

Transport
  ↓
Transport Office
```

Admin must be able to modify routing rules without modifying application code.

---

# 8. Example Tickets

Use synthetic/anonymized data only.

Never use real:

* Student names
* Student IDs
* Passwords
* Academic records
* Payment identifiers
* Personal/private records

Seed example tickets such as:

```text
I paid my semester fees, but the payment is not reflected in the portal.
```

Expected:

```text
Category: Fees
Department: Finance
Priority: HIGH
```

```text
I am unable to connect to the college Wi-Fi in Lab 3.
```

Expected:

```text
Category: IT / Network
Department: IT Support
Priority: MEDIUM
```

```text
My hall ticket is not available for download.
```

Expected:

```text
Category: Examination
Department: Exam Cell
Priority: HIGH
```

```text
The fan in my hostel room is not working.
```

Expected:

```text
Category: Hostel
Department: Hostel Office
Priority: MEDIUM
```

```text
What are the eligibility criteria for scholarships?
```

Expected:

```text
Category: Scholarship
Department: Scholarship Office
Priority: LOW
```

```text
I am unable to register for the placement drive.
```

Expected:

```text
Category: Placement
Department: Placement Cell
Priority: MEDIUM
```

```text
My bus pass renewal request is still pending.
```

Expected:

```text
Category: Transport
Department: Transport Office
Priority: LOW
```

---

# 9. Database ER Model

Use PostgreSQL.

The database contains these 12 core tables:

```text
users
departments
categories
staff_profiles
routing_rules
tickets
ai_predictions
ticket_assignments
ticket_comments
ticket_status_history
attachments
notifications
```

---

# 10. users

Purpose: common authentication and identity table.

Columns:

```text
id                UUID PRIMARY KEY
email             VARCHAR(255) UNIQUE NOT NULL
password_hash     VARCHAR(255) NOT NULL
full_name         VARCHAR(150) NOT NULL
role              VARCHAR(20) NOT NULL
is_active         BOOLEAN NOT NULL DEFAULT TRUE
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

Allowed roles:

```text
STUDENT
STAFF
ADMIN
```

Do not create separate login tables for each role.

---

# 11. departments

Columns:

```text
id                UUID PRIMARY KEY
name              VARCHAR(100) UNIQUE NOT NULL
code              VARCHAR(50) UNIQUE NOT NULL
description       TEXT
is_active         BOOLEAN NOT NULL DEFAULT TRUE
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

Seed:

```text
Finance
Exam Cell
Hostel Office
Placement Cell
Scholarship Office
IT Support
Admission Office
Transport Office
```

---

# 12. categories

Columns:

```text
id                UUID PRIMARY KEY
name              VARCHAR(100) UNIQUE NOT NULL
code              VARCHAR(50) UNIQUE NOT NULL
description       TEXT
default_priority  VARCHAR(20) NOT NULL
department_id     UUID NOT NULL REFERENCES departments(id)
is_active         BOOLEAN NOT NULL DEFAULT TRUE
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

Allowed default priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 13. staff_profiles

Columns:

```text
id                UUID PRIMARY KEY
user_id           UUID UNIQUE NOT NULL REFERENCES users(id)
department_id     UUID NOT NULL REFERENCES departments(id)
employee_code     VARCHAR(50) UNIQUE NOT NULL
max_capacity      INTEGER NOT NULL DEFAULT 10
is_available      BOOLEAN NOT NULL DEFAULT TRUE
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

Staff workload must be derived from active assignments/tickets rather than stored as an unreliable duplicated counter.

---

# 14. routing_rules

Columns:

```text
id                    UUID PRIMARY KEY
category_id           UUID NOT NULL REFERENCES categories(id)
department_id         UUID NOT NULL REFERENCES departments(id)
priority              VARCHAR(20) NOT NULL
confidence_threshold  DECIMAL(5,4) NOT NULL DEFAULT 0.7500
is_active              BOOLEAN NOT NULL DEFAULT TRUE
created_at             TIMESTAMPTZ NOT NULL
updated_at             TIMESTAMPTZ NOT NULL
```

The routing rule controls:

```text
category
→ department
→ priority
→ confidence threshold
```

---

# 15. tickets

Central business entity.

Columns:

```text
id                UUID PRIMARY KEY
ticket_number     VARCHAR(30) UNIQUE NOT NULL
student_id        UUID NOT NULL REFERENCES users(id)
title             VARCHAR(255) NOT NULL
description       TEXT NOT NULL
category_id       UUID REFERENCES categories(id)
department_id     UUID REFERENCES departments(id)
priority          VARCHAR(20)
status            VARCHAR(30) NOT NULL
ai_confidence     DECIMAL(5,4)
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
resolved_at       TIMESTAMPTZ
closed_at         TIMESTAMPTZ
```

Ticket statuses:

```text
NEW
AI_ANALYZED
MANUAL_TRIAGE
ASSIGNED
IN_PROGRESS
RESOLVED
CLOSED
REOPENED
```

Priorities:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

---

# 16. ai_predictions

Keep AI predictions separate from tickets for evaluation and auditability.

Columns:

```text
id                         UUID PRIMARY KEY
ticket_id                  UUID NOT NULL REFERENCES tickets(id)
model_type                 VARCHAR(50) NOT NULL
model_version              VARCHAR(50) NOT NULL
predicted_category_id      UUID REFERENCES categories(id)
predicted_department_id    UUID REFERENCES departments(id)
predicted_priority         VARCHAR(20)
confidence                 DECIMAL(5,4) NOT NULL
reason                     TEXT
is_accepted                BOOLEAN
created_at                 TIMESTAMPTZ NOT NULL
```

Example model types:

```text
TFIDF_LOGISTIC_REGRESSION
LLM
```

This table is required for model evaluation.

---

# 17. ticket_assignments

Assignment history.

Columns:

```text
id                  UUID PRIMARY KEY
ticket_id           UUID NOT NULL REFERENCES tickets(id)
staff_id            UUID NOT NULL REFERENCES staff_profiles(id)
assigned_by         UUID REFERENCES users(id)
assignment_method   VARCHAR(30) NOT NULL
reason              TEXT
assigned_at         TIMESTAMPTZ NOT NULL
unassigned_at       TIMESTAMPTZ
```

Allowed assignment methods:

```text
AI_MCP
MANUAL
ADMIN
REASSIGNMENT
```

Never destroy previous assignment history.

---

# 18. ticket_comments

Columns:

```text
id                UUID PRIMARY KEY
ticket_id         UUID NOT NULL REFERENCES tickets(id)
author_id         UUID NOT NULL REFERENCES users(id)
comment           TEXT NOT NULL
created_at        TIMESTAMPTZ NOT NULL
updated_at        TIMESTAMPTZ NOT NULL
```

---

# 19. ticket_status_history

Audit trail.

Columns:

```text
id                UUID PRIMARY KEY
ticket_id         UUID NOT NULL REFERENCES tickets(id)
old_status        VARCHAR(30)
new_status        VARCHAR(30) NOT NULL
changed_by        UUID REFERENCES users(id)
reason            TEXT
created_at        TIMESTAMPTZ NOT NULL
```

Every status transition must be recorded.

---

# 20. attachments

Columns:

```text
id                UUID PRIMARY KEY
ticket_id         UUID NOT NULL REFERENCES tickets(id)
uploaded_by       UUID NOT NULL REFERENCES users(id)
file_name         VARCHAR(255) NOT NULL
storage_path      VARCHAR(500) NOT NULL
content_type      VARCHAR(100)
file_size         BIGINT
created_at        TIMESTAMPTZ NOT NULL
```

For the POC, use a Docker-mounted local storage directory.

Do not spend significant hackathon time implementing cloud object storage.

---

# 21. notifications

Columns:

```text
id                  UUID PRIMARY KEY
ticket_id           UUID NOT NULL REFERENCES tickets(id)
recipient_id        UUID NOT NULL REFERENCES users(id)
notification_type   VARCHAR(50) NOT NULL
channel             VARCHAR(20) NOT NULL
status              VARCHAR(20) NOT NULL
subject             VARCHAR(255)
sent_at             TIMESTAMPTZ
created_at          TIMESTAMPTZ NOT NULL
error_message       TEXT
```

Notification types:

```text
TICKET_CREATED
TICKET_ASSIGNED
STATUS_CHANGED
TICKET_RESOLVED
TICKET_REOPENED
```

Notification statuses:

```text
PENDING
SENT
FAILED
```

Channel:

```text
EMAIL
```

---

# 22. Database Relationships

```text
users
  1 ─── N tickets

users
  1 ─── 1 staff_profiles

departments
  1 ─── N categories

departments
  1 ─── N staff_profiles

categories
  1 ─── N routing_rules

tickets
  1 ─── N ai_predictions

tickets
  1 ─── N ticket_assignments

staff_profiles
  1 ─── N ticket_assignments

tickets
  1 ─── N ticket_comments

tickets
  1 ─── N ticket_status_history

tickets
  1 ─── N attachments

tickets
  1 ─── N notifications
```

---

# 23. AI Architecture

Use two complementary AI layers.

## Layer 1: ML Baseline

Implement:

```text
Ticket text
  ↓
TF-IDF Vectorizer
  ↓
Logistic Regression
  ↓
Category prediction
  ↓
Probability/confidence
```

The baseline should support the eight categories.

Evaluate:

* Accuracy
* Macro F1
* Routing accuracy

Use synthetic/anonymized labeled data.

Persist the trained model for inference.

Do not retrain on every request.

---

# 24. LLM Responsibilities

The LLM should handle natural-language understanding and structured extraction.

The LLM should return structured data similar to:

```json
{
  "intent": "payment_not_reflected",
  "category": "Fees",
  "department": "Finance",
  "priority": "HIGH",
  "confidence": 0.96,
  "reason": "The student reports that a completed fee payment is not reflected in the portal."
}
```

The exact provider/model must be configurable through environment variables.

Never hard-code API keys.

---

# 25. AI Decision Strategy

The application should not blindly trust the LLM.

Recommended pipeline:

```text
Student request
  ↓
LLM understands request
  ↓
ML classifier predicts category
  ↓
Compare/validate predictions
  ↓
Determine confidence
  ↓
Apply deterministic routing rules
  ↓
Automatic routing OR Manual Triage
```

The backend remains authoritative.

AI proposes.

Business rules validate.

Backend executes.

---

# 26. Confidence Threshold

Default threshold:

```text
0.75
```

Behavior:

```text
confidence >= 0.75
    ↓
Automatic routing
```

```text
confidence < 0.75
    ↓
MANUAL_TRIAGE
```

If the AI/LLM is unavailable:

```text
AI unavailable
    ↓
MANUAL_TRIAGE
```

The system must not fail ticket creation merely because the AI service is unavailable.

---

# 27. Priority

Use the AI to identify urgency/priority, but validate priority through backend policy.

Allowed values:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Category defaults provide a baseline.

The final priority must be validated by deterministic backend rules.

Do not allow arbitrary LLM-generated priority strings to enter the database.

---

# 28. MCP Architecture

MCP is mandatory.

The LLM must access enterprise operations through MCP tools.

Do not give the LLM direct database credentials.

Conceptual architecture:

```text
LLM
  ↓
MCP Client
  ↓
MCP Server
  ↓
Application Services
  ↓
PostgreSQL
```

---

# 29. Required MCP Tools

Implement a focused MCP tool set.

## search_knowledge_base

Purpose:

Find similar historical issues/resolutions.

Input:

```json
{
  "query": "semester fee paid but payment not reflected"
}
```

Output:

```json
{
  "matches": [
    {
      "category": "Fees",
      "resolution": "Verify transaction status and synchronize the payment record.",
      "similarity": 0.91
    }
  ]
}
```

If a real vector database is not available, use a simple PostgreSQL/text similarity implementation or seeded historical tickets.

Do not introduce unnecessary infrastructure.

---

## create_ticket

Input:

```json
{
  "student_id": "uuid",
  "title": "Payment not reflected",
  "description": "I paid my semester fees but the payment is not reflected.",
  "category_id": "uuid",
  "department_id": "uuid",
  "priority": "HIGH"
}
```

Output:

```json
{
  "ticket_id": "uuid",
  "ticket_number": "TKT-1001",
  "status": "AI_ANALYZED"
}
```

---

## get_staff_capacity

Input:

```json
{
  "department_id": "uuid"
}
```

Output:

```json
{
  "department": "Finance",
  "staff": [
    {
      "staff_id": "uuid",
      "name": "Finance Staff 01",
      "active_tickets": 6,
      "high_priority_tickets": 2,
      "max_capacity": 10,
      "remaining_capacity": 4,
      "is_available": true
    }
  ]
}
```

---

## assign_ticket

Input:

```json
{
  "ticket_id": "uuid",
  "staff_id": "uuid",
  "assignment_method": "AI_MCP",
  "reason": "Lowest active workload among available Finance staff."
}
```

Output:

```json
{
  "ticket_id": "uuid",
  "staff_id": "uuid",
  "status": "ASSIGNED"
}
```

---

## get_ticket

Input:

```json
{
  "ticket_id": "uuid"
}
```

Output: complete ticket summary.

---

## update_ticket_status

Input:

```json
{
  "ticket_id": "uuid",
  "status": "IN_PROGRESS",
  "reason": "Staff started investigating the issue."
}
```

The service must:

1. Validate the transition.
2. Update ticket status.
3. Record status history.
4. Trigger notification handling.

---

## add_ticket_comment

Input:

```json
{
  "ticket_id": "uuid",
  "comment": "We are checking the payment transaction."
}
```

---

## reassign_ticket

Input:

```json
{
  "ticket_id": "uuid",
  "staff_id": "uuid",
  "reason": "Current staff reached capacity."
}
```

---

# 30. Staff Assignment Algorithm

Assignment must be capacity-aware.

Only consider staff where:

```text
is_available = true
```

and:

```text
active_tickets < max_capacity
```

Select the staff member using:

```text
1. Lowest active ticket count
2. Lowest high-priority ticket count
3. Lowest staff ID as deterministic final tie-breaker
```

Equivalent ordering:

```text
ORDER BY
    active_ticket_count ASC,
    high_priority_ticket_count ASC,
    staff_id ASC
```

Do not select unavailable or full staff.

If no eligible staff exists:

```text
ticket.status = MANUAL_TRIAGE
```

---

# 31. Concurrency Requirement

Staff assignment must be transaction-safe.

Do not implement:

```text
SELECT least_loaded_staff

then later

INSERT assignment
```

without transaction protection.

Two simultaneous tickets could select the same staff member.

Use a database transaction and appropriate row locking/transaction isolation where practical.

The assignment operation must behave atomically:

```text
BEGIN
  lock workload/assignment decision
  determine eligible staff
  create assignment
  update ticket
COMMIT
```

If assignment fails, the ticket must not be left in an invalid partially assigned state.

---

# 32. Ticket Lifecycle

Valid primary workflow:

```text
NEW
  ↓
AI_ANALYZED
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

Manual triage:

```text
NEW
  ↓
AI_ANALYZED
  ↓
MANUAL_TRIAGE
  ↓
ASSIGNED
```

Reopen:

```text
RESOLVED
  ↓
REOPENED
  ↓
ASSIGNED
```

Every status change must create a `ticket_status_history` record.

---

# 33. Notification Workflow

When a relevant ticket event occurs:

```text
Ticket event
  ↓
Create notification record
  ↓
Attempt email
  ↓
SENT or FAILED
```

Never lose the business ticket state because an email failed.

Example:

```text
Ticket assignment succeeds
Email fails
```

Expected:

```text
Ticket = ASSIGNED
Notification = FAILED
```

The notification error should be recorded.

The ticket should not be rolled back solely because email failed.

---

# 34. Student Experience

Student dashboard must show:

* Ticket number
* Title
* Category
* Department
* Priority
* Status
* Assigned staff
* AI confidence
* Created date
* Last updated date
* Comments
* Status history

Ticket creation form:

```text
Title
Description
Attachment
Submit
```

After submission, show AI analysis:

```text
Category: Fees
Department: Finance
Priority: HIGH
Confidence: 96%
```

Then show assignment:

```text
Assigned to: Finance Staff 02
```

---

# 35. Staff Experience

Staff dashboard:

```text
My Tickets
```

Show:

* Ticket number
* Category
* Priority
* Student issue
* Status
* Created time
* SLA/age if implemented

Ticket details allow:

* Comment
* Start work
* Resolve
* Reassign

Keep UI simple.

---

# 36. Admin Experience

Admin dashboard should show:

```text
Total Tickets
Open Tickets
In Progress
Resolved
Manual Triage
```

Department distribution:

```text
Finance
Exam Cell
Hostel
Placement
Scholarship
IT Support
Admission
Transport
```

If time permits, show staff workload:

```text
Staff       Active    Capacity
Staff 01       3        10
Staff 02       6        10
Staff 03       2        10
```

Admin should be able to manage:

* Departments
* Categories
* Routing rules
* Staff capacity
* Staff availability

---

# 37. REST API Contract

Implement REST APIs under `/api/v1`.

## Authentication

### POST `/api/v1/auth/login`

Request:

```json
{
  "email": "student@example.com",
  "password": "password"
}
```

Response:

```json
{
  "access_token": "jwt-token",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "full_name": "Demo Student",
    "email": "student@example.com",
    "role": "STUDENT"
  }
}
```

---

# 38. Student Ticket APIs

## POST `/api/v1/tickets`

Request:

```json
{
  "title": "Payment not reflected",
  "description": "I paid my semester fees but the payment is not reflected in the portal."
}
```

Response:

```json
{
  "id": "uuid",
  "ticket_number": "TKT-1001",
  "title": "Payment not reflected",
  "description": "I paid my semester fees but the payment is not reflected in the portal.",
  "category": {
    "code": "FEES",
    "name": "Fees"
  },
  "department": {
    "code": "FINANCE",
    "name": "Finance"
  },
  "priority": "HIGH",
  "confidence": 0.96,
  "status": "ASSIGNED",
  "assigned_staff": {
    "id": "uuid",
    "name": "Finance Staff 02"
  }
}
```

---

## GET `/api/v1/tickets`

Students see their own tickets.

Staff see assigned tickets.

Admins see all tickets subject to role authorization.

---

## GET `/api/v1/tickets/{ticket_id}`

Returns:

```json
{
  "id": "uuid",
  "ticket_number": "TKT-1001",
  "title": "Payment not reflected",
  "description": "...",
  "category": "Fees",
  "department": "Finance",
  "priority": "HIGH",
  "confidence": 0.96,
  "status": "IN_PROGRESS",
  "assigned_staff": {
    "id": "uuid",
    "name": "Finance Staff 02"
  },
  "comments": [],
  "status_history": [],
  "attachments": []
}
```

---

# 39. Comment API

## POST `/api/v1/tickets/{ticket_id}/comments`

Request:

```json
{
  "comment": "We are checking your payment transaction."
}
```

Response:

```json
{
  "id": "uuid",
  "ticket_id": "uuid",
  "author": {
    "id": "uuid",
    "name": "Finance Staff 02"
  },
  "comment": "We are checking your payment transaction.",
  "created_at": "2026-09-07T10:00:00Z"
}
```

---

# 40. Status API

## PATCH `/api/v1/tickets/{ticket_id}/status`

Request:

```json
{
  "status": "IN_PROGRESS",
  "reason": "Staff started investigating."
}
```

Response:

```json
{
  "ticket_id": "uuid",
  "ticket_number": "TKT-1001",
  "old_status": "ASSIGNED",
  "new_status": "IN_PROGRESS"
}
```

The backend must validate legal state transitions.

---

# 41. Reopen API

## POST `/api/v1/tickets/{ticket_id}/reopen`

Request:

```json
{
  "reason": "The issue is still not resolved."
}
```

Response:

```json
{
  "ticket_number": "TKT-1001",
  "status": "REOPENED"
}
```

---

# 42. Reassignment API

## POST `/api/v1/tickets/{ticket_id}/reassign`

Request:

```json
{
  "staff_id": "uuid",
  "reason": "Staff reached capacity."
}
```

Response:

```json
{
  "ticket_number": "TKT-1001",
  "assigned_staff_id": "uuid",
  "status": "ASSIGNED"
}
```

---

# 43. Department APIs

## GET `/api/v1/departments`

Returns active departments.

## POST `/api/v1/departments`

Admin only.

Request:

```json
{
  "name": "Finance",
  "code": "FINANCE",
  "description": "Handles student fee-related requests."
}
```

## PATCH `/api/v1/departments/{department_id}`

Admin only.

---

# 44. Routing APIs

## GET `/api/v1/routing-rules`

Admin only.

## POST `/api/v1/routing-rules`

Admin only.

Request:

```json
{
  "category_id": "uuid",
  "department_id": "uuid",
  "priority": "HIGH",
  "confidence_threshold": 0.75
}
```

---

# 45. Staff APIs

## GET `/api/v1/staff`

Admin only.

## GET `/api/v1/staff/me/tickets`

Staff only.

## PATCH `/api/v1/staff/{staff_id}/capacity`

Admin only.

Request:

```json
{
  "max_capacity": 10
}
```

## PATCH `/api/v1/staff/{staff_id}/availability`

Admin only.

Request:

```json
{
  "is_available": true
}
```

---

# 46. Dashboard API

## GET `/api/v1/dashboard/summary`

Admin only.

Example response:

```json
{
  "total_tickets": 124,
  "new": 10,
  "manual_triage": 4,
  "assigned": 20,
  "in_progress": 18,
  "resolved": 60,
  "closed": 12,
  "reopened": 2,
  "departments": [
    {
      "department": "IT Support",
      "ticket_count": 34
    },
    {
      "department": "Finance",
      "ticket_count": 21
    }
  ]
}
```

---

# 47. AI API

## POST `/api/v1/ai/analyze`

Request:

```json
{
  "text": "I paid my semester fees but payment is not reflected."
}
```

Response:

```json
{
  "category": "Fees",
  "department": "Finance",
  "priority": "HIGH",
  "confidence": 0.96,
  "model": {
    "type": "LLM",
    "version": "configured-model"
  },
  "reason": "The request concerns a completed fee payment that is not reflected."
}
```

This endpoint may be internal/private if analysis is automatically performed during ticket creation.

---

# 48. Error Contract

Use consistent error responses.

Example:

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket was not found."
  }
}
```

Common codes:

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
TICKET_NOT_FOUND
STAFF_NOT_FOUND
NO_AVAILABLE_STAFF
INVALID_STATUS_TRANSITION
AI_UNAVAILABLE
LOW_AI_CONFIDENCE
DEPARTMENT_NOT_FOUND
```

Use appropriate HTTP status codes:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
503 Service Unavailable
```

---

# 49. Knowledge Base / Historical Resolution

The original concept includes resolving repetitive issues from past queries.

Implement a lightweight POC knowledge mechanism.

Historical records should contain:

```text
issue
category
department
resolution
```

Example:

```text
Issue:
Semester fee payment completed but not reflected.

Resolution:
Verify transaction status and synchronize payment record.

Category:
Fees

Department:
Finance
```

The LLM can use the retrieved historical resolution to suggest a solution.

Do not introduce a heavyweight vector database unless it is already available.

For the POC, PostgreSQL text search, TF-IDF similarity, or another lightweight retrieval approach is sufficient.

---

# 50. Optional Conversational Resolution Flow

If implementing the chatbot experience, use:

```text
Student:
"My fee payment isn't showing."

AI:
"I found a similar issue. The previous resolution was to verify the transaction status and synchronize the payment record. Would you like to try this?"

Student:
"No, it still isn't resolved."

AI:
"I'll create and route a ticket to the Finance team."
```

Then proceed with:

```text
AI analysis
→ ticket
→ MCP
→ assignment
→ staff
```

This conversational flow is desirable but must not delay the core ticket pipeline.

---

# 51. Manual Triage

Manual Triage is required for:

```text
confidence < threshold
```

or:

```text
AI service unavailable
```

Manual Triage queue should show:

```text
Ticket number
Description
AI prediction
Confidence
Created time
```

Admin can manually set:

```text
Category
Department
Priority
Staff assignment
```

After manual correction, save the corrected result.

This correction is useful for later model evaluation.

---

# 52. Model Evaluation

Create an evaluation script.

Metrics:

```text
Accuracy
Macro F1
Routing Accuracy
```

Category classification:

```text
actual_category
vs
predicted_category
```

Routing accuracy:

```text
predicted_department
vs
expected_department
```

Generate a simple report.

Example:

```text
Model Evaluation

Accuracy: 0.91
Macro F1: 0.89
Routing Accuracy: 0.94
```

Do not fabricate metrics.

Only display metrics generated from the actual synthetic evaluation dataset.

---

# 53. Security Requirements

Even though this is a POC:

* Never commit API keys.
* Never commit JWT secrets.
* Never commit database passwords.
* Use environment variables.
* Hash passwords.
* Validate JWT tokens.
* Enforce role authorization.
* Validate uploaded files.
* Restrict attachment size.
* Do not expose arbitrary filesystem paths.
* Validate all user input.
* Do not expose stack traces to API clients.

---

# 54. Privacy

Use synthetic data.

Never include real:

* Student names
* Student IDs
* Passwords
* Payment references
* Academic records
* Personal contact details
* Private documents

The README should explicitly state that the dataset is synthetic/anonymized.

---

# 55. Enterprise Edge Cases

The implementation should account for these three key trade-offs.

## Edge Case 1: Concurrent assignment

Two tickets arrive simultaneously.

Both might see the same staff member as least loaded.

Solution:

* Database transaction
* Row locking or equivalent transaction-safe assignment
* Atomic assignment

---

## Edge Case 2: Low AI confidence

AI predicts:

```text
category = Fees
confidence = 0.54
```

Do not automatically route.

Instead:

```text
MANUAL_TRIAGE
```

This demonstrates human-in-the-loop governance.

---

## Edge Case 3: Email failure

Ticket assignment succeeds but email fails.

Expected:

```text
ticket = ASSIGNED
notification = FAILED
```

Do not roll back the ticket.

Record the error and allow notification retry later.

---

# 56. Four Team Workstreams

## Member 1 — AI/ML + LLM

Own:

```text
ml/
backend/app/ai/
```

Responsibilities:

* Synthetic dataset
* TF-IDF
* Logistic Regression
* Model training
* Model inference
* Accuracy
* Macro F1
* Routing accuracy
* LLM integration
* Prompt design
* Structured AI output
* Confidence
* Historical resolution retrieval logic

Interface:

```text
analyze_ticket(text)
```

Expected result:

```json
{
  "category": "Fees",
  "department": "Finance",
  "priority": "HIGH",
  "confidence": 0.96,
  "reason": "..."
}
```

Member 1 must not directly modify database records.

---

# 57. Member 2 — Backend + Database

Own:

```text
backend/app/database/
backend/app/api/
backend/app/tickets/
backend/app/auth/
```

Responsibilities:

* PostgreSQL
* SQLAlchemy
* Database models
* Migrations
* Seed data
* FastAPI
* JWT
* Role authorization
* Ticket lifecycle
* Comments
* Status history
* Attachments
* Notifications
* REST APIs

Member 2 owns the database source of truth.

---

# 58. Member 3 — MCP + Routing

Own:

```text
mcp-server/
backend/app/routing/
backend/app/mcp/
```

Responsibilities:

* MCP server
* MCP tools
* Staff capacity calculation
* Assignment algorithm
* Concurrency-safe assignment
* Reassignment
* Manual triage integration
* MCP integration with backend services

Member 3 must not create a second database.

Use Member 2's backend/database.

---

# 59. Member 4 — Frontend + Integration

Own:

```text
frontend/
```

Responsibilities:

* React
* Bootstrap
* Login
* Student dashboard
* Ticket creation
* Ticket tracking
* AI result display
* Staff dashboard
* Ticket details
* Comments
* Status controls
* Admin dashboard
* Workload visualization
* API integration
* Demo polish

Member 4 must consume backend APIs instead of duplicating business logic.

---

# 60. Parallel Development Contract

Before implementation, all team members must agree on:

```text
1. Database schema
2. REST API contract
3. AI JSON contract
4. MCP tool contract
```

Do not change these contracts casually during implementation.

If a contract must change:

1. Update this context.
2. Update the relevant API/schema documentation.
3. Notify affected workstreams.
4. Update tests.

---

# 61. Six-Hour Execution Strategy

## 0–30 minutes

Freeze:

* Architecture
* ER model
* API contract
* AI contract
* MCP contract

Create repository structure.

---

## 30–120 minutes

Member 1:

```text
ML + LLM
```

Member 2:

```text
Database + FastAPI + JWT
```

Member 3:

```text
MCP + routing
```

Member 4:

```text
React UI
```

All work in parallel.

---

## 120–240 minutes

Integrate:

```text
Student
 ↓
API
 ↓
AI
 ↓
MCP
 ↓
Routing
 ↓
Staff
```

At the end of this period, the core flow must work.

---

## 240–300 minutes

Add:

* Email
* Comments
* Status history UI
* Manual triage
* Reassignment
* Admin dashboard
* Attachment support if time permits

---

## 300–330 minutes

Run end-to-end tests.

---

## 330–360 minutes

Stop adding features.

Only:

* Bug fixing
* UI polish
* Demo data
* Docker validation
* README
* Demo rehearsal

---

# 62. MVP Priority

## P0 — Mandatory

```text
Student login
Create ticket
AI prediction
Category
Department
Priority
Confidence
Low-confidence fallback
MCP integration
Capacity-aware assignment
Staff login
Staff ticket list
Status updates
Resolution
Student tracking
Email notification
```

## P1 — Important

```text
Comments
Reassignment
Admin dashboard
Manual triage UI
Attachments
Routing configuration
Staff capacity management
```

## P2 — Optional

```text
Advanced analytics
Complex vector database
Real-time WebSockets
Voice
WhatsApp
Slack
SSO
Multi-tenancy
Kubernetes
Microservices
Fine-tuned LLM
Cloud object storage
```

Never sacrifice the P0 workflow for P2 functionality.

---

# 63. Demo Scenario

The primary demo should use this request:

```text
I paid my semester fees, but the payment is not reflected in the portal.
```

Expected AI:

```text
Category: Fees
Department: Finance
Priority: HIGH
Confidence: high
```

Then show staff workload:

```text
Finance Staff 01
Active: 6
High Priority: 2
Capacity: 10

Finance Staff 02
Active: 3
High Priority: 1
Capacity: 10

Finance Staff 03
Active: 3
High Priority: 2
Capacity: 10
```

Select Staff 02.

Show MCP operation:

```text
get_staff_capacity()
        ↓
assign_ticket()
```

Ticket:

```text
TKT-1001
Category: Fees
Department: Finance
Priority: HIGH
Assigned: Finance Staff 02
Status: ASSIGNED
```

Staff updates:

```text
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
```

Student receives status updates.

Student closes the ticket.

---

# 64. Secondary Demo Scenario

Use:

```text
I am unable to connect to the college Wi-Fi in Lab 3.
```

Expected:

```text
Category: IT / Network
Department: IT Support
Priority: MEDIUM
```

This demonstrates that the routing system is not hard-coded to Finance.

---

# 65. Low-Confidence Demo

Use an intentionally ambiguous request:

```text
I have a problem with something and don't know which office can help.
```

Expected:

```text
Confidence < threshold
        ↓
MANUAL_TRIAGE
```

Show the admin triage queue.

This demonstrates responsible AI rather than blindly trusting AI output.

---

# 66. Coding Standards

Follow the language's official style guidelines.

Python:

* PEP 8
* Type hints
* Pydantic models
* Small functions
* Clear service boundaries
* Meaningful names
* Explicit error handling
* Docstrings for public APIs/services
* Minimal comments

Comments should explain WHY, not WHAT.

Do not add comments explaining obvious code.

Avoid giant functions.

Avoid duplicated business logic.

---

# 67. Backend Architecture

Prefer this pattern:

```text
API Router
    ↓
Service
    ↓
Repository / Database
```

For example:

```text
POST /tickets
    ↓
TicketService.create_ticket()
    ↓
AIService.analyze()
    ↓
RoutingService.route()
    ↓
TicketRepository
```

Do not put all business logic inside FastAPI route handlers.

---

# 68. Frontend Architecture

Use:

```text
Pages
  ↓
Components
  ↓
API Services
  ↓
Backend
```

Keep API calls centralized.

Do not duplicate ticket state/business rules throughout components.

---

# 69. Error Handling

Errors must be meaningful.

Backend:

```text
try:
    operation
except expected_exception:
    return structured API error
```

Do not silently swallow errors.

Do not return raw exception traces.

Log useful server-side details.

---

# 70. Testing Requirements

At minimum implement tests for:

## Authentication

```text
valid login
invalid login
role authorization
```

## Ticket creation

```text
student creates ticket
invalid input rejected
```

## AI

```text
fees → Finance
examination → Exam Cell
hostel → Hostel Office
IT → IT Support
```

## Confidence

```text
high confidence → automatic routing
low confidence → manual triage
```

## Assignment

```text
least loaded staff selected
capacity respected
unavailable staff excluded
tie-break works
```

## Lifecycle

```text
ASSIGNED → IN_PROGRESS
IN_PROGRESS → RESOLVED
RESOLVED → CLOSED
RESOLVED → REOPENED
```

## Notifications

```text
status change creates notification
email failure recorded
```

---

# 71. Definition of Done

The project is considered POC-complete when this works:

```text
1. Student logs in.
2. Student creates a ticket.
3. AI analyzes the request.
4. Category is predicted.
5. Department is predicted.
6. Priority is determined.
7. Confidence is recorded.
8. Low confidence goes to Manual Triage.
9. High confidence goes to automatic routing.
10. MCP retrieves staff capacity.
11. Best available staff is selected.
12. Ticket is assigned.
13. Student sees assignment.
14. Staff logs in.
15. Staff sees assigned ticket.
16. Staff changes status.
17. Status history is recorded.
18. Student sees updated status.
19. Staff resolves ticket.
20. Student closes or reopens ticket.
21. Email notification is generated.
```

If these 21 steps work, the hackathon POC is successful.

---

# 72. Non-Goals

Do not implement unless specifically requested:

* Production SSO
* Enterprise IAM integration
* Kubernetes
* Microservices
* Kafka
* Redis
* Complex event streaming
* Multi-region deployment
* Advanced vector infrastructure
* Fine-tuning
* Real college data
* Payment gateway integration
* Real academic systems
* Production-grade file storage
* Mobile applications

The goal is a convincing working POC.

---

# 73. Judge-Facing Technical Story

Use this narrative:

> "Our system combines classical machine learning, an LLM, and MCP rather than treating the LLM as the entire application."

Explain:

```text
TF-IDF + Logistic Regression
    ↓
Measurable classification baseline

LLM
    ↓
Natural language understanding and reasoning

MCP
    ↓
Controlled access to enterprise operations

Routing Engine
    ↓
Capacity-aware staff assignment

PostgreSQL
    ↓
Auditable system of record
```

The key enterprise properties are:

* Explainability
* Human-in-the-loop fallback
* Capacity-aware routing
* Audit history
* Transaction-safe assignment
* Notification reliability
* Role-based access
* Privacy-aware synthetic data

---

# 74. Architectural Principles

Always follow these principles:

1. Backend is the source of truth.
2. Database state must be consistent.
3. LLM output must be validated.
4. MCP tools must be controlled.
5. Low-confidence AI must not automatically route.
6. Staff capacity must be respected.
7. Assignment must be concurrency-safe.
8. Status changes must be auditable.
9. Email failure must not corrupt ticket state.
10. Sensitive data must not be used in the POC.
11. Business logic belongs in services, not UI.
12. Keep the implementation simple enough to finish the hackathon.

---

# 75. Implementation Instruction for Codex

When implementing this project:

1. Inspect the existing repository before changing anything.
2. Preserve useful existing code.
3. Do not rewrite working modules unnecessarily.
4. Create the database schema/migrations first.
5. Implement backend contracts next.
6. Implement AI/ML interfaces.
7. Implement MCP tools.
8. Implement routing.
9. Integrate frontend.
10. Add tests.
11. Run the complete application.
12. Fix integration issues before adding optional features.

When requirements conflict, prioritize:

```text
1. This PROJECT_CONTEXT.md
2. Existing repository conventions
3. Explicit user instructions
4. Simplicity required by the 6-hour POC
```

Never invent unspecified enterprise requirements.

Never add unnecessary infrastructure.

Never expose secrets.

Never use real student data.

---

# 76. Final End-to-End Architecture

```text
                         ┌──────────────────────┐
                         │       STUDENT        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         └──────────┬───────────┘
                                    │ REST
                                    ▼
                         ┌──────────────────────┐
                         │      FastAPI         │
                         │    Application       │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
              ┌──────────┐   ┌───────────┐   ┌────────────┐
              │   LLM    │   │ ML Model  │   │ PostgreSQL │
              │          │   │ TF-IDF +  │   │            │
              │ NLP/AI   │   │ Logistic  │   │ System of  │
              └────┬─────┘   └─────┬─────┘   │ Record     │
                   │               │           └─────┬──────┘
                   └───────┬───────┘                 │
                           │                         │
                           ▼                         │
                    ┌──────────────┐                 │
                    │ MCP Server   │                 │
                    └──────┬───────┘                 │
                           │                         │
               ┌───────────┼────────────┐            │
               ▼           ▼            ▼            │
          Ticket Tool  Capacity Tool  Status Tool    │
               │           │            │            │
               └───────────┼────────────┘            │
                           ▼                         │
                    ┌──────────────┐                 │
                    │Routing Engine│─────────────────┘
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Staff Member │
                    └──────┬───────┘
                           │
                           ▼
                    Ticket Resolution
                           │
                           ▼
                    Notification Service
                           │
                           ▼
                         Email
```

---

# 77. Success Criteria

The POC should make the following statement demonstrably true:

> A student can submit a natural-language request, the system can understand and classify it using AI/ML, determine its priority and department with confidence, automatically route it through MCP to an available staff member based on workload/capacity, allow staff to resolve it, allow the student to track or reopen it, and maintain an auditable history with status notifications.

That is the product.

Everything else is secondary.

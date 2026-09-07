from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .database.session import init_db
from .api.v1 import auth, tickets, departments, staff, routing_rules, dashboard

app = FastAPI(
    title="NexSolve Smart Ticket System",
    description="AI-powered student support ticket auto-assignment.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."}},
    )


app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(tickets.router, prefix="/api/v1/tickets", tags=["Tickets"])
app.include_router(departments.router, prefix="/api/v1/departments", tags=["Departments"])
app.include_router(staff.router, prefix="/api/v1/staff", tags=["Staff"])
app.include_router(routing_rules.router, prefix="/api/v1/routing-rules", tags=["Routing Rules"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["Dashboard"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "nexsolve-backend"}

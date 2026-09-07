from pydantic import BaseModel, Field, field_validator
from typing import Optional

VALID_CATEGORIES = {
    "Fees", "Examination", "Hostel", "Placement",
    "Scholarship", "IT / Network", "Admission", "Transport"
}

VALID_DEPARTMENTS = {
    "Finance", "Exam Cell", "Hostel Office", "Placement Cell",
    "Scholarship Office", "IT Support", "Admission Office", "Transport Office"
}

VALID_PRIORITIES = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}

CATEGORY_TO_DEPT = {
    "Fees": "Finance",
    "Examination": "Exam Cell",
    "Hostel": "Hostel Office",
    "Placement": "Placement Cell",
    "Scholarship": "Scholarship Office",
    "IT / Network": "IT Support",
    "Admission": "Admission Office",
    "Transport": "Transport Office",
}

CATEGORY_TO_PRIORITY = {
    "Fees": "HIGH",
    "Examination": "HIGH",
    "Hostel": "MEDIUM",
    "Placement": "MEDIUM",
    "Scholarship": "LOW",
    "IT / Network": "MEDIUM",
    "Admission": "LOW",
    "Transport": "LOW",
}


class TicketPrediction(BaseModel):
    """Structured AI prediction output. Validated against allowed values."""
    category: str
    department: str
    priority: str
    confidence: float = Field(ge=0.0, le=1.0)
    reason: str
    model_type: str
    model_version: str

    @field_validator("category")
    @classmethod
    def validate_category(cls, v: str) -> str:
        if v not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category: {v}. Must be one of {VALID_CATEGORIES}")
        return v

    @field_validator("department")
    @classmethod
    def validate_department(cls, v: str) -> str:
        if v not in VALID_DEPARTMENTS:
            raise ValueError(f"Invalid department: {v}. Must be one of {VALID_DEPARTMENTS}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority: {v}. Must be one of {VALID_PRIORITIES}")
        return v


class ResolutionSuggestion(BaseModel):
    resolution: str
    similarity: float = Field(ge=0.0, le=1.0)


class AIAnalyzeRequest(BaseModel):
    title: str
    description: str


class AIAnalyzeResponse(BaseModel):
    category: str
    department: str
    priority: str
    confidence: float
    reason: str
    model_type: str
    model_version: str
    resolution_suggestion: Optional[ResolutionSuggestion] = None

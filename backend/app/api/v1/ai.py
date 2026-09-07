"""
AI analysis endpoint.
POST /api/v1/ai/analyze — analyze ticket text and return prediction.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...database.session import get_db
from ...core.dependencies import get_current_user
from ...database.models import User
from ...ai.schemas import AIAnalyzeRequest, AIAnalyzeResponse
from ...ai.service import AIService

router = APIRouter()
_ai_service = AIService()


@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_ticket(
    body: AIAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Analyze ticket text and return AI prediction. Does NOT persist — caller persists."""
    prediction = _ai_service.analyze_ticket(body.title, body.description)
    resolution = _ai_service.suggest_resolution(f"{body.title} {body.description}")
    return AIAnalyzeResponse(
        category=prediction.category,
        department=prediction.department,
        priority=prediction.priority,
        confidence=prediction.confidence,
        reason=prediction.reason,
        model_type=prediction.model_type,
        model_version=prediction.model_version,
        resolution_suggestion=resolution,
    )

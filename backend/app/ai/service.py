"""
AIService — unified interface for Person 2 and Person 3 to call.

Usage:
    from backend.app.ai.service import AIService
    service = AIService()
    prediction = service.analyze_ticket(title, description)

The caller (Person 2 backend) is responsible for:
- Persisting the prediction to ai_predictions table
- Applying confidence threshold
- Routing via Person 3 MCP
"""
import logging
import os
from typing import Optional

from .schemas import TicketPrediction, CATEGORY_TO_DEPT, CATEGORY_TO_PRIORITY, ResolutionSuggestion
from .ml_classifier import get_classifier
from .llm_classifier import get_llm_classifier
from .knowledge_base import get_knowledge_base

logger = logging.getLogger(__name__)

AI_MODE = os.environ.get("AI_MODE", "hybrid")  # ml | llm | hybrid
AI_CONFIDENCE_THRESHOLD = float(os.environ.get("AI_CONFIDENCE_THRESHOLD", "0.75"))


class AIService:
    """
    Unified AI prediction service.

    AI_MODE=ml       -> ML only
    AI_MODE=llm      -> LLM only (falls back to ML)
    AI_MODE=hybrid   -> ML first; if confidence < threshold, escalate to LLM
    """

    def analyze_ticket(
        self,
        title: str,
        description: str,
    ) -> TicketPrediction:
        """
        Main entry point. Always returns a TicketPrediction.
        Falls back to MANUAL_TRIAGE signal via low confidence if all classifiers fail.
        """
        title = (title or "").strip()
        description = (description or "").strip()

        prediction = self._classify(title, description)
        return prediction

    def suggest_resolution(self, ticket_text: str) -> Optional[ResolutionSuggestion]:
        """Optional: find historical resolution for similar past tickets."""
        try:
            return get_knowledge_base().suggest(ticket_text)
        except Exception as e:
            logger.warning(f"Knowledge base lookup failed: {e}")
            return None

    def _classify(self, title: str, description: str) -> TicketPrediction:
        if AI_MODE == "llm":
            return self._llm_with_fallback(title, description)
        elif AI_MODE == "ml":
            return self._ml_predict(title, description)
        else:  # hybrid (default)
            return self._hybrid(title, description)

    def _hybrid(self, title: str, description: str) -> TicketPrediction:
        """ML first. If ML confidence < threshold, try LLM. Fall back to low-confidence ML."""
        ml_prediction = self._ml_predict(title, description)
        if ml_prediction.confidence >= AI_CONFIDENCE_THRESHOLD:
            return ml_prediction
        # Low ML confidence — try LLM for better accuracy
        llm_prediction = get_llm_classifier().predict(title, description)
        if llm_prediction is not None:
            return llm_prediction
        # Both uncertain — return ML result with low confidence (backend will MANUAL_TRIAGE)
        return ml_prediction

    def _llm_with_fallback(self, title: str, description: str) -> TicketPrediction:
        llm = get_llm_classifier().predict(title, description)
        if llm is not None:
            return llm
        return self._ml_predict(title, description)

    def _ml_predict(self, title: str, description: str) -> TicketPrediction:
        """ML inference. Returns low-confidence fallback prediction on model failure."""
        try:
            return get_classifier().predict(title, description)
        except FileNotFoundError:
            logger.error("ML model not trained. Run: python -m ml.train")
            return self._manual_triage_fallback()
        except Exception as e:
            logger.error(f"ML prediction failed: {e}")
            return self._manual_triage_fallback()

    def _manual_triage_fallback(self) -> TicketPrediction:
        """When all classifiers fail — return a low-confidence prediction so backend triggers MANUAL_TRIAGE."""
        return TicketPrediction(
            category="IT / Network",  # safe default; backend will override via MANUAL_TRIAGE
            department="IT Support",
            priority="MEDIUM",
            confidence=0.0,  # forces MANUAL_TRIAGE in backend
            reason="AI classification unavailable. Manual triage required.",
            model_type="FALLBACK",
            model_version="fallback-v1",
        )

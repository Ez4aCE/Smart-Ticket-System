"""
LLM-based ticket classifier.
Configured via environment variables. Falls back gracefully on any failure.
"""
import json
import logging
import os
from typing import Optional

from .schemas import TicketPrediction, VALID_CATEGORIES, VALID_DEPARTMENTS, VALID_PRIORITIES, CATEGORY_TO_DEPT

logger = logging.getLogger(__name__)

LLM_API_KEY = os.environ.get("LLM_API_KEY", "")
LLM_MODEL = os.environ.get("LLM_MODEL", "gemini-3.5-flash")
LLM_TIMEOUT = int(os.environ.get("LLM_TIMEOUT", "10"))
AI_PROVIDER = os.environ.get("AI_PROVIDER", "gemini")

MODEL_TYPE = "LLM"

SYSTEM_PROMPT = """You are a student support ticket classifier for a university portal.

You must classify tickets into EXACTLY one of these categories:
Fees, Examination, Hostel, Placement, Scholarship, IT / Network, Admission, Transport

Department mapping (fixed, do not deviate):
- Fees -> Finance
- Examination -> Exam Cell
- Hostel -> Hostel Office
- Placement -> Placement Cell
- Scholarship -> Scholarship Office
- IT / Network -> IT Support
- Admission -> Admission Office
- Transport -> Transport Office

Priority must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL

Rules:
1. Return ONLY valid JSON. No prose before or after.
2. Never invent categories or departments.
3. Never assign staff.
4. Never access databases.
5. Confidence must be a float 0.0-1.0.
6. Reason must be one short sentence.

Return this exact JSON schema:
{"category": "...", "department": "...", "priority": "...", "confidence": 0.0, "reason": "..."}"""


class LLMClassifier:
    """Calls an LLM API to classify tickets. Fails gracefully."""

    def predict(self, title: str, description: str) -> Optional[TicketPrediction]:
        """Returns prediction or None on any failure."""
        if not LLM_API_KEY:
            logger.warning("LLM_API_KEY not set — skipping LLM classification")
            return None
        try:
            return self._call_llm(title, description)
        except Exception as exc:
            logger.warning(f"LLM classification failed: {exc}")
            return None

    def _call_llm(self, title: str, description: str) -> Optional[TicketPrediction]:
        user_message = f"Title: {title}\nDescription: {description}"

        if AI_PROVIDER == "gemini":
            return self._call_gemini(user_message)
        elif AI_PROVIDER == "openai":
            return self._call_openai(user_message)
        else:
            logger.warning(f"Unknown AI_PROVIDER: {AI_PROVIDER}")
            return None

    def _call_gemini(self, user_message: str) -> Optional[TicketPrediction]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=LLM_API_KEY)
            model = genai.GenerativeModel(LLM_MODEL)
            prompt = f"{SYSTEM_PROMPT}\n\nTicket to classify:\n{user_message}"
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return self._parse_response(response.text)
        except ImportError:
            logger.warning("google-generativeai not installed — LLM unavailable")
            return None

    def _call_openai(self, user_message: str) -> Optional[TicketPrediction]:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=LLM_API_KEY, timeout=LLM_TIMEOUT)
            response = client.chat.completions.create(
                model=LLM_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message},
                ],
                response_format={"type": "json_object"},
            )
            return self._parse_response(response.choices[0].message.content)
        except ImportError:
            logger.warning("openai not installed — LLM unavailable")
            return None

    def _parse_response(self, raw: str) -> Optional[TicketPrediction]:
        """Parse and validate LLM JSON response. Returns None on any parse/validation failure."""
        try:
            # Strip markdown fences if present
            text = raw.strip()
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1])
            data = json.loads(text)
        except (json.JSONDecodeError, Exception) as e:
            logger.warning(f"LLM response not valid JSON: {e}")
            return None

        # Validate fields
        category = data.get("category", "")
        department = data.get("department", "")
        priority = data.get("priority", "MEDIUM")
        confidence = data.get("confidence", 0.0)
        reason = data.get("reason", "LLM classification.")

        if category not in VALID_CATEGORIES:
            logger.warning(f"LLM returned invalid category: {category}")
            return None
        if department not in VALID_DEPARTMENTS:
            # Auto-correct department from category
            department = CATEGORY_TO_DEPT.get(category, "")
        if priority not in VALID_PRIORITIES:
            priority = "MEDIUM"
        try:
            confidence = float(confidence)
            confidence = max(0.0, min(1.0, confidence))
        except (TypeError, ValueError):
            confidence = 0.5

        return TicketPrediction(
            category=category,
            department=department,
            priority=priority,
            confidence=confidence,
            reason=str(reason)[:500],
            model_type=MODEL_TYPE,
            model_version=f"{AI_PROVIDER}/{LLM_MODEL}",
        )


_llm_classifier: Optional[LLMClassifier] = None


def get_llm_classifier() -> LLMClassifier:
    global _llm_classifier
    if _llm_classifier is None:
        _llm_classifier = LLMClassifier()
    return _llm_classifier

"""
ML-based ticket classifier using TF-IDF + Logistic Regression.
Loads pre-trained model artifact. Does NOT retrain on every request.
"""
import json
import pickle
import logging
from pathlib import Path
from typing import Optional

from .schemas import TicketPrediction, CATEGORY_TO_DEPT, CATEGORY_TO_PRIORITY

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).parent.parent.parent.parent / "ml" / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "model.pkl"
META_PATH = ARTIFACTS_DIR / "metadata.json"

MODEL_TYPE = "TFIDF_LOGISTIC_REGRESSION"


class MLClassifier:
    """Wraps the trained TF-IDF + LogReg pipeline for inference."""

    def __init__(self):
        self._pipeline = None
        self._metadata: dict = {}
        self._loaded = False

    def _load(self) -> None:
        if self._loaded:
            return
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {MODEL_PATH}. "
                "Run: python -m ml.train"
            )
        with open(MODEL_PATH, "rb") as f:
            self._pipeline = pickle.load(f)
        if META_PATH.exists():
            with open(META_PATH) as f:
                self._metadata = json.load(f)
        self._loaded = True
        logger.info(f"ML model loaded: {self._metadata.get('model_version', 'unknown')}")

    def _preprocess(self, text: str) -> str:
        if not text or not isinstance(text, str):
            return ""
        return " ".join(text.lower().split())

    def predict(self, title: str, description: str) -> TicketPrediction:
        """Run inference and return a validated TicketPrediction."""
        self._load()

        combined = self._preprocess(f"{title} {description}")
        if not combined.strip():
            combined = "unknown issue"

        proba = self._pipeline.predict_proba([combined])[0]
        classes = self._pipeline.classes_
        best_idx = proba.argmax()
        category = classes[best_idx]
        confidence = float(proba[best_idx])

        department = CATEGORY_TO_DEPT.get(category, "IT Support")
        priority = CATEGORY_TO_PRIORITY.get(category, "MEDIUM")
        version = self._metadata.get("model_version", "tfidf-logreg-v1")

        return TicketPrediction(
            category=category,
            department=department,
            priority=priority,
            confidence=confidence,
            reason=f"ML classifier predicted '{category}' with {confidence:.0%} confidence.",
            model_type=MODEL_TYPE,
            model_version=version,
        )


# Singleton — loaded once per process
_classifier: Optional[MLClassifier] = None


def get_classifier() -> MLClassifier:
    global _classifier
    if _classifier is None:
        _classifier = MLClassifier()
    return _classifier

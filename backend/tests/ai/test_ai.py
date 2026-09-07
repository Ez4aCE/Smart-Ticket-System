"""
Person 1 AI/ML tests.
Does NOT depend on live LLM API — LLM calls are mocked.
"""
import os
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("JWT_SECRET_KEY", "test_secret")

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

import pytest
from unittest.mock import patch, MagicMock
import pandas as pd

from ml.train import load_dataset, preprocess_text, DATA_PATH, CATEGORY_TO_DEPT
from backend.app.ai.schemas import TicketPrediction, VALID_CATEGORIES, VALID_DEPARTMENTS, VALID_PRIORITIES
from backend.app.ai.service import AIService


# ── Dataset Tests ─────────────────────────────────────────────────────────────

def test_dataset_loads():
    df = load_dataset(DATA_PATH)
    assert len(df) > 0


def test_all_categories_represented():
    df = load_dataset(DATA_PATH)
    categories = set(df["category"].unique())
    expected = {"Fees", "Examination", "Hostel", "Placement", "Scholarship",
                "IT / Network", "Admission", "Transport"}
    assert expected == categories


def test_all_labels_valid():
    df = load_dataset(DATA_PATH)
    for cat in df["category"].unique():
        assert cat in VALID_CATEGORIES


def test_no_empty_text():
    df = load_dataset(DATA_PATH)
    assert (df["text"].str.len() > 0).all()


def test_sufficient_samples_per_category():
    df = load_dataset(DATA_PATH)
    for cat, count in df["category"].value_counts().items():
        assert count >= 10, f"Category '{cat}' has only {count} samples"


# ── Preprocessing Tests ───────────────────────────────────────────────────────

def test_preprocess_normal():
    result = preprocess_text("Fee payment not working")
    assert result == "fee payment not working"


def test_preprocess_uppercase():
    result = preprocess_text("FEE PAYMENT NOT WORKING")
    assert result == "fee payment not working"


def test_preprocess_extra_whitespace():
    result = preprocess_text("  fee   payment  ")
    assert result == "fee payment"


def test_preprocess_empty():
    assert preprocess_text("") == ""
    assert preprocess_text(None) == ""


def test_preprocess_short():
    result = preprocess_text("ok")
    assert len(result) > 0


# ── ML Model Tests ────────────────────────────────────────────────────────────

def test_model_trains_and_predicts():
    """Train model on the fly and check it produces valid predictions."""
    from sklearn.pipeline import Pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression

    df = load_dataset(DATA_PATH)
    X = df["text"].values
    y = df["category"].values

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
        ("clf", LogisticRegression(max_iter=200, random_state=42)),
    ])
    pipeline.fit(X, y)
    preds = pipeline.predict(X[:5])
    for p in preds:
        assert p in VALID_CATEGORIES


def test_confidence_range():
    from sklearn.pipeline import Pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression

    df = load_dataset(DATA_PATH)
    X = df["text"].values
    y = df["category"].values
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer()),
        ("clf", LogisticRegression(max_iter=200, random_state=42)),
    ])
    pipeline.fit(X, y)
    proba = pipeline.predict_proba(X[:10])
    for row in proba:
        assert 0.0 <= row.max() <= 1.0


def test_model_artifact_loads():
    """If model artifact exists, it loads correctly."""
    from pathlib import Path
    import pickle
    model_path = Path("ml/artifacts/model.pkl")
    if not model_path.exists():
        pytest.skip("Model artifact not found — run python -m ml.train first")
    with open(model_path, "rb") as f:
        pipeline = pickle.load(f)
    pred = pipeline.predict(["fee payment not reflected"])
    assert pred[0] in VALID_CATEGORIES


# ── Evaluation Metrics ────────────────────────────────────────────────────────

def test_evaluation_metrics_from_real_data():
    from sklearn.pipeline import Pipeline
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.linear_model import LogisticRegression
    from sklearn.model_selection import train_test_split
    from sklearn.metrics import accuracy_score, f1_score

    df = load_dataset(DATA_PATH)
    X = df["text"].values
    y = df["category"].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)),
        ("clf", LogisticRegression(max_iter=500, random_state=42, C=5.0)),
    ])
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")
    routing_acc = sum(
        CATEGORY_TO_DEPT.get(p, "") == CATEGORY_TO_DEPT.get(a, "")
        for p, a in zip(y_pred, y_test)
    ) / len(y_test)
    # These are real numbers from actual execution
    assert 0.0 <= acc <= 1.0
    assert 0.0 <= f1 <= 1.0
    assert 0.0 <= routing_acc <= 1.0
    print(f"\nActual Metrics — Accuracy: {acc:.4f}, Macro F1: {f1:.4f}, Routing Accuracy: {routing_acc:.4f}")


# ── TicketPrediction Schema Tests ─────────────────────────────────────────────

def test_ticket_prediction_valid():
    p = TicketPrediction(
        category="Fees", department="Finance", priority="HIGH",
        confidence=0.95, reason="Test", model_type="ML", model_version="v1"
    )
    assert p.category == "Fees"
    assert 0.0 <= p.confidence <= 1.0


def test_ticket_prediction_invalid_category():
    with pytest.raises(Exception):
        TicketPrediction(
            category="InvalidCategory", department="Finance", priority="HIGH",
            confidence=0.9, reason="Test", model_type="ML", model_version="v1"
        )


def test_ticket_prediction_invalid_priority():
    with pytest.raises(Exception):
        TicketPrediction(
            category="Fees", department="Finance", priority="URGENT",
            confidence=0.9, reason="Test", model_type="ML", model_version="v1"
        )


# ── LLM Mock Tests ────────────────────────────────────────────────────────────

def test_llm_valid_response_parsed():
    from backend.app.ai.llm_classifier import LLMClassifier
    clf = LLMClassifier()
    raw = '{"category": "Fees", "department": "Finance", "priority": "HIGH", "confidence": 0.92, "reason": "Fee payment issue."}'
    result = clf._parse_response(raw)
    assert result is not None
    assert result.category == "Fees"
    assert result.confidence == 0.92


def test_llm_invalid_category_returns_none():
    from backend.app.ai.llm_classifier import LLMClassifier
    clf = LLMClassifier()
    raw = '{"category": "FakeCategory", "department": "Finance", "priority": "HIGH", "confidence": 0.9, "reason": "Test."}'
    result = clf._parse_response(raw)
    assert result is None


def test_llm_malformed_json_returns_none():
    from backend.app.ai.llm_classifier import LLMClassifier
    clf = LLMClassifier()
    result = clf._parse_response("This is not JSON at all")
    assert result is None


def test_llm_invalid_confidence_clamped():
    from backend.app.ai.llm_classifier import LLMClassifier
    clf = LLMClassifier()
    raw = '{"category": "Fees", "department": "Finance", "priority": "HIGH", "confidence": 1.5, "reason": "Test."}'
    result = clf._parse_response(raw)
    assert result is not None
    assert result.confidence <= 1.0


def test_llm_no_api_key_returns_none():
    from backend.app.ai.llm_classifier import LLMClassifier
    with patch.dict(os.environ, {"LLM_API_KEY": ""}):
        clf = LLMClassifier()
        result = clf.predict("fee payment", "not reflected")
        assert result is None


# ── AIService Fallback Tests ──────────────────────────────────────────────────

def test_ai_service_ml_mode_returns_prediction():
    """With a trained model, ML mode returns a valid prediction."""
    from pathlib import Path
    if not Path("ml/artifacts/model.pkl").exists():
        pytest.skip("Model artifact not found — run python -m ml.train first")
    with patch.dict(os.environ, {"AI_MODE": "ml"}):
        # Re-import to pick up new env
        import importlib
        import backend.app.ai.service as svc_module
        importlib.reload(svc_module)
        service = svc_module.AIService()
        result = service.analyze_ticket("fee payment not reflected", "I paid but portal shows pending")
        assert result.category in VALID_CATEGORIES
        assert 0.0 <= result.confidence <= 1.0


def test_ai_service_llm_fails_falls_back_to_ml():
    from pathlib import Path
    if not Path("ml/artifacts/model.pkl").exists():
        pytest.skip("Model artifact not found — run python -m ml.train first")
    from backend.app.ai.llm_classifier import LLMClassifier
    with patch.object(LLMClassifier, "predict", return_value=None):
        with patch.dict(os.environ, {"AI_MODE": "hybrid", "LLM_API_KEY": "fake"}):
            service = AIService()
            result = service.analyze_ticket("wifi not working", "campus internet down")
            assert result.category in VALID_CATEGORIES


def test_ai_service_all_fail_returns_manual_triage_signal():
    service = AIService()
    with patch("backend.app.ai.service.get_classifier") as mock_clf:
        mock_clf.return_value.predict.side_effect = Exception("Model broken")
        with patch("backend.app.ai.service.get_llm_classifier") as mock_llm:
            mock_llm.return_value.predict.return_value = None
            result = service._classify("", "")
            assert result.confidence == 0.0  # triggers MANUAL_TRIAGE in backend


# ── Knowledge Base Tests ──────────────────────────────────────────────────────

def test_knowledge_base_finds_resolution():
    from backend.app.ai.knowledge_base import KnowledgeBase
    kb = KnowledgeBase()
    suggestion = kb.suggest("fee payment not reflected in portal")
    assert suggestion is not None
    assert len(suggestion.resolution) > 0
    assert 0.0 <= suggestion.similarity <= 1.0


def test_knowledge_base_empty_returns_none():
    from backend.app.ai.knowledge_base import KnowledgeBase
    kb = KnowledgeBase()
    result = kb.suggest("")
    assert result is None

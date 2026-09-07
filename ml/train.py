"""
Training script for NexSolve AI/ML classifier.
Run: python -m ml.train

Outputs trained model artifacts to ml/artifacts/
"""
import os
import json
import pickle
from pathlib import Path
from datetime import datetime

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
from sklearn.pipeline import Pipeline

ARTIFACTS_DIR = Path(__file__).parent / "artifacts"
DATA_PATH = Path(__file__).parent / "data" / "tickets.csv"

# Category-to-department mapping
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

MODEL_VERSION = "tfidf-logreg-v1"
RANDOM_SEED = 42


def preprocess_text(text: str) -> str:
    """Normalize text for TF-IDF: lowercase, strip whitespace."""
    if not text or not isinstance(text, str):
        return ""
    return " ".join(text.lower().split())


def load_dataset(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["text"] = df["text"].fillna("").apply(preprocess_text)
    df = df[df["text"].str.len() > 0]  # remove empty
    return df


def train() -> dict:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

    df = load_dataset(DATA_PATH)
    print(f"Dataset loaded: {len(df)} samples across {df['category'].nunique()} categories")
    print(f"Category distribution:\n{df['category'].value_counts()}")

    X = df["text"].values
    y = df["category"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            ngram_range=(1, 2),
            min_df=1,
            max_features=5000,
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            random_state=RANDOM_SEED,
            C=5.0,
            solver="lbfgs",
        )),
    ])

    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    macro_f1 = f1_score(y_test, y_pred, average="macro")
    report = classification_report(y_test, y_pred)

    # Routing accuracy: predicted category -> expected dept matches actual dept
    routing_correct = sum(
        CATEGORY_TO_DEPT.get(p, "") == CATEGORY_TO_DEPT.get(a, "")
        for p, a in zip(y_pred, y_test)
    )
    routing_accuracy = routing_correct / len(y_test)

    classes = list(pipeline.classes_)

    model_path = ARTIFACTS_DIR / "model.pkl"
    meta_path = ARTIFACTS_DIR / "metadata.json"

    with open(model_path, "wb") as f:
        pickle.dump(pipeline, f)

    metadata = {
        "model_version": MODEL_VERSION,
        "model_type": "TFIDF_LOGISTIC_REGRESSION",
        "trained_at": datetime.utcnow().isoformat(),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "accuracy": round(accuracy, 4),
        "macro_f1": round(macro_f1, 4),
        "routing_accuracy": round(routing_accuracy, 4),
        "classes": classes,
        "category_to_dept": CATEGORY_TO_DEPT,
        "category_to_priority": CATEGORY_TO_PRIORITY,
        "report": report,
    }
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\n=== Model Evaluation ===")
    print(f"Accuracy:          {accuracy:.4f}")
    print(f"Macro F1:          {macro_f1:.4f}")
    print(f"Routing Accuracy:  {routing_accuracy:.4f}")
    print(f"\nClassification Report:\n{report}")
    print(f"\nModel saved: {model_path}")
    print(f"Metadata saved: {meta_path}")

    return metadata


if __name__ == "__main__":
    train()

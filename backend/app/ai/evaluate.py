"""
Standalone evaluation script.
Run: python -m backend.app.ai.evaluate

Loads trained model, runs on test split, prints actual metrics.
Does NOT fabricate numbers.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

import json
from ml.train import load_dataset, CATEGORY_TO_DEPT, CATEGORY_TO_PRIORITY, DATA_PATH, ARTIFACTS_DIR, RANDOM_SEED
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
import pickle


def evaluate():
    model_path = ARTIFACTS_DIR / "model.pkl"
    if not model_path.exists():
        print("Model not found. Run: python -m ml.train")
        return

    with open(model_path, "rb") as f:
        pipeline = pickle.load(f)

    df = load_dataset(DATA_PATH)
    X = df["text"].values
    y = df["category"].values
    _, X_test, _, y_test = train_test_split(X, y, test_size=0.20, random_state=RANDOM_SEED, stratify=y)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="macro")
    report = classification_report(y_test, y_pred)
    routing_acc = sum(
        CATEGORY_TO_DEPT.get(p, "") == CATEGORY_TO_DEPT.get(a, "")
        for p, a in zip(y_pred, y_test)
    ) / len(y_test)

    print("=" * 50)
    print("NexSolve AI Model Evaluation")
    print("=" * 50)
    print(f"Accuracy:         {acc:.4f}")
    print(f"Macro F1:         {f1:.4f}")
    print(f"Routing Accuracy: {routing_acc:.4f}")
    print(f"\nClassification Report:\n{report}")


if __name__ == "__main__":
    evaluate()

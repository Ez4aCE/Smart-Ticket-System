# NexSolve AI/ML Module Documentation

## Overview

The AI module classifies student support tickets into categories and departments automatically.

## Architecture

```
Student text (title + description)
    ↓
AIService.analyze_ticket()
    ↓
[Hybrid: ML first → LLM if low confidence]
    ↓
TicketPrediction { category, department, priority, confidence, reason, model_type, model_version }
    ↓
FastAPI backend (Person 2) — validates + persists to ai_predictions table
    ↓
Routing Service (Person 3) — MCP assignment
```

## Supported Categories & Routing

| Category | Department | Default Priority |
|---|---|---|
| Fees | Finance | HIGH |
| Examination | Exam Cell | HIGH |
| Hostel | Hostel Office | MEDIUM |
| Placement | Placement Cell | MEDIUM |
| Scholarship | Scholarship Office | LOW |
| IT / Network | IT Support | MEDIUM |
| Admission | Admission Office | LOW |
| Transport | Transport Office | LOW |

## Training

```bash
# From repo root
python -m ml.train
```

Outputs to `ml/artifacts/model.pkl` and `ml/artifacts/metadata.json`.

## Evaluation

```bash
python -m backend.app.ai.evaluate
```

## Dataset

Location: `ml/data/tickets.csv`
Format: `text,category,priority`
All data is synthetic/anonymized — no PII.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| AI_MODE | hybrid | ml / llm / hybrid |
| AI_CONFIDENCE_THRESHOLD | 0.75 | Below this → MANUAL_TRIAGE |
| AI_PROVIDER | gemini | gemini / openai |
| LLM_API_KEY | (none) | LLM API key |
| LLM_MODEL | gemini-1.5-flash | Model name |
| LLM_TIMEOUT | 10 | Seconds |

## Person 2 Integration

```python
from backend.app.ai.service import AIService

service = AIService()
prediction = service.analyze_ticket(title, description)
# prediction.confidence < 0.75 → ticket.status = MANUAL_TRIAGE
# prediction.confidence >= 0.75 → route via Person 3
```

## Person 3 Integration Boundary

AI predicts category/department/priority only.
Person 3 owns: which staff member receives the ticket.
The AI layer never calls MCP tools directly.

## Confidence

Confidence is the maximum class probability from Logistic Regression.
It is a calibration estimate, not a perfectly calibrated probability.
The backend uses 0.75 as the default threshold for auto-routing vs MANUAL_TRIAGE.

## Fallback Behavior

1. ML model not trained → FileNotFoundError → confidence=0.0 → MANUAL_TRIAGE
2. LLM API key not set → LLM skipped, ML used
3. LLM timeout/error → falls back to ML
4. All classifiers fail → confidence=0.0 → MANUAL_TRIAGE

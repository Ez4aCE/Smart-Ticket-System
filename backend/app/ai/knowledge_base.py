"""
Lightweight historical resolution retrieval using TF-IDF similarity.
Optional component — does not block the main classification pipeline.
"""
from typing import Optional, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from .schemas import ResolutionSuggestion

# Synthetic historical resolutions — no PII
HISTORICAL_RECORDS = [
    {
        "issue": "Fee payment completed but not reflected in portal",
        "category": "Fees",
        "department": "Finance",
        "resolution": "Verify payment transaction ID and synchronize the student fee ledger with the payment gateway.",
    },
    {
        "issue": "Hall ticket not available for exam",
        "category": "Examination",
        "department": "Exam Cell",
        "resolution": "Confirm exam registration status and generate hall ticket from the examination management system.",
    },
    {
        "issue": "Hostel room maintenance required",
        "category": "Hostel",
        "department": "Hostel Office",
        "resolution": "Submit maintenance request to hostel warden and schedule repair within 48 hours.",
    },
    {
        "issue": "Placement portal registration failing",
        "category": "Placement",
        "department": "Placement Cell",
        "resolution": "Clear browser cache, verify eligibility criteria, and re-register on the placement portal.",
    },
    {
        "issue": "Scholarship eligibility query",
        "category": "Scholarship",
        "department": "Scholarship Office",
        "resolution": "Review scholarship eligibility criteria on the scholarship portal and submit required documents.",
    },
    {
        "issue": "WiFi not working on campus",
        "category": "IT / Network",
        "department": "IT Support",
        "resolution": "Restart device network settings. IT team will check campus router and access point configuration.",
    },
    {
        "issue": "Admission application status not updated",
        "category": "Admission",
        "department": "Admission Office",
        "resolution": "Verify document submission status and contact admission office with your application reference number.",
    },
    {
        "issue": "Bus pass not issued",
        "category": "Transport",
        "department": "Transport Office",
        "resolution": "Submit transport pass application with required documents to transport office for processing.",
    },
]


class KnowledgeBase:
    """TF-IDF based similarity search over historical resolutions."""

    def __init__(self):
        self._vectorizer: Optional[TfidfVectorizer] = None
        self._vectors = None
        self._records = HISTORICAL_RECORDS
        self._fit()

    def _fit(self) -> None:
        texts = [r["issue"] for r in self._records]
        self._vectorizer = TfidfVectorizer(ngram_range=(1, 2))
        self._vectors = self._vectorizer.fit_transform(texts)

    def suggest(self, ticket_text: str, threshold: float = 0.25) -> Optional[ResolutionSuggestion]:
        """Return best matching historical resolution if similarity >= threshold."""
        if not ticket_text.strip():
            return None
        q_vec = self._vectorizer.transform([ticket_text.lower()])
        similarities = cosine_similarity(q_vec, self._vectors)[0]
        best_idx = similarities.argmax()
        best_score = float(similarities[best_idx])
        if best_score < threshold:
            return None
        return ResolutionSuggestion(
            resolution=self._records[best_idx]["resolution"],
            similarity=round(best_score, 4),
        )


_kb: Optional[KnowledgeBase] = None


def get_knowledge_base() -> KnowledgeBase:
    global _kb
    if _kb is None:
        _kb = KnowledgeBase()
    return _kb

"""
Mirror & Anchor signals
=======================
Mirror — vocabulary overlap between PR description and diff (penalty).
Anchor — causal connectors that reference specific diff entities.
"""
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _normalize_for_mirror(text: str) -> str:
    """Reduce diff-noise tokens so mirror measures prose overlap, not file lists."""
    t = text.lower()
    t = re.sub(r'^[+\-@\\].*$', ' ', t, flags=re.MULTILINE)
    t = re.sub(r'\b(?:file|added|removed|modified|diff|chunk):\s*', ' ', t)
    t = re.sub(r'\b[\w./-]+\.(?:ts|tsx|js|py|go|rs|java|rb|cs|sql|md)\b', ' ', t)
    t = re.sub(r'\b[a-f0-9]{7,40}\b', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def compute_mirror_penalty(description: str, diff_text: str) -> float:
    """
    TF-IDF cosine similarity between description and diff.
    Returns 0-1. Higher = description vocabulary mirrors diff closely.
    This is a PENALTY signal — high alignment means less original content.
    """
    if not description.strip() or not diff_text.strip():
        return 0.0

    desc_norm = _normalize_for_mirror(description)
    diff_norm = _normalize_for_mirror(diff_text)
    if not desc_norm or not diff_norm:
        return 0.0

    try:
        vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words="english",
            ngram_range=(1, 2),
        )
        texts = [desc_norm, diff_norm]
        tfidf_matrix = vectorizer.fit_transform(texts)
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return float(sim[0][0])
    except Exception:
        return 0.0


CAUSAL_CONNECTORS = [
    r"\bbecause\b", r"\bsince\b", r"\bto avoid\b", r"\bin order to\b",
    r"\bwhich means\b", r"\botherwise\b", r"\bso that\b",
    r"\bthis prevents?\b", r"\bthis ensures?\b", r"\bthis allows?\b",
    r"\bto prevent\b", r"\bto ensure\b", r"\bwithout this\b",
]

HEDGE_PHRASES = [
    r"\binstead of\b", r"\brather than\b", r"\bconsidered\b",
    r"\bcould have\b", r"\balternatively\b", r"\bapproach\b",
    r"\btrade.?off\b",
]


def _sentence_has_causal(sentence: str) -> bool:
    return any(re.search(p, sentence, re.IGNORECASE) for p in CAUSAL_CONNECTORS)


def _sentence_has_specific(sentence: str, entities: list[str]) -> bool:
    if not entities:
        return bool(re.search(r'\b[a-z]+[A-Z]\w+\b|\b\w+_\w+\b', sentence))
    s = sentence.lower()
    return any(e.lower() in s for e in entities if len(e) > 3)


def compute_anchor(
    sentences: list[str],
    diff_entities: list[str],
) -> float:
    """
    Returns 0-1. Higher = more sentences contain causal reasoning
    that references specific diff entities.
    """
    if not sentences:
        return 0.0

    engaged_count = 0
    for s in sentences:
        causal = _sentence_has_causal(s)
        specific = _sentence_has_specific(s, diff_entities)
        if causal and specific:
            engaged_count += 2  # Double weight: both causal AND specific
        elif causal:
            engaged_count += 1  # Causal without specific: partial credit
        elif specific and any(
            re.search(p, s, re.IGNORECASE) for p in HEDGE_PHRASES
        ):
            engaged_count += 1  # Hedge + specific: also counts

    # Normalise: 1 engaged sentence per 4 total = score 0.5
    score = engaged_count / (len(sentences) * 0.5)
    return float(min(1.0, score))

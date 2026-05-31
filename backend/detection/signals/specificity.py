"""
Specificity signal — technical depth
=====================================
Measures how many sentences contain concrete, verifiable detail:
quantitative claims, named identifiers, file paths, or diff entities.

Complements Reasoning (which requires epistemic act triggers).
A description can be specific without causal language; this signal catches that.
"""
import re
from detection.signals.reasoning import (
    _clause_specificity,
    _matches_any,
    QUANTITATIVE,
    GENERIC_FILLER,
)


def _sentence_is_specific(sentence: str, diff_entities: list[str]) -> bool:
    if _matches_any(sentence, GENERIC_FILLER):
        return False
    spec = _clause_specificity(sentence, diff_entities, full_sentence=sentence)
    if spec >= 0.25:
        return True
    # Standalone quantitative or path reference without causal trigger
    if _matches_any(sentence, QUANTITATIVE):
        content = [w for w in sentence.split() if len(w) > 3]
        return len(content) >= 4
    if re.search(r'\b\w+\.(?:ts|tsx|js|py|go|rs|java|rb|cs|sql)\b', sentence):
        return True
    return False


def compute_specificity(
    sentences: list[str],
    diff_entities: list[str],
) -> float:
    """
    Returns 0–1: fraction of sentences with substantive technical specificity,
    with a small bonus when most sentences are specific.
    """
    if not sentences:
        return 0.0

    specific_count = sum(
        1 for s in sentences if _sentence_is_specific(s, diff_entities)
    )
    ratio = specific_count / len(sentences)
    # ~2 of 5 specific sentences → ~0.5; all specific → 1.0
    score = min(1.0, ratio * 1.35)
    return float(score)

"""
Lean signal — information density (anti-padding)
================================================
Unique content words vs total content words in the description.
"""
import re

_STOP = frozenset({
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'to', 'of', 'in', 'on', 'at', 'by', 'for',
    'with', 'from', 'this', 'that', 'it', 'we', 'they', 'you', 'i', 'and', 'or', 'but',
})


def compute_lean(description: str) -> float:
    """Return 0–1 information lean score (higher = less filler repetition)."""
    words = description.lower().split()
    content_words = [
        w for w in words
        if re.sub(r'[^a-z]', '', w) not in _STOP and len(w) > 2
    ]
    unique_content = len(set(content_words))
    total_content = max(1, len(content_words))
    return min(1.0, (unique_content / total_content) * 1.4)

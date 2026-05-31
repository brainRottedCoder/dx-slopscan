"""
Structure signal — organizational clarity
=========================================
Rewards PR descriptions with clear sections, substantive bullets,
and reviewer-oriented scaffolding (root cause, testing, rollout).
"""
import re

SECTION_HEADERS = [
    r"^#{1,6}\s+\w",
    r"^\s*\*\*[^*]+\*\*\s*:?",
    r"^(?:root cause|why|motivation|context|approach|solution|testing|test plan|"
    r"rollout|migration|risks?|trade.?offs?|alternatives?|background)\s*:",
    r"^[-=]{3,}\s*$",
]

SUBSTANTIVE_BULLET = re.compile(
    r"^[-*+]\s+(?=\S.{12,})", re.MULTILINE
)
NUMBERED_STEP = re.compile(
    r"^\s*\d+[\.)]\s+\S.{8,}", re.MULTILINE
)


def _has_section_headers(text: str) -> bool:
    for line in text.splitlines():
        line_stripped = line.strip()
        if not line_stripped:
            continue
        for p in SECTION_HEADERS:
            if re.search(p, line_stripped, re.IGNORECASE):
                return True
    return False


def _bullet_quality(text: str) -> float:
    bullets = SUBSTANTIVE_BULLET.findall(text)
    if not bullets:
        return 0.0
    # Penalise one-word bullets; reward multi-clause bullets
    substantive = 0
    for b in bullets:
        content = re.sub(r"^[-*+]\s+", "", b).strip()
        words = content.split()
        if len(words) >= 6:
            substantive += 1
        elif len(words) >= 4:
            substantive += 0.5
    return min(1.0, substantive / max(1, len(bullets)))


def compute_structure(description: str) -> float:
    """
    Returns 0–1 for how well the description is organized for reviewers.
    """
    if not description.strip():
        return 0.0

    score = 0.0
    if _has_section_headers(description):
        score += 0.35

    bullet_q = _bullet_quality(description)
    score += bullet_q * 0.30

    numbered = len(NUMBERED_STEP.findall(description))
    if numbered >= 2:
        score += 0.20
    elif numbered == 1:
        score += 0.10

    # Paragraph breaks suggest intentional structure
    paragraphs = [p for p in re.split(r"\n\s*\n", description) if p.strip()]
    if len(paragraphs) >= 3:
        score += 0.15
    elif len(paragraphs) == 2:
        score += 0.08

    return float(min(1.0, score))

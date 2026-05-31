"""
Hugo Species Classifier
=========================
Classifies PR descriptions into one or more of 7 slop species.
ZERO LLM delegation — pure rule-based classification on top of
signal outputs and sentence labels.

Each species maps to specific signal patterns, making the classification
auditable: "This PR scores as The Echo (ECHO) because Novelty<0.35 and Mirror>0.60."

Species (Hugo 11-species taxonomy):
  ◈ ECHO        — The Echo: restates diff. High mirror, low novelty.
  ◎ HOLLOW      — The Hollow: answers nothing a reviewer needs.
  ◇ HAZE        — The Haze: jargon-dense, zero causal transfer.
  ⊙ SPIRAL      — The Spiral: circular paragraphs.
  ◐ SURFACE     — The Surface: describes what, never why.
  ◉ STENCIL     — The Stencil: interchangeable template PR.
  ◫ FUSE        — The Fuse: accurate today, no surviving context.
  ◌ GHOST       — The Ghost: too short to review meaningfully.
  ▣ BULLET      — The Bullet: list dump with no narrative glue.
  ◬ VAULT       — The Vault: security-sensitive change, no security context.
  ▤ PADDING     — The Padding: verbose repetition, low information lean.
"""
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class SpeciesResult:
    type: str
    glyph: str
    name: str
    confidence: float
    evidence: Optional[str]   # verbatim substring from description
    counterfactual: str       # what the fixed version would say
    fix: str


# ── Pattern libraries ──────────────────────────────────────────────

GENERIC_OPENERS = [
    r"^this pr\b", r"^this commit\b", r"^this change\b",
    r"^updated?\b", r"^fixed?\b", r"^added?\b", r"^refactored?\b",
    r"^improved?\b", r"^various\b", r"^minor\b", r"^cleanup\b",
]

FILLER_PHRASES = [
    r"\bvarious improvements\b", r"\bcode improvements\b",
    r"\bminor changes\b", r"\bcleanup\b", r"\bmiscellaneous\b",
    r"\bseveral improvements\b", r"\bsome changes\b",
    r"\bcode quality\b", r"\bbest practices\b",
]

JARGON_TOKENS = [
    r"\boptimize[sd]?\b", r"\brefactor\w*\b", r"\bmodulari\w+\b",
    r"\barchitecture\b", r"\bscalabilit\w+\b", r"\bperformance\b",
    r"\bcodebase\b", r"\bsystems?\b", r"\binfrastructure\b",
]

CIRCULAR_VERBS = [
    r"\bupdated?\s+\w+\s+to\s+\w+\b",
    r"\bchanged?\s+\w+\s+to\s+\w+\b",
    r"\bmodified?\s+\w+\s+to\s+\w+\b",
]

SECURITY_DIFF_MARKERS = [
    r"\bauth\b", r"\btoken\b", r"\bpassword\b", r"\bcredential\b",
    r"\bencrypt\b", r"\bdecrypt\b", r"\bpermission\b", r"\bOAuth\b",
    r"\bJWT\b", r"\bsecret\b", r"\bRBAC\b", r"\bACL\b", r"\bCORS\b",
    r"\bCSRF\b", r"\bXSS\b", r"\bSQL.?inject",
]
SECURITY_DESC_MARKERS = [
    r"\bsecurity\b", r"\bthreat\b", r"\bvulnerab\w+\b", r"\battack surface\b",
    r"\bauth(?:entication|orization)?\b", r"\bpermission\b", r"\bencrypt\b",
    r"\bsecret\b", r"\bPII\b", r"\bcompliance\b", r"\baudit\b",
]


def _find_evidence(description: str, patterns: list[str]) -> Optional[str]:
    """Return first matching substring from description."""
    for p in patterns:
        m = re.search(p, description, re.IGNORECASE)
        if m:
            # Return surrounding context (up to 80 chars)
            start = max(0, m.start() - 10)
            end = min(len(description), m.end() + 30)
            return description[start:end].strip()
    return None


def _sentence_starts_with_generic(sentence: str) -> bool:
    s = sentence.strip().lower()
    return any(re.match(p, s) for p in GENERIC_OPENERS)


def _count_jargon(description: str) -> int:
    count = 0
    for p in JARGON_TOKENS:
        count += len(re.findall(p, description, re.IGNORECASE))
    return count


def _bullet_line_ratio(description: str) -> float:
    lines = [ln.strip() for ln in description.splitlines() if ln.strip()]
    if not lines:
        return 0.0
    bullets = sum(1 for ln in lines if re.match(r'^[-*+]\s+', ln))
    return bullets / len(lines)


def _diff_touches_security(diff_text: str, diff_entities: list[str]) -> bool:
    blob = (diff_text or "").lower() + " " + " ".join(diff_entities).lower()
    return any(re.search(p, blob, re.IGNORECASE) for p in SECURITY_DIFF_MARKERS)


def _desc_discusses_security(description: str) -> bool:
    return any(re.search(p, description, re.IGNORECASE) for p in SECURITY_DESC_MARKERS)


def _detect_circular(sentences: list[str]) -> bool:
    """
    Detect Ouroboros pattern: consecutive sentences share root noun
    with no new concept introduced. Simple heuristic: 3+ consecutive
    sentences that begin with "this", "the", or a repeated word.
    """
    if len(sentences) < 3:
        return False
    circular_count = 0
    for i in range(len(sentences) - 1):
        s1_words = set(re.findall(r'\b\w{4,}\b', sentences[i].lower()))
        s2_words = set(re.findall(r'\b\w{4,}\b', sentences[i+1].lower()))
        # High overlap with no new meaningful words
        if s1_words and len(s1_words & s2_words) / len(s1_words) > 0.55:
            circular_count += 1
    return circular_count >= 2


def _find_red_evidence(sentences: list[str], sentence_labels: list[str]) -> Optional[str]:
    """Return first RED sentence as evidence."""
    for s, label in zip(sentences, sentence_labels):
        if label == "red" and len(s) > 10:
            return s[:90] + ("..." if len(s) > 90 else "")
    return None


def classify_species(
    description: str,
    sentences: list[str],
    sentence_labels: list[str],  # list of "red"/"orange"/"green"/"purple"
    novelty: float,
    reasoning: float,
    anchor: float,
    mirror: float,
    has_why: bool,
    has_tradeoff: bool,
    has_alternative: bool,
    has_risk: bool,
    has_evidence: bool,
    word_count: int,
    lean: float = 0.5,
    reach: float = 0.5,
    diff_text: str = "",
    diff_entities: list[str] | None = None,
) -> list[SpeciesResult]:
    """
    Returns list of detected species, sorted by confidence.
    A PR can have multiple species simultaneously.
    """
    results = []
    diff_entities = diff_entities or []
    red_count = sentence_labels.count("red")
    total = max(len(sentences), 1)
    red_ratio = red_count / total
    jargon_count = _count_jargon(description)
    bullet_ratio = _bullet_line_ratio(description)

    # ── ◌ GHOST ────────────────────────────────────────────────────
    if word_count < 28 or (len(sentences) <= 1 and word_count < 45):
        conf = min(1.0, 0.70 + (0.02 * max(0, 28 - word_count)))
        results.append(SpeciesResult(
            type="GHOST", glyph="◌", name="The Ghost",
            confidence=round(conf, 2),
            evidence=description[:80] if description else None,
            counterfactual="Add at least: root cause, what reviewers should check, and how you verified it.",
            fix="Terse PRs need three sentences minimum: problem, approach, verification.",
        ))

    # ── ◈ ECHO ─────────────────────────────────────────────────────
    # High mirror + low novelty + many red sentences
    if mirror > 0.55 and novelty < 0.40 and red_ratio > 0.50:
        conf = min(1.0, mirror * 1.3 + (1 - novelty) * 0.5)
        evidence = _find_red_evidence(sentences, sentence_labels)
        results.append(SpeciesResult(
            type="ECHO", glyph="◈", name="The Echo",
            confidence=round(conf, 2),
            evidence=evidence,
            counterfactual="Explain WHY this approach was chosen, not what the diff already shows.",
            fix="Replace diff restatements with the reasoning that isn't visible in the code.",
        ))

    # ── ◎ HOLLOW ───────────────────────────────────────────────────
    # Zero reasoning + zero anchor + no why
    if reasoning < 0.05 and anchor < 0.10 and not has_why and not has_risk:
        conf = min(1.0, 0.6 + (0.1 if not has_alternative else 0) + (0.1 if not has_evidence else 0))
        evidence = _find_evidence(description, FILLER_PHRASES) or description[:80]
        results.append(SpeciesResult(
            type="HOLLOW", glyph="◎", name="The Hollow",
            confidence=round(conf, 2),
            evidence=evidence,
            counterfactual="What would a teammate need to know to review this confidently without asking you anything?",
            fix="Write the description for the reviewer, not for yourself.",
        ))

    # ── ◇ HAZE ─────────────────────────────────────────────────────
    # High jargon, low engagement (uses technical terms without explaining them)
    if jargon_count >= 4 and anchor < 0.15 and reasoning < 0.20:
        conf = min(1.0, 0.5 + jargon_count * 0.05)
        evidence = _find_evidence(description, JARGON_TOKENS)
        results.append(SpeciesResult(
            type="HAZE", glyph="◇", name="The Haze",
            confidence=round(conf, 2),
            evidence=evidence,
            counterfactual="Replace technical terms with what they actually DO in this specific context.",
            fix="Strip jargon — if nothing remains, you haven't explained anything.",
        ))

    # ── ⊙ SPIRAL ───────────────────────────────────────────────────
    if _detect_circular(sentences) and novelty < 0.45:
        conf = 0.75
        results.append(SpeciesResult(
            type="SPIRAL", glyph="⊙", name="The Spiral",
            confidence=conf,
            evidence=sentences[0][:80] if sentences else None,
            counterfactual="Each paragraph must introduce one idea the previous paragraph did not contain.",
            fix="Delete every sentence that doesn't add a concept not already stated.",
        ))

    # ── ◐ SURFACE ──────────────────────────────────────────────────
    if not has_why and novelty < 0.45 and not has_tradeoff:
        conf = min(1.0, 0.65 + (0.15 if not has_alternative else 0))
        # Find a sentence that describes what without why
        what_evidence = None
        for s, lbl in zip(sentences, sentence_labels):
            if lbl in ("red", "orange") and any(re.search(p, s, re.IGNORECASE) for p in CIRCULAR_VERBS):
                what_evidence = s[:90]
                break
        results.append(SpeciesResult(
            type="SURFACE", glyph="◐", name="The Surface",
            confidence=round(conf, 2),
            evidence=what_evidence,
            counterfactual="What was broken before this? What would happen if this PR wasn't merged?",
            fix="Add a root cause section: what was wrong, and why does this fix it.",
        ))

    # ── ◉ STENCIL ──────────────────────────────────────────────────
    # Generic openers + low uniqueness (interchangeable with any similar PR)
    generic_sentence_count = sum(1 for s in sentences if _sentence_starts_with_generic(s))
    generic_ratio = generic_sentence_count / total
    if generic_ratio > 0.40 and reasoning < 0.15:
        conf = min(1.0, 0.55 + generic_ratio * 0.5)
        evidence = _find_evidence(description, GENERIC_OPENERS)
        results.append(SpeciesResult(
            type="STENCIL", glyph="◉", name="The Stencil",
            confidence=round(conf, 2),
            evidence=evidence,
            counterfactual="Find one thing about THIS specific change that differs from any other change of this type.",
            fix="Replace every generic sentence with something that only applies to this PR.",
        ))

    # ── ◫ FUSE ─────────────────────────────────────────────────────
    if not has_evidence and not has_risk and reasoning < 0.15 and word_count > 20:
        conf = 0.65
        results.append(SpeciesResult(
            type="FUSE", glyph="◫", name="The Fuse",
            confidence=conf,
            evidence=None,
            counterfactual="Add the rationale and tradeoffs. Code changes; decisions need context to survive.",
            fix="Add: how was this tested, and what should reviewers watch for?",
        ))

    # ── ▣ BULLET ───────────────────────────────────────────────────
    if bullet_ratio > 0.55 and reasoning < 0.20 and not has_why and word_count > 35:
        conf = min(1.0, 0.55 + bullet_ratio * 0.4)
        results.append(SpeciesResult(
            type="BULLET", glyph="▣", name="The Bullet",
            confidence=round(conf, 2),
            evidence=_find_evidence(description, [r"^[-*+]\s+"]) or description[:80],
            counterfactual="Connect bullets with causality: why this item matters and what could go wrong.",
            fix="Add a short narrative paragraph before the list explaining the decision.",
        ))

    # ── ◬ VAULT ────────────────────────────────────────────────────
    if (_diff_touches_security(diff_text, diff_entities)
            and not _desc_discusses_security(description)
            and not has_risk):
        conf = 0.78
        results.append(SpeciesResult(
            type="VAULT", glyph="◬", name="The Vault",
            confidence=conf,
            evidence=_find_evidence(diff_text or description, SECURITY_DIFF_MARKERS),
            counterfactual="Name the threat model: what could leak, escalate, or break auth if this is wrong?",
            fix="Add security review notes: permissions changed, secrets handling, and what to scrutinize.",
        ))

    # ── ▤ PADDING ──────────────────────────────────────────────────
    if lean < 0.38 and word_count > 90 and reasoning < 0.25:
        conf = min(1.0, 0.60 + (0.40 - lean))
        results.append(SpeciesResult(
            type="PADDING", glyph="▤", name="The Padding",
            confidence=round(conf, 2),
            evidence=description[:90],
            counterfactual="Cut repeated phrases. Each sentence should add a fact not stated elsewhere.",
            fix="Delete filler; keep only sentences with numbers, entities, or causal claims.",
        ))

    # Sort by confidence, return top 4 (more species may fire)
    results.sort(key=lambda r: r.confidence, reverse=True)
    return results[:4]

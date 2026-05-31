"""
Coverage signal — epistemic checklist (anti-gaming)
==================================================
Detects which epistemic questions a PR description answers.

ANTI-GAMING:
  - Per-sentence analysis: triggers must have substantive content IN THE SAME SENTENCE
  - Substantive = >= 3 content words (non-stop, non-category-keyword) near the trigger
  - "because." or "Root cause: X." → False
  - "because OFFSET degrades to O(n) at page 500" → True
  - Template attacks fail because each stub sentence has no content

PR mode:   WHY, TRADE, ALT, RISK, EVIDENCE
Docs mode: + EXAMPLE, PREREQ, STEP
"""
import re
from dataclasses import dataclass

MIN_WORDS_WHY  = 4   # higher bar for rationale (most gamed)
MIN_WORDS_REST = 3   # lower bar for risk/evidence/alternative

STOP = frozenset({
    'a','an','the','is','are','was','were','be','been','have','has','had',
    'do','does','did','will','would','to','of','in','on','at','by','for',
    'with','from','this','that','it','we','they','you','i','and','or','but',
    'not','no','so','if','when','then','just','only','also','now','here',
    'x','y','z','etc','our','their','its','my',
})
CATEGORY_NOISE = frozenset({
    'root','cause','alternative','considered','tradeoff','risk','tested',
    'because','since','instead','rather','rejected','possible','note',
    'warning','caution','tradeoffs','chosen','selected',
})

WHY_PATTERNS      = [r"\bbecause\b", r"\bsince\b", r"\broot cause\b",
                     r"\bthe reason\b", r"\bto avoid\b", r"\bto prevent\b",
                     r"\bin order to\b", r"\bdue to\b", r"\bwas causing\b",
                     r"\bwas failing\b", r"\bwas broken\b", r"\bproblem was\b",
                     r"\bissue was\b", r"\bpreviously\b", r"\bbefore this\b",
                     r"\bwithout this\b", r"\bwe needed\b"]
TRADEOFF_PATTERNS = [r"\btrade.?off\b", r"\bat the cost of\b",
                     r"\bdownside\b", r"\bcaveat\b", r"\bbreaking change\b",
                     r"\bbetter\b.{3,35}\bbut\b", r"\bfaster\b.{3,35}\bbut\b",
                     r"\bmore memory\b", r"\bpros and cons\b",
                     r"\bgain\b.{3,40}\blos\w+", r"\bworth it\b",
                     r"\bacceptable\b.{3,30}\bbecause\b"]
ALTERNATIVE_PATTERNS = [r"\bconsidered\b", r"\bcould have\b",
                         r"\binstead of\b", r"\brather than\b",
                         r"\bdecided against\b", r"\bwe explored\b",
                         r"\bwe tried\b", r"\bwe looked at\b",
                         r"\brejected\b", r"\bpassed on\b",
                         r"\bdidn't (?:use|choose)\b", r"\bother options?\b"]
RISK_PATTERNS     = [r"\bscrutinize\b", r"\breviewer\w*\s+should\b",
                     r"\bedge case\b", r"\bcorner case\b",
                     r"\bmight break\b", r"\bcould break\b", r"\bregress\b",
                     r"\bwatch out\b", r"\bknown issue\b", r"\brisk\b",
                     r"\bpay attention\b", r"\bdouble.?check\b",
                     r"\bsecurity\b", r"\bperformance regression\b",
                     r"\brace condition\b", r"\bdata loss\b"]
EVIDENCE_PATTERNS = [r"\btest\w+", r"\bbenchmark\w*", r"\bverif\w+",
                     r"\bmeasur\w+", r"\bprofile?d\b", r"\bload test\b",
                     r"\bp9[0-9]\b", r"\bstaging\b", r"\blocally\b",
                     r"\bunit tests?\b", r"\bintegration tests?\b",
                     r"\be2e\b", r"\bmanual(?:ly)?\s+test",
                     r"\bQA\b", r"\bcanary\b", r"\bsmoke test"]
SCOPE_PATTERNS    = [r"\bin scope\b", r"\bout of scope\b", r"\bonly applies to\b",
                     r"\bdoes not (?:apply|affect)\b", r"\blimited to\b",
                     r"\bfor (?:this )?(?:release|version|environment)\b",
                     r"\bnot (?:included|part of)\b", r"\bscope of\b"]
ROLLBACK_PATTERNS = [r"\brollback\b", r"\brevert\b", r"\broll back\b",
                     r"\bfeature flag\b", r"\bkill switch\b",
                     r"\bif (?:this )?breaks\b", r"\bundo\b",
                     r"\bbackward.?compat", r"\bmigration (?:path|plan)\b",
                     r"\bdeploy(?:ment)? (?:order|steps)\b"]
MIGRATION_PATTERNS = [r"\bmigrat\w+", r"\bupgrade path\b", r"\bbreaking change\b",
                      r"\bdeprecat\w+", r"\bdata (?:migration|backfill)\b",
                      r"\bschema change\b", r"\bversion bump\b"]
EXAMPLE_PATTERNS  = [r"```", r"\bfor example\b", r"\be\.g\.\b",
                     r"\bsample\b", r"\bsnippet\b"]
PREREQ_PATTERNS   = [r"\brequires?\b", r"\bprerequisite\b", r"\bbefore you\b",
                     r"\byou (must|need|should) (have|install|know)\b"]
STEP_PATTERNS     = [r"^\s*[1-9]\.\s+\w", r"^\s*step\s+[0-9]",
                     r"\bfirst\b.{5,25}\bthen\b"]

QUESTIONS_PR  = {
    "why":         "Why was this change necessary? What was broken or missing before?",
    "tradeoff":    "What did you trade off? (speed vs memory, simplicity vs flexibility)",
    "alternative": "What alternatives did you consider and reject?",
    "risk":        "What could this break? What should reviewers specifically scrutinize?",
    "evidence":    "How did you verify this works? Tests added, benchmarks run, manual steps?",
    "scope":       "What is in scope vs out of scope for this change?",
    "rollback":    "How can this be rolled back or reverted safely if it causes issues?",
    "migration":   "Are there migration steps, breaking changes, or upgrade paths to document?",
}
QUESTIONS_DOCS = {
    "why":         "Why does this feature exist? What problem does it solve?",
    "tradeoff":    "What are the limitations or trade-offs of this approach?",
    "alternative": "When should a reader choose a different approach?",
    "risk":        "What are the common mistakes or gotchas to watch for?",
    "evidence":    "Is there a working example or reference implementation?",
    "example":     "Add at least one concrete example with real values, not placeholders.",
    "prereq":      "What must the reader have or know before following this?",
    "step":        "Add step-by-step instructions a new user can follow.",
}


def _sentence_has_substance(sentence: str, patterns: list[str], min_words: int) -> bool:
    s = sentence.lower()
    for p in patterns:
        m = re.search(p, s, re.IGNORECASE | re.MULTILINE)
        if not m:
            continue
        # Use text from trigger start to end of sentence (includes the trigger itself + what follows)
        context = s[m.start():]
        words = re.findall(r'\b[a-z]{3,}\b', context)
        content = [w for w in words if w not in STOP and w not in CATEGORY_NOISE]
        if len(content) >= min_words:
            return True
    return False


def _check(text: str, patterns: list[str], min_words: int = MIN_WORDS_REST) -> bool:
    sentences = re.split(r'(?<=[.!?])\s+|\n', text)
    return any(_sentence_has_substance(s.strip(), patterns, min_words)
               for s in sentences if s.strip())


@dataclass
class MissingAnalysis:
    has_why: bool
    has_tradeoff: bool
    has_alternative: bool
    has_risk: bool
    has_evidence: bool
    has_scope: bool
    has_rollback: bool
    has_migration: bool
    has_example: bool
    has_prerequisite: bool
    has_step: bool
    questions: list[str]


def compute_coverage(description: str, mode: str = "pr") -> MissingAnalysis:
    q_map = QUESTIONS_DOCS if mode == "docs" else QUESTIONS_PR

    has_why         = _check(description, WHY_PATTERNS,         MIN_WORDS_WHY)
    has_tradeoff    = _check(description, TRADEOFF_PATTERNS,    MIN_WORDS_REST)
    has_alternative = _check(description, ALTERNATIVE_PATTERNS, MIN_WORDS_REST)
    has_risk        = _check(description, RISK_PATTERNS,        MIN_WORDS_REST)
    has_evidence    = _check(description, EVIDENCE_PATTERNS,    MIN_WORDS_REST)
    has_scope       = _check(description, SCOPE_PATTERNS,       MIN_WORDS_REST)
    has_rollback    = _check(description, ROLLBACK_PATTERNS,    MIN_WORDS_REST)
    has_migration   = _check(description, MIGRATION_PATTERNS,   MIN_WORDS_REST)
    has_example     = _check(description, EXAMPLE_PATTERNS,     1)
    has_prereq      = _check(description, PREREQ_PATTERNS,      MIN_WORDS_REST)
    has_step        = _check(description, STEP_PATTERNS,        1)

    questions = []
    if not has_why:         questions.append(q_map["why"])
    if not has_tradeoff:    questions.append(q_map["tradeoff"])
    if not has_alternative: questions.append(q_map["alternative"])
    if not has_risk:        questions.append(q_map["risk"])
    if not has_evidence:    questions.append(q_map["evidence"])
    if mode == "pr":
        if not has_scope:     questions.append(q_map.get("scope", ""))
        if not has_rollback:  questions.append(q_map.get("rollback", ""))
        if not has_migration: questions.append(q_map.get("migration", ""))
        questions = [q for q in questions if q]
    if mode == "docs":
        if not has_example: questions.append(q_map.get("example", ""))
        if not has_prereq:  questions.append(q_map.get("prereq", ""))
        if not has_step:    questions.append(q_map.get("step", ""))
        questions = [q for q in questions if q]

    return MissingAnalysis(
        has_why=has_why, has_tradeoff=has_tradeoff, has_alternative=has_alternative,
        has_risk=has_risk, has_evidence=has_evidence,
        has_scope=has_scope, has_rollback=has_rollback, has_migration=has_migration,
        has_example=has_example, has_prerequisite=has_prereq, has_step=has_step,
        questions=questions[:6],
    )

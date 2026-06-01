#!/usr/bin/env python3
"""Build and upsert Hugo PR comment from /analyze JSON response (v2, 9-signal)."""
import json
import os
import sys
import urllib.error
import urllib.request

SCORING_SIGNALS = [
    ("coverage", "Coverage", False),
    ("novelty", "Novelty", False),
    ("reasoning", "Reasoning", False),
    ("anchor", "Anchor", False),
    ("mirror_penalty", "Mirror", True),
    ("reach", "Reach", False),
    ("lean", "Lean", False),
    ("specificity", "Specificity", False),
    ("structure", "Structure", False),
]

COVERAGE_CHECKS = [
    ("has_why", "WHY / Root cause"),
    ("has_tradeoff", "Tradeoff acknowledged"),
    ("has_alternative", "Alternatives considered"),
    ("has_risk", "Risks flagged"),
    ("has_evidence", "Testing evidence"),
    ("has_scope", "Scope defined"),
    ("has_rollback", "Rollback / rollout noted"),
    ("has_migration", "Migration path documented"),
    ("has_example", "Example provided"),
    ("has_prerequisite", "Prerequisites noted"),
    ("has_step", "Steps described"),
]


def _signal_pct(signals: dict, key: str, invert: bool) -> int:
    raw = signals.get(key)
    if raw is None and key in ("reach", "lean"):
        raw = 0.5
    if raw is None:
        raw = 0.0
    eff = (1.0 - raw) if invert else raw
    return int(round(eff * 100))


def main() -> None:
    response_file = os.environ.get("RESPONSE_FILE", "")
    if not response_file or not os.path.isfile(response_file):
        print("ERROR: RESPONSE_FILE missing or not found", file=sys.stderr)
        sys.exit(1)

    token = os.environ.get("GH_TOKEN", "")
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    pr_number = os.environ.get("PR_NUMBER", "")
    threshold = float(os.environ.get("THRESHOLD", "20"))
    breakdown_url = os.environ.get(
        "BREAKDOWN_URL", "https://dx-slopscan.vercel.app/scan"
    )

    if not token or not repo or not pr_number:
        print("ERROR: GH_TOKEN, GITHUB_REPOSITORY, and PR_NUMBER are required", file=sys.stderr)
        sys.exit(1)

    with open(response_file, encoding="utf-8") as f:
        data = json.load(f)

    score = data.get("hugo_score", 0)
    label = data.get("slop_label", "Unknown")
    emoji = (
        "🟢" if score >= 76 else "🟡" if score >= 51 else "🟠" if score >= 26 else "🔴"
    )
    threshold_note = (
        ""
        if score >= threshold
        else f"\n\n> ⚠ Score {score} is below warning threshold {threshold}."
    )

    signals = data.get("signals", {})
    signal_lines = "\n".join(
        f"- **{label}:** {_signal_pct(signals, key, invert)}/100"
        for key, label, invert in SCORING_SIGNALS
    )

    species_lines = ""
    for sp in data.get("species", []):
        evidence = sp.get("evidence") or ""
        ev = (
            f'\n  > Evidence: *"{evidence[:80]}"*'
            if evidence
            else ""
        )
        conf = int(sp.get("confidence", 0) * 100)
        species_lines += (
            f'\n- {sp.get("glyph", "")} **{sp.get("name", "")}** '
            f"({conf}% confidence){ev}\n  Fix: {sp.get('fix', '')}"
        )

    m = data.get("whats_missing", {})
    checklist = "\n".join(
        f'- [{"x" if m.get(key, False) else " "}] {label}'
        for key, label in COVERAGE_CHECKS
    )

    questions = m.get("questions", [])
    q_block = ""
    if questions:
        q_block = "\n**Questions a reviewer will ask:**\n" + "\n".join(
            f"- {q}" for q in questions
        )

    red_sentences = [
        s["text"]
        for s in data.get("sentences", [])
        if s.get("label") == "red"
    ][:2]
    red_block = ""
    if red_sentences:
        red_block = "\n**Derivable sentences (restate the diff):**\n" + "\n".join(
            f'> *"{t[:100]}"*' for t in red_sentences
        )

    species_section = ""
    if species_lines:
        species_section = f"### Detected Species\n{species_lines}"

    body = f"""## {emoji} Hugo Score: {score}/100 — {label}{threshold_note}

> Zero LLM calls in detection path · [View full breakdown]({breakdown_url})

### Signals
{signal_lines}

### Epistemic Coverage
{checklist}
{q_block}
{species_section}
{red_block}

<sub>Hugo v2.0 · 9-signal ensemble · [dx-slopscan](https://github.com/brainRottedCoder/dx-slopscan)</sub>"""

    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Hugo-dx-slopscan-Action/2.0",
    }

    list_url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    req = urllib.request.Request(list_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            comments = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"ERROR: failed to list comments: {e}", file=sys.stderr)
        sys.exit(1)

    existing = next(
        (
            c
            for c in comments
            if "Hugo Score" in c.get("body", "")
            and c.get("user", {}).get("type") == "Bot"
        ),
        None,
    )

    payload = json.dumps({"body": body}).encode("utf-8")
    if existing:
        url = (
            f"https://api.github.com/repos/{repo}/issues/comments/{existing['id']}"
        )
        req = urllib.request.Request(url, data=payload, headers=headers, method="PATCH")
    else:
        req = urllib.request.Request(list_url, data=payload, headers=headers, method="POST")

    try:
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        print(f"ERROR: failed to post comment: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"Hugo comment posted: {score}/100 — {label}")


if __name__ == "__main__":
    main()

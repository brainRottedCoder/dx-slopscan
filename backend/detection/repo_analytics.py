"""
Hugo Repo-Level Analytics
===========================
Analyzes all recent PRs in a repository and returns:
  - Median Hugo score (fast mode, no model)
  - Score distribution
  - Worst and best PRs
  - Author score rankings
  - Trend over time (last 30 days vs previous 30 days)

Used by GET /repo/{owner}/{repo}/stats
"""
import re
import statistics
from collections import defaultdict
from datetime import datetime, timezone, timedelta
from detection.signals.reasoning import compute_reasoning
from detection.signals.mirror import compute_mirror_penalty, compute_anchor
from detection.signals.coverage import compute_coverage
from detection.signals.lean import compute_lean

def split_sents(text):
    sents = []
    for line in re.split(r'\n', text):
        line = re.sub(r'^[-*+#\d\.]\s*', '', line.strip())
        if len(line.split()) >= 3:
            sents.append(line)
    return sents

def score_description_fast(description: str, diff: str = "") -> float:
    """Fast Hugo score without sentence-transformer model."""
    sents = split_sents(description)
    reasoning, _ = compute_reasoning(sents, [])
    mirror = compute_mirror_penalty(description, diff)
    anchor = compute_anchor(sents, [])
    lean_score = compute_lean(description)
    missing = compute_coverage(description, "pr")
    ms = (missing.has_why*0.30 + missing.has_tradeoff*0.20 + missing.has_alternative*0.20
          + missing.has_risk*0.15 + missing.has_evidence*0.15)
    fast = (ms*0.294 + reasoning*0.294 + anchor*0.176 + (1-mirror)*0.176 + lean_score*0.059) * 100
    return round(fast, 1)


def slop_label(score: float) -> str:
    if score >= 76: return "Quality"
    elif score >= 51: return "Low Slop"
    elif score >= 26: return "Medium Slop"
    else: return "High Slop"


def _parse_merged_at(iso: str):
    if not iso:
        return None
    return datetime.fromisoformat(iso.replace("Z", "+00:00"))


def _author_trend(entries: list) -> str:
    """Compare median score in first vs second half of PRs (by merge date)."""
    if len(entries) < 2:
        return "stable"
    mid = len(entries) // 2
    first_half = [e["hugo_score"] for e in entries[:mid]]
    second_half = [e["hugo_score"] for e in entries[mid:]]
    if not first_half or not second_half:
        return "stable"
    first_med = statistics.median(first_half)
    second_med = statistics.median(second_half)
    if second_med > first_med:
        return "improving"
    if second_med < first_med:
        return "declining"
    return "stable"


def analyze_repo(owner: str, repo: str, github_token: str = "", max_prs: int = 30) -> dict:
    """Fetch and analyze recent merged PRs for a repository."""
    import urllib.request, json

    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Hugo-dx-slopscan/2.0",
    }
    if github_token:
        headers["Authorization"] = f"token {github_token}"

    url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=closed&per_page={max_prs}&sort=updated&direction=desc"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            prs = json.loads(r.read())
    except Exception as e:
        raise ValueError(f"GitHub API error: {e}")

    if not isinstance(prs, list):
        raise ValueError(f"Unexpected GitHub response: {prs.get('message', 'unknown error')}")

    results = []
    for pr in prs:
        if not pr.get("merged_at"):
            continue
        body = (pr.get("body") or "").strip()
        if len(body.split()) < 5:
            continue  # skip trivial
        s = score_description_fast(body)
        merged_at = pr.get("merged_at", "")
        results.append({
            "number": pr["number"],
            "title": pr["title"][:80],
            "author": pr.get("user", {}).get("login", "unknown"),
            "url": pr["html_url"],
            "hugo_score": s,
            "slop_label": slop_label(s),
            "merged_at": merged_at,
            "word_count": len(body.split()),
        })

    if not results:
        return {"error": "No merged PRs with descriptions found", "repo": f"{owner}/{repo}"}

    scores = [r["hugo_score"] for r in results]
    sorted_results = sorted(results, key=lambda x: x["hugo_score"])

    # Repo-level 30-day trend (last 30 days vs previous 30 days)
    now = datetime.now(timezone.utc)
    cutoff_30 = now - timedelta(days=30)
    cutoff_60 = now - timedelta(days=60)
    recent_scores = []
    previous_scores = []
    for r in results:
        merged = _parse_merged_at(r["merged_at"])
        if not merged:
            continue
        if merged >= cutoff_30:
            recent_scores.append(r["hugo_score"])
        elif cutoff_60 <= merged < cutoff_30:
            previous_scores.append(r["hugo_score"])

    if recent_scores and previous_scores:
        recent_med = statistics.median(recent_scores)
        previous_med = statistics.median(previous_scores)
        trend_delta = round(recent_med - previous_med, 1)
        if recent_med > previous_med:
            trend_direction = "improving"
        elif recent_med < previous_med:
            trend_direction = "declining"
        else:
            trend_direction = "stable"
    else:
        trend_direction = "insufficient_data"
        trend_delta = 0.0
        recent_med = statistics.median(recent_scores) if recent_scores else None
        previous_med = statistics.median(previous_scores) if previous_scores else None

    # Author stats (median + calendar-sorted half comparison)
    author_entries = defaultdict(list)
    for r in results:
        author_entries[r["author"]].append(r)
    author_stats = []
    for author, entries in author_entries.items():
        sorted_entries = sorted(
            entries,
            key=lambda e: _parse_merged_at(e["merged_at"])
            or datetime.min.replace(tzinfo=timezone.utc),
        )
        author_scores_list = [e["hugo_score"] for e in sorted_entries]
        author_stats.append({
            "author": author,
            "pr_count": len(author_scores_list),
            "median_score": round(statistics.median(author_scores_list), 1),
            "trend": _author_trend(sorted_entries),
        })
    author_stats.sort(key=lambda x: x["median_score"])

    # Score distribution
    distribution = {
        "high_slop_pct": round(sum(1 for s in scores if s < 26) / len(scores) * 100, 1),
        "medium_slop_pct": round(sum(1 for s in scores if 26 <= s < 51) / len(scores) * 100, 1),
        "low_slop_pct": round(sum(1 for s in scores if 51 <= s < 76) / len(scores) * 100, 1),
        "quality_pct": round(sum(1 for s in scores if s >= 76) / len(scores) * 100, 1),
    }

    return {
        "repo": f"{owner}/{repo}",
        "prs_analyzed": len(results),
        "median_score": round(statistics.median(scores), 1),
        "mean_score": round(statistics.mean(scores), 1),
        "min_score": min(scores),
        "max_score": max(scores),
        "distribution": distribution,
        "worst_prs": sorted_results[:3],
        "best_prs": sorted_results[-3:][::-1],
        "author_rankings": author_stats,
        "all_scores": scores,
        "trend": trend_direction,
        "trend_delta": trend_delta,
        "recent_median": round(recent_med, 1) if recent_med is not None else None,
        "previous_median": round(previous_med, 1) if previous_med is not None else None,
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
        "scoring_mode": "fast",
        "scoring_note": (
            "Repo-level scoring uses ECS+WhatsMissing+Alignment+Engagement+Density. "
            "For full 7-signal analysis submit individual PRs to POST /analyze."
        ),
    }

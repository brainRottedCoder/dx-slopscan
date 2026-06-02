# Compliance & Framing Guide

This document records terminology, color, and scoring framing decisions for the
information-density scanner. It satisfies the Phase 7 compliance audit requirement.

## Approved terminology

| Use | Avoid |
|-----|--------|
| information density | slop, AI-generated, artificial |
| review quality signal | AI score, slop score |
| documentation concreteness | bot-written |
| PR description quality | AI-written |
| writing style consistency | artificial content |

## Renamed or avoided API fields

- Contributor timeline values use `informationDensity`, never `slopScore` or `aiScore`.
- Scan health uses `healthScore` with optional `relativeLabel` / `relativePercentile`.
- Domain errors expose `userMessage` for UI display; internal `error` remains for logs.

## Color decisions

| Surface | Palette | Notes |
|---------|---------|--------|
| Repository / folder heatmap | Green → amber → red score scale | Repo-level signals only |
| Contributor timeline & profile | Blue / neutral (`score-low`, `score-medium`, `score-high`) | No `#ef4444`, no `score-danger` |
| PR analysis panel | Neutral bars with score-medium accents | Not contributor-specific |

## Contributor views

- Contributors are listed alphabetically, never ranked worst-to-best.
- Personal baseline deviation (F-409) compares a contributor to their own history,
  not a global “bad writer” threshold.
- `deviatesFromBaseline` flags z-score > 2.0 or vocabulary drift > 0.3.

## OSS relative scoring (F-411)

- Baseline distribution: `data/baseline/baseline-scores.json` (10 OSS repos).
- `formatRelativeScore` tiers: bottom 15%, below median, near median, above median.
- Health card copy: “Compared to OSS median: …”

## Non-English repositories (F-410)

- Japanese, Spanish, and German samples use `embeddings_only` capability.
- Rule-based hedging density is skipped; embedding similarity remains active.
- `NonEnglishRepoNotice.userMessage` explains degraded mode to users.

## Domain errors

| Code | HTTP | userMessage intent |
|------|------|-------------------|
| `INVALID_REPO_URL` | 400 | Fix GitHub URL format |
| `PRIVATE_REPO` | 403 | Re-authorize OAuth for private repos |
| `RATE_LIMIT` | 429 | Wait `retryAfter` seconds |
| `NON_ENGLISH` | 400 | Embedding-only mode explained |
| `SCAN_NOT_FOUND` | 404 | Start a new scan |

## Automated checks

- `apps/api/src/errors/compliance.test.ts` — banned field names in shared-types.
- `ContributorTimeline.test.tsx` — no red hex on contributor chart output.
- `packages/detection` language & PR scorer tests — hedging skipped for non-English.

# Product Requirements Document (PRD)

## GitHub Repo Slop Scanner

**Version:** 1.0  
**Status:** Draft  
**Target Event:** Slop Scan Hackathon (May 29 – June 1, 2026)  
**Tracks:** Track A (Code Review) + Track B (Docs & KBs)  
**Build Window:** 72 hours (MVP-first)

---

## 1. Executive Summary

**GitHub Repo Slop Scanner** is a web application that detects low-quality, unreviewed AI-generated content ("slop") in GitHub repositories. Users paste a repository URL, authenticate with GitHub, and receive a visual health report showing where PR descriptions, commit messages, and documentation add little or no real information beyond what is already visible in the code.

The product is designed for a frictionless demo: first meaningful results in under 30 seconds, with deeper analysis available on demand when the user clicks into specific PRs, folders, contributors, or documentation files.

**Brief:** A paste-a-URL GitHub scanner that surfaces hollow PRs, weak docs, and review-quality signals using statistical and linguistic analysis — not LLM delegation.

**Full Description:** The application ingests repository metadata from the GitHub API, applies a multi-signal detection pipeline (lexical, structural, and embedding-based), and presents results through an interactive repo heatmap, PR scoring dashboard, contributor quality signals, and documentation validation views. Analysis is tiered: a fast overview scan runs automatically on submit; detailed scans are lazy-loaded on user interaction to stay within API limits and deliver a responsive UX. The tool frames findings as **review quality** and **information density**, not as accusations of AI usage, in compliance with hackathon rules.

---

## 2. Problem Statement

### Brief
GitHub repos are filling with AI-generated PRs, commit messages, and docs that look polished but teach nothing and explain nothing.

### Full Description
AI-assisted development has increased the volume of code and documentation, but not necessarily the quality of human review. PR descriptions restate diffs without explaining *why* changes were made. Documentation becomes circular, hedging-heavy, and example-free. Commit messages become suspiciously uniform. Teams lack tooling to measure this at the repository level.

Existing approaches fail hackathon and product standards because they:
- Delegate detection to another LLM ("is this AI-generated?")
- Shame contributors instead of surfacing objective quality gaps
- Provide keyword-only heuristics with no actionable repo-level view
- Require heavy setup instead of working instantly on any public or authorized private repo

This product addresses the gap by combining **multi-signal slop detection**, **repo-wide visualization**, and **on-demand deep analysis** in a demo-ready web app.

---

## 3. Product Vision & Goals

### Vision
Make repository slop visible, measurable, and actionable in seconds — without blaming individuals for using AI.

### Primary Goals
| Goal | Description |
|---|---|
| Fast time-to-value | First meaningful report in ≤ 30 seconds for a medium repo |
| Accurate, explainable detection | Every score backed by inspectable signals, not black-box LLM judgment |
| Cross-track coverage | Satisfy Track A (code review artifacts) and Track B (documentation quality) |
| Demo strength | Judges can paste their own repo URL live and understand results immediately |
| API sustainability | Operate within GitHub OAuth rate limits and secondary concurrency limits |

### Non-Goals (Hackathon Disqualifiers)
- Keyword-only detectors (e.g., flagging em-dashes)
- Wrappers around GPTZero, Originality.ai, or similar
- "Ask another LLM if this is AI" workflows
- Contributor shaming or public AI guilt leaderboards
- Full-history enterprise-scale scanning in v1

---

## 4. Target Users

| Persona | Needs |
|---|---|
| **Senior developers / DevOps engineers** | Quickly assess PR and commit quality across a repo |
| **Platform / engineering managers** | Team-level review quality trends without surveillance framing |
| **Technical writers / developer advocates** | Identify docs that sound correct but lack concrete guidance |
| **Hackathon judges / OSS maintainers** | Instant, credible demo on real repositories |

---

## 5. Product Principles

1. **Quality over accusation** — Label outputs as "information density" and "review quality," not "AI detected."
2. **Explain every score** — Show which signals contributed and why.
3. **Lazy by default** — Overview first; deep analysis only when requested.
4. **Honest partial results** — Degrade gracefully for large repos, non-English content, and truncated diffs.
5. **Cache aggressively** — Never re-fetch or re-score unchanged artifacts.

---

## 6. System Architecture Overview

### Brief
Three-tier, event-driven analysis with GitHub OAuth, GraphQL batching, SSE progress streaming, and local embedding models.

### Full Description
On repo submit, **Tier 1** runs automatically (~40 API calls, 15–30s). **Tier 2** analyses trigger on user clicks (PR, folder, contributor, doc file). **Tier 3** deep scan is an explicit user action (2–10 minutes, 200–800 API calls).

Backend uses a worker queue, SSE for real-time progress, SQLite for scan metadata, and compressed JSON blobs for full results. GitHub access uses OAuth with `repo` scope. API calls are batched via GraphQL where possible and throttled with `p-limit` (max 5 concurrent). Embeddings run locally via ONNX (`all-MiniLM-L6-v2` for text, `codebert-base` for code summaries).

---

## 7. Feature Catalog

Each feature includes:
- **Brief** — one-line summary
- **Full Description** — behavior, signals, UX, and constraints

---

### 7.1 Core Entry & Authentication

#### F-001: GitHub Repository URL Input

**Brief:** User pastes a GitHub repo URL to start analysis.

**Full Description:** The landing experience accepts a standard GitHub repository URL (e.g., `https://github.com/org/repo`). The system parses owner, repo name, and optional branch context, validates format, and initiates Tier 1 scan. No local clone or manual configuration is required. Invalid URLs show inline validation errors; private repos prompt for authentication if not already logged in.

---

#### F-002: GitHub OAuth Authentication

**Brief:** Users sign in with GitHub to unlock rate limits, private repos, and identity-aware profiling.

**Full Description:** Implement a GitHub OAuth app flow from day one. Request `repo` scope to access public and private repositories. OAuth raises the primary API limit from 60 to 5,000 requests/hour and enables contributor identity mapping. The UI displays granted scopes and what data access they enable. On 404 responses for private repos, verify public existence before showing permission errors to avoid misleading messages.

---

#### F-003: Scope & Permission Transparency

**Brief:** Show users exactly what the app can access and why.

**Full Description:** A settings or pre-scan panel lists active OAuth scopes (`repo`, etc.) and maps each to capabilities: private repo scanning, PR/commit access, contributor metadata. Reduces trust friction during demo and prevents silent empty results from missing scopes.

---

### 7.2 Tier 1 — Automatic Overview Scan

Runs on every repo submit. Target: **15–30 seconds**, **~40 API calls**.

#### F-101: Repository File Tree Fetch

**Brief:** Retrieve the repository directory structure from GitHub.

**Full Description:** Fetch the file tree via GitHub Trees API (preferably recursive for initial overview). Build an internal nested structure for visualization and downstream scoring. For monorepos, cap initial depth to top 3 directory levels and show a warning when truncating (e.g., "scanning top 500 files"). Large flat JSON responses are parsed server-side to avoid browser freezes.

---

#### F-102: Folder-Level Slop Heatmap

**Brief:** Color-coded aggregate slop scores per folder before file-level detail.

**Full Description:** Compute directory-level slop scores by aggregating documentation and flagged artifact signals within each folder. Render as a heatmap where color intensity reflects severity. Folder scores power the first WOW moment without requiring full file content fetch. File-level scores load lazily when folders expand (Tier 2).

---

#### F-103: Recent PR List Preview

**Brief:** Fetch the last 20 PR titles and descriptions without diffs.

**Full Description:** Pull recent PR metadata via GraphQL batching: title, body, author, state, timestamps. Display as cards with placeholder "not yet analysed" badges. Enables quick scanning of open work and sets up Tier 2 diff analysis on click. No diff or info-density score until user requests it.

---

#### F-104: Commit Message Pattern Scoring (Overview)

**Brief:** Analyse the last 100 commit messages for entropy and uniformity patterns.

**Full Description:** Fetch commit message subjects (and bodies when present) for the most recent 100 commits. Compute distribution-level signals: length standard deviation, type-token ratio, imperative verb ratio, body-text presence ratio, and burstiness of timestamps. Output repo-level and contributor-aggregatable summaries. Individual commits are not flagged in isolation — patterns across distributions are scored to reduce false positives on disciplined human contributors.

---

#### F-105: README & Top-Level Docs Surface Scan

**Brief:** Quick slop score for README and primary documentation files.

**Full Description:** Fetch README and top-level docs (`docs/`, `CONTRIBUTING.md`, etc.). Apply lightweight Track B signals: concrete element count, hedging density, paragraph length variance, and basic circular reference detection. Produces an entry-level documentation health score without deep claim validation (reserved for Tier 2/3).

---

#### F-106: Contributor List & Activity Summary

**Brief:** Show contributors with PR counts and activity context.

**Full Description:** Build a contributor index from recent PR and commit metadata: username, avatar, PR count, recent activity window. Display as a team overview list without ranking individuals by "AI slop %." Serves as navigation into Tier 2 contributor drill-down. Default view emphasizes aggregate team stats.

---

#### F-107: Overall Repo Slop Health Score

**Brief:** Single summary score card for repository review and documentation quality.

**Full Description:** Combine weighted signals from folder heatmap, PR preview heuristics (title/description-only pass), commit distribution anomalies, and README/doc surface scan into one repo health score (0–100 or percentile). Include breakdown chips for PR quality, commit patterns, and documentation density. Score is calibrated against a baseline of 10–15 known OSS repos when available.

---

### 7.3 Tier 2 — On-Demand Deep Analysis

Triggered by user click. Target: **5–15 seconds per item**, **~20–60 API calls**.

#### F-201: PR Deep Analysis (Info-Density Scoring)

**Brief:** Click a PR to fetch its diff and score description quality vs the change set.

**Full Description:** On PR card click, emit `analyse:pr` event, show loading skeleton, fetch full diff via GitHub API, and run the three-layer scoring pipeline:

1. **Lexical layer** — Extract identifiers from diff (functions, classes, variables); measure % appearing verbatim in PR description. High overlap suggests diff-restating filler.
2. **Structural layer** — Count concrete claims ("because X", "fixes Y", line references, trade-offs) vs vague filler ("updated", "improved", "refactored").
3. **Embedding layer** — Run local `all-MiniLM-L6-v2` cosine similarity between description and a rule-generated natural-language summary of changed symbols.

Combine into weighted, explainable info-density score. Stream results via SSE; cache by `pr_number + updated_at`. Second click on unchanged PR is instant.

---

#### F-202: PR Diff-Restate Analysis

**Brief:** Detect when a PR description adds no semantic value beyond the visible diff.

**Full Description:** Sub-feature of F-201 focused on redundancy detection. Flags PRs where description embedding similarity to diff summary exceeds threshold AND lexical overlap is high AND structural concrete-claim count is low. UI explains: "Description closely mirrors the diff without adding context." Does not claim AI authorship.

---

#### F-203: Contributor Quality Profile

**Brief:** Click a contributor to see PR description quality over their recent work.

**Full Description:** Fetch last 30 PRs and associated commit history for the selected contributor. Build a timeline of information density scores and baseline deviation metrics. Compare current patterns to the contributor's own historical voice (length variance, vocabulary shift via embedding distance, complexity vs description depth). Framed as "PR description quality over time," using neutral colors (no red shame labels). Individual drill-down is opt-in; team aggregate shown first.

---

#### F-204: Folder File-Level Scan

**Brief:** Click a folder to fetch and score every file inside it.

**Full Description:** Lazy-load file contents for the selected directory. Prioritize documentation files (README, markdown, docstrings) for slop scoring. For source files, apply lighter heuristics: comment-to-code ratio, comment redundancy (comment restates function name), function length distribution. Uses virtualized rendering to handle large folders. Results merge into folder heatmap and tree view.

---

#### F-205: Documentation Deep Scan

**Brief:** Click a doc file for full filler, circularity, and claim validation analysis.

**Full Description:** Run complete Track B pipeline on a single document:

- **Concrete element count** — code blocks, version numbers, CLI commands, file paths, named errors
- **Circular reference detection** — heading noun phrases repeated as opening sentence subjects
- **Hedging adverb frequency** — ~80-term curated list per 1,000 words
- **Paragraph length variance** — flags suspicious uniformity
- **Symbol existence check** — extract claimed functions/classes; verify against codebase index

Surface-level only for claim validation in MVP (symbol exists, not full behavioral equivalence).

---

#### F-206: Batch Open PR Analysis

**Brief:** Analyse all open PRs sequentially with a progress bar.

**Full Description:** User-triggered batch job processes open PRs (cap at 50 for v1) one at a time through F-201 pipeline. Client-side queue limits concurrency to 1–2 to avoid secondary rate limits. Shows per-PR progress and final ranked list by info-density score. Recommended MVP cap: top 5–50 PRs depending on time budget.

---

### 7.4 Tier 3 — Full Deep Scan

Explicit "Deep Scan" button. Target: **2–10 minutes**, **200–800 API calls**.

#### F-301: Full Commit History Analysis

**Brief:** Extend commit pattern analysis beyond the last 100 commits.

**Full Description:** Paginate commit history (with scan depth limit: last 90 days recommended for v1) and recompute distribution signals across full window. Identifies long-term vocabulary entropy collapse and burst commit patterns indicative of bulk low-review contributions.

---

#### F-302: All PR Diff Scoring

**Brief:** Score every PR diff in scope without requiring individual clicks.

**Full Description:** Batch-fetch and score all PRs within configured limits (last 50 PRs). Produces comprehensive PR quality report export. Useful for maintainers preparing release reviews or audit snapshots.

---

#### F-303: All Documentation Deep Analysis

**Brief:** Deep-analyse all documentation files, not just README.

**Full Description:** Walk `docs/`, wiki-linked markdown, and other doc paths discovered in tree. Apply F-205 pipeline to each file. Aggregate into documentation health section with worst offenders highlighted by section, not by author.

---

#### F-304: AST-Based Source File Scoring

**Brief:** Analyse source files for comment redundancy and structural slop signals.

**Full Description:** Parse source via tree-sitter (WASM in browser or backend parser). Extract functions, measure length distribution, detect comments that duplicate identifier semantics, and flag over-commented obvious code. Limited to files touched by flagged PRs or commits in MVP to control scope.

---

#### F-305: Cross-Contributor Style Convergence

**Brief:** Detect when multiple contributors' writing styles become suspiciously similar.

**Full Description:** Stylometric comparison across commit messages and PR descriptions: vocabulary overlap, sentence length convergence, embedding cluster tightness. Surfaces team-level signal ("writing voice convergence") rather than individual AI accusations. Tier 3 only due to compute and API cost.

---

#### F-306: Exportable Report (PDF / JSON)

**Brief:** Download a full scan report for sharing or offline review.

**Full Description:** Generate structured JSON export of all scores, signals, and metadata. Optional PDF summary for demo and stakeholder sharing. Includes repo metadata, scan timestamp, scope limits applied, and per-module breakdowns. Session-only results may warn that export is required to persist.

---

### 7.5 Detection Engine Features

These are backend analysis capabilities powering the UI features above.

#### F-401: Lexical Identifier Overlap (PR)

**Brief:** Measure how much of the PR description merely repeats diff symbol names.

**Full Description:** Parse diff for added/changed identifiers. Compute percentage found verbatim in PR description. High overlap with low structural claim count indicates diff-restating slop. Independent, explainable signal in PR scoring pipeline.

---

#### F-402: Structural Concrete Claim Counter (PR)

**Brief:** Count specific, actionable statements in PR descriptions.

**Full Description:** Regex and pattern library detect line references, causal language ("because", "due to"), issue links ("fixes #"), and explicit trade-off mentions. Compared against vague verb-only descriptions. Contributes to info-density score and user-facing explanations.

---

#### F-403: Local Embedding Similarity (PR & Docs)

**Brief:** Semantic similarity via on-device models, not external LLM APIs.

**Full Description:** Use `all-MiniLM-L6-v2` (ONNX Runtime) for natural language and `microsoft/codebert-base` for code snippets. Diffs are converted to templated natural-language summaries before comparison. ~50ms per sentence on CPU. Compliant with hackathon rule against LLM delegation for detection.

---

#### F-404: Hedging Phrase Density Detector

**Brief:** Score frequency of AI-favoured hedge words in PRs and docs.

**Full Description:** Curated list of ~80 terms ("typically", "generally", "usually", "basically", etc.). Score per 1,000 words. Elevated density contributes to slop score with transparent term breakdown in UI. English-specific; disabled when non-English detected.

---

#### F-405: Commit Distribution Analyser

**Brief:** Score contributor commit message patterns over rolling windows.

**Full Description:** Computes length stddev, type-token ratio, imperative verb ratio, body presence ratio, and timestamp burstiness. Flags distribution anomalies (low variance + high conventional-commit compliance + entropy collapse). Never scores a single commit in isolation.

---

#### F-406: Documentation Circularity Detector

**Brief:** Find sections that restate their own headings without adding information.

**Full Description:** Extract noun phrases from section headings; check if opening sentence subject reuses same phrases without new entities. Rule-based, fast, and explainable. Targets "The config object configures the configuration" patterns.

---

#### F-407: Concrete Element Counter (Docs)

**Brief:** Measure how much actionable content exists per documentation section.

**Full Description:** Operational definition of "concrete": fenced code blocks, semver strings, shell commands, file paths, named error strings. Sections with zero concrete elements flagged as abstract. Drives doc density score and heatmap coloring for doc files.

---

#### F-408: Symbol Existence Validator (Docs vs Code)

**Brief:** Verify that functions/classes mentioned in docs actually exist in the repo.

**Full Description:** Extract symbol references from documentation via NLP heuristics; cross-reference against codebase index from tree + selective parse. Reports missing symbols and stale references. MVP scope: existence check only — not runtime behavior validation.

---

#### F-409: Personal Baseline Deviation (Contributor)

**Brief:** Compare a contributor's recent work to their own historical patterns.

**Full Description:** Avoids false positives for consistently excellent engineers. Stores rolling stats per contributor: message length mean/variance, vocabulary embedding centroid, PR description depth. Flags sudden uniformity or vocabulary shift relative to personal baseline, weighted by diff complexity.

---

#### F-410: Language Detection & Graceful Degradation

**Brief:** Detect non-English repos and adjust signal availability.

**Full Description:** Use `lingua-py` or `langdetect` on sampled text. When non-English detected, disable English hedging/lexical rules; fall back to embedding-only signals with visible notice. Prevents confident garbage scores during live demo on international repos.

---

#### F-411: Score Calibration & Baseline Comparison

**Brief:** Anchor raw scores to distributions from known open-source repos.

**Full Description:** Pre-scan 10–15 reference repos (React, Flask, Django, Next.js, FastAPI, etc.) to build baseline percentiles. Display relative rankings: "Bottom 15% of surveyed OSS PRs." Supports hackathon bake-off bonus with labelled evaluation set and confusion matrix.

---

### 7.6 Frontend & Visualization

#### F-501: D3.js Treemap Overview

**Brief:** Top-level visual map of repo slop severity by area.

**Full Description:** Treemap where node size reflects file/folder weight and color reflects slop score. Primary demo screenshot view. Enables at-a-glance identification of documentation-heavy slop clusters vs clean areas. Toggleable with tree list view.

---

#### F-502: Virtualized Expandable Tree List

**Brief:** Drill-down navigation for large repositories without UI freeze.

**Full Description:** Implemented with `react-arborist` and virtual scrolling (`tanstack-virtual` / `react-virtual`). Supports per-node custom rendering with color-coded score badges. Lazy-loads children on expand. Required for monorepos with 50,000+ files.

---

#### F-503: Treemap / Tree View Toggle

**Brief:** Switch between overview and navigational representations.

**Full Description:** Two synchronized views of the same underlying scan data. Treemap for impact overview; tree list for precise file navigation. User preference persists within session.

---

#### F-504: Contributor Quality Timeline Chart

**Brief:** Neutral trend chart of PR information density over time.

**Full Description:** Line or bar chart showing information density scores across time windows. Blue/neutral palette; axes labeled "information density score." Team aggregate default; individual contributor on opt-in drill-down. Includes explanatory note defining low scores.

---

#### F-505: Three-State Analysis Badges

**Brief:** Visual language for unscored, in-progress, and completed items.

**Full Description:** Every scorable item (PR, folder, doc, contributor) displays one of: gray placeholder ("not yet analysed"), pulse animation ("analysing"), colored score badge ("done"). Critical for lazy analysis UX so partial dashboards feel intentional, not broken.

---

#### F-506: Live Progress via Server-Sent Events (SSE)

**Brief:** Stream scan progress and partial results in real time.

**Full Description:** Client opens SSE connection on scan start. Server emits module completion events (`tree_scan_done`, `pr_preview_done`, `embedding_done`, `report_ready`). Enables progressive rendering — repo tree appears while PR analysis continues. Avoids HTTP timeout on long scans.

---

#### F-507: Client-Side Analysis Queue

**Brief:** Serialize user-triggered analyses to protect API limits.

**Full Description:** When user clicks multiple items rapidly, queue analyses client-side with max 1–2 concurrent jobs. Queued items show "waiting" state. Coordinates with backend `p-limit` to prevent secondary rate limit 403s.

---

### 7.7 Backend & Infrastructure

#### F-601: GraphQL API Batching

**Brief:** Fetch PR/commit metadata in bulk to minimize API calls.

**Full Description:** Replace N REST calls with single GraphQL queries where possible (e.g., 50 PRs with title, body, author, comments in one request). Primary efficiency lever for staying within 5,000 req/hr quota.

---

#### F-602: Concurrency Limiter (`p-limit`)

**Brief:** Cap parallel GitHub requests at 5 to avoid secondary rate limits.

**Full Description:** Enforce max 5 simultaneous outbound GitHub API requests with ~100ms stagger on same-resource calls. Handles Retry-After on 403 secondary limit responses with exponential backoff and jitter.

---

#### F-603: Aggressive Multi-Layer Caching

**Brief:** Cache by commit SHA, PR `updated_at`, and scan timestamp to avoid rework.

**Full Description:** If repo HEAD SHA unchanged, serve cached report instantly. PR analyses keyed by `pr_number + updated_at`. Commit analyses keyed by SHA. Metadata in SQLite; full payloads as compressed JSON blobs. TTL: 24 hours for demo. In-memory cache for session hot path.

---

#### F-604: Scan Depth Limiter

**Brief:** Enforce bounded analysis scope for predictable performance.

**Full Description:** Hard limits for v1: last 90 days of commits, last 50 PRs, top 3 directory levels, max 500 files on initial pass. Limits communicated clearly in UI. Prevents 10-minute surprise scans and rate limit exhaustion.

---

#### F-605: Truncated Diff Fallback

**Brief:** Recover when GitHub truncates large diffs at 300 lines.

**Full Description:** Detect truncation markers (`@@ ... @@`) in patch field. Fall back to fetching raw file content for affected files. Ensures PR scoring pipeline has sufficient context on large changes.

---

#### F-606: Worker Queue for Long Jobs

**Brief:** Process scans asynchronously beyond HTTP timeout windows.

**Full Description:** BullMQ + Redis for production; in-memory queue acceptable for hackathon demo. Jobs emit progress events independently. Tier 3 deep scan always runs as background job with SSE updates.

---

#### F-607: Result Storage (SQLite + JSON Blobs)

**Brief:** Persist scan metadata and compressed full results.

**Full Description:** SQLite stores scan ID, repo full name, status, timestamps, summary scores. Full structured results stored as compressed JSON in object storage (S3/R2) or local filesystem for demo. Balances simplicity vs re-scan cost.

---

#### F-608: Monorepo & Large Repo Handling

**Brief:** Prevent UI and API failure on very large repositories.

**Full Description:** Show explicit "repo too large — scanning top 500 files" warning. Allow subdirectory selection to focus analysis. Virtual scrolling and directory-first aggregation prevent browser lockup. Never silently degrade without user notice.

---

### 7.8 Compliance, Framing & Trust

#### F-701: Review Quality Framing (No Shaming)

**Brief:** Present findings as objective quality metrics, not AI guilt scores.

**Full Description:** All copy, charts, and exports use terms like "information density," "review quality signal," and "documentation concreteness." No "AI slop %" leaderboards sorted worst-to-best. No red badges on individual contributor names. Aligns with hackathon disqualification rules.

---

#### F-702: Explainable Signal Breakdown

**Brief:** Every score expandable to show contributing signals and weights.

**Full Description:** PR card, doc section, and repo summary scores link to breakdown panel: lexical overlap %, concrete claim count, hedging density, embedding similarity, etc. Judges and engineers can audit why something scored low.

---

#### F-703: Session & Persistence Notice

**Brief:** Inform users when results are session-only vs persisted.

**Full Description:** For hackathon MVP, per-item click analyses may be session-cached only. Display notice: "Deep-dive results are session-only unless exported." Sets expectations and reduces backend scope.

---

---

## 8. User Flows

### Flow 1: First-Time Repo Scan
1. User opens app → pastes GitHub URL
2. If private repo or rate limit needed → GitHub OAuth
3. Tier 1 auto-scan starts → SSE progress streams
4. Dashboard renders: health score, treemap, PR list (unscored), contributor summary, README score
5. User clicks PR → Tier 2 analysis → inline scored result

### Flow 2: Documentation Audit
1. User expands `docs/` in tree view
2. Clicks `docs/api.md` → Tier 2 doc deep scan
3. Views circularity flags, missing concrete examples, invalid symbol references
4. Optionally runs Tier 3 full doc sweep

### Flow 3: Team Quality Review
1. User views team aggregate contributor chart
2. Opts into individual contributor drill-down
3. Reviews information density timeline vs personal baseline
4. Exports JSON report for team retrospective

---

## 9. MVP Scope vs Deferred

### MVP (72-Hour Build — Must Ship)
| Feature ID | Feature |
|---|---|
| F-001, F-002 | URL input + GitHub OAuth |
| F-101, F-102 | File tree + folder heatmap |
| F-103, F-201, F-202 | PR preview + click-to-analyse info-density |
| F-104 | Commit message distribution scoring |
| F-105, F-205 (README only) | README surface + basic claim check |
| F-106, F-203 (limited) | Contributor list + basic quality profile |
| F-107 | Repo health summary card |
| F-501, F-502, F-505, F-506 | Treemap, tree, badges, SSE |
| F-401–F-404, F-406–F-408 | Core detection signals |
| F-601–F-604 | GraphQL, p-limit, caching, depth limits |
| F-701, F-702 | Quality framing + explainability |

### Deferred (Post-Hackathon / Tier 3)
| Feature ID | Feature |
|---|---|
| F-206 | Full batch PR analysis (beyond top 5) |
| F-301–F-306 | Complete Tier 3 deep scan suite |
| F-304, F-305 | AST source scoring + stylometric convergence |
| F-306 | PDF export |
| F-504 | Full contributor timeline charts |
| F-607 | Persistent multi-user storage |

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Time to first meaningful result | ≤ 30 seconds (medium repo) |
| Tier 2 PR analysis latency | ≤ 15 seconds per PR |
| API calls on initial load | ~40 |
| Initial scan quota usage | ~1% of hourly OAuth limit |
| Explainability | 100% of displayed scores have signal breakdown |
| Demo conversion | Judge can scan own repo live without setup |
| False positive mitigation | Contributor baseline deviation used before individual flags |
| Hackathon bonuses | Cross-track (+3), Bake-off (+5) if baseline + confusion matrix shipped |

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Scope too large for 72 hours | Strict MVP table; Tier 3 deferred |
| GitHub secondary rate limits | `p-limit`, client queue, GraphQL batching |
| False positives on good engineers | Distribution-level + personal baseline scoring |
| Contributor shaming | Quality framing, neutral UI, opt-in drill-down |
| Non-English repos score incorrectly | Language detection + honest partial results |
| LLM delegation disqualification | Local ONNX embeddings only; no "is this AI?" prompts |
| Monorepo UI freeze | Virtual scrolling, depth caps, subdirectory focus |
| Stale cached PR analysis | Cache key includes `updated_at` timestamp |

---

## 12. Technical Stack (Recommended)

| Layer | Choice |
|---|---|
| Frontend | React, D3.js treemap, react-arborist, tanstack-virtual |
| Backend | Node.js, SSE, BullMQ (or in-memory queue) |
| Storage | SQLite + compressed JSON blobs |
| GitHub | OAuth, GraphQL primary, REST fallback |
| Embeddings | all-MiniLM-L6-v2 + codebert-base via ONNX Runtime |
| Parsing | tree-sitter (Phase 2 / Tier 3) |
| Language detection | lingua-py or langdetect |

---

## 13. Appendix — Feature Index

| ID | Feature Name | Tier |
|---|---|---|
| F-001 | GitHub Repository URL Input | Core |
| F-002 | GitHub OAuth Authentication | Core |
| F-003 | Scope & Permission Transparency | Core |
| F-101 | Repository File Tree Fetch | Tier 1 |
| F-102 | Folder-Level Slop Heatmap | Tier 1 |
| F-103 | Recent PR List Preview | Tier 1 |
| F-104 | Commit Message Pattern Scoring | Tier 1 |
| F-105 | README & Top-Level Docs Surface Scan | Tier 1 |
| F-106 | Contributor List & Activity Summary | Tier 1 |
| F-107 | Overall Repo Slop Health Score | Tier 1 |
| F-201 | PR Deep Analysis | Tier 2 |
| F-202 | PR Diff-Restate Analysis | Tier 2 |
| F-203 | Contributor Quality Profile | Tier 2 |
| F-204 | Folder File-Level Scan | Tier 2 |
| F-205 | Documentation Deep Scan | Tier 2 |
| F-206 | Batch Open PR Analysis | Tier 2 |
| F-301 | Full Commit History Analysis | Tier 3 |
| F-302 | All PR Diff Scoring | Tier 3 |
| F-303 | All Documentation Deep Analysis | Tier 3 |
| F-304 | AST-Based Source File Scoring | Tier 3 |
| F-305 | Cross-Contributor Style Convergence | Tier 3 |
| F-306 | Exportable Report (PDF / JSON) | Tier 3 |
| F-401 | Lexical Identifier Overlap | Engine |
| F-402 | Structural Concrete Claim Counter | Engine |
| F-403 | Local Embedding Similarity | Engine |
| F-404 | Hedging Phrase Density Detector | Engine |
| F-405 | Commit Distribution Analyser | Engine |
| F-406 | Documentation Circularity Detector | Engine |
| F-407 | Concrete Element Counter | Engine |
| F-408 | Symbol Existence Validator | Engine |
| F-409 | Personal Baseline Deviation | Engine |
| F-410 | Language Detection & Degradation | Engine |
| F-411 | Score Calibration & Baseline | Engine |
| F-501 | D3.js Treemap Overview | UI |
| F-502 | Virtualized Expandable Tree List | UI |
| F-503 | Treemap / Tree View Toggle | UI |
| F-504 | Contributor Quality Timeline Chart | UI |
| F-505 | Three-State Analysis Badges | UI |
| F-506 | Live Progress via SSE | UI |
| F-507 | Client-Side Analysis Queue | UI |
| F-601 | GraphQL API Batching | Infra |
| F-602 | Concurrency Limiter | Infra |
| F-603 | Aggressive Multi-Layer Caching | Infra |
| F-604 | Scan Depth Limiter | Infra |
| F-605 | Truncated Diff Fallback | Infra |
| F-606 | Worker Queue for Long Jobs | Infra |
| F-607 | Result Storage | Infra |
| F-608 | Monorepo & Large Repo Handling | Infra |
| F-701 | Review Quality Framing | Compliance |
| F-702 | Explainable Signal Breakdown | Compliance |
| F-703 | Session & Persistence Notice | Compliance |

**Total features documented:** 48

---

*PRD derived from `discussion.md` — Slop Scan Hackathon planning notes, May 2026.*

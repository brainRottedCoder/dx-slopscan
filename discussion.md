# Slop Scan Hackathon — Full Discussion Notes

> Complete record of the planning discussion for a GitHub Repo AI Slop Scanner targeting Track A (Code Review) + Track B (Docs & KBs) of the Slop Scan Hackathon (May 29 – Jun 1, 2026).

---

## Table of Contents

1. [Hackathon Overview](#1-hackathon-overview)
2. [Track Selection & Initial Ideas](#2-track-selection--initial-ideas)
3. [The Core Project Idea — GitHub Repo Slop Scanner](#3-the-core-project-idea--github-repo-slop-scanner)
4. [Idea Rating & Scorecard](#4-idea-rating--scorecard)
5. [Implementation Difficulties & Solutions](#5-implementation-difficulties--solutions)
6. [GitHub OAuth & Rate Limiting](#6-github-oauth--rate-limiting)
7. [Event-Driven Lazy Analysis Architecture](#7-event-driven-lazy-analysis-architecture)

---

## 1. Hackathon Overview

**Event:** Slop Scan Hackathon
**Dates:** May 29 – June 1, 2026 (72 hours)
**Format:** Online, Free
**Prize Pool:** $1,800 total

### What is "Slop"?

"Slop" was the 2025 Word of the Year (Merriam-Webster + American Dialect Society). Defined as "digital content of low quality that is produced usually in quantity by means of artificial intelligence." The problem is not AI usage itself — it's low-effort output that nobody reviewed before publishing.

### The Core Problem

- GitHub Copilot writes 46% of code in files where it's enabled
- Up to 22% of computer science papers show signs of AI-generated content
- 3% of front-page Amazon reviews are AI-generated (74% of those are five-star)
- PR descriptions get vaguer, docs get more circular, reviews get less trustworthy
- Nobody is working on catching it — only generating it

### Prize Structure

| Prize | Amount | Criteria |
|---|---|---|
| 1st Place | $800 | Best overall slop detection tool |
| 2nd Place | $400 | Exceptional execution across the board |
| 3rd Place | $200 | Creative detection approach |
| Sharpest Signal | $100 | Novel detection angle nobody else thought of |
| Community Choice | $300 | Voted by participants |

### Bonus Points Available

| Bonus | Difficulty | Points |
|---|---|---|
| The Bake-Off (accuracy metrics + confusion matrix) | Medium | +5 |
| Live Fire (demo on real scraped content) | Hard | +5 |
| Open Source Ready (installable package with CI) | Medium | +3 |
| Cross-Track Scanner (two or more tracks) | Hard | +3 |

### Judging Criteria

| Criterion | Weight |
|---|---|
| Detection Accuracy | 30% |
| Practical Usefulness | 25% |
| Technical Execution | 20% |
| Innovation | 15% |
| Presentation & Demo | 10% |

### Out of Scope (explicitly disqualified)

- Simple keyword detectors that flag em-dashes
- Wrappers around GPTZero or Originality.ai with new UI
- Tools that just ask another LLM "is this AI-generated?" (delegation, not detection)
- Projects that shame people for using AI instead of surfacing quality problems
- Ideas too big to demo in 72 hours

---

## 2. Track Selection & Initial Ideas

The user anchored on **Track A (Code Review)** as the primary track, with interest in combining it with others.

### Track A — Code Review

Detect hollow AI-generated pull requests, commit messages, and code comments that look right but say nothing.

Target audience: DevOps engineers, senior developers, platform teams.

Key deliverables:
- Detect auto-generated code review artifacts and flag hollow documentation
- Surface commits where the human clearly didn't read what the AI wrote before pushing
- Score PR descriptions for information density vs diff-restating filler
- Analyse commit message patterns to identify bulk AI-generated contributions

### Track B — Docs & KBs

Scan internal documentation for AI-generated filler that sounds correct but teaches nothing.

Target audience: Technical writers, developer advocates, engineering managers.

Key deliverables:
- Score documentation density — information per sentence, concrete examples per section
- Detect circular explanations where paragraphs reference each other without adding content
- Flag docs that don't contain a single concrete example, code snippet, or specific instruction
- Compare documentation claims against actual codebase behaviour

### Three Initial Ideas Proposed

#### Idea 1 — Semantic Diff Entropy Scanner (Track A + B, recommended)

**Core concept:** PRs and docs fail in the same way — they say *what* changed but never *why*. This tool computes "information delta": how much novel semantic content exists in a PR description vs the raw diff, and in a doc section vs the code it describes. Zero delta = pure slop.

**Detection signals:**
- Semantic embedding cosine similarity (PR description vs diff)
- Concept coverage ratio (doc claims vs codebase symbols)
- TF-IDF novelty score per sentence
- Circular reference detection in docs
- Hedging phrase density (basically, generally, typically, usually...)

**Bonus eligible:** Cross-track +3 points (covers A + B)

#### Idea 2 — PR Ghost Detector (Track A only)

**Core concept:** Detects the *absence of human review*, not just AI generation. When a dev pastes AI-generated code without reading it, specific micro-patterns appear: variable names that don't match project conventions, comments that describe functionality differently from the code, dead code left in by the LLM, and review responses that don't address specific line numbers.

**Detection signals:**
- Naming convention drift (repo-wide vs PR-local)
- Comment-to-code semantic consistency score
- Dead code and unreachable branch detection
- Review response specificity (line refs vs vague ACKs)
- Commit message vocabulary vs commit diff vocabulary

**Prize target:** "Sharpest Signal" — novel angle, hard to fake

#### Idea 3 — Contribution Graph Anomaly Detector (Track A + C)

**Core concept:** When AI writes bulk code, statistical fingerprints appear at the *repository level*: uniform commit cadence, suspiciously consistent PR size distribution, vocabulary entropy collapse across contributors.

**Detection signals:**
- Commit message perplexity distribution (LM scoring)
- Inter-commit vocabulary entropy over time
- PR size variance collapse detection
- Burstiness coefficient of commit timestamps
- Cross-contributor style convergence (stylometric)

**Bonus eligible:** Cross-track +3 points (covers A + C)

---

## 3. The Core Project Idea — GitHub Repo Slop Scanner

After reviewing initial ideas, the user proposed a comprehensive web application that would:

1. Accept a GitHub repo URL as input
2. Generate a visual tree/heatmap showing AI slop per file and folder
3. Show flakiness in documentation (false or missing claims)
4. Show contributor data — per-contributor analysis of PR automation and committed slop
5. Score all open PRs for AI slop content
6. Score PR descriptions for information density vs diff-restating filler
7. Analyse commit message patterns for bulk AI-generated contributions
8. Provide a brief analysis of whether documentation claims match actual project contents

### Why This Idea Is Strong

- "Paste a GitHub URL and see your repo's slop heatmap" is a demo that lands in the room — judges who are senior engineers will immediately want to run it on their own repos
- The contributor profiling feature (PR quality signal per person over time) is unique — nobody measures this
- PR info-density scoring maps directly onto Track A rubric — judges will tick that box immediately
- Doc-vs-codebase validation (does README claim X exist?) is a hard problem nobody else will attempt — instant differentiation on Track B
- Frictionless UX — no setup, just paste a URL

---

## 4. Idea Rating & Scorecard

### Scoring Against Hackathon Rubric

| Criterion | Score | Max | Notes |
|---|---|---|---|
| Detection Accuracy | 24 | 30 | Strong multi-signal approach |
| Practical Usefulness | 23 | 25 | Frictionless UX, real workflow fit |
| Technical Execution | 15 | 20 | Complexity is the risk |
| Innovation | 13 | 15 | Visual repo heatmap is genuinely novel |
| Presentation & Demo | 9 | 10 | Live demo is very strong |
| **Base total** | **84** | **100** | |
| Cross-track bonus | +3 | — | A + B coverage |
| **Effective total** | **87** | **~116** | Strong podium contender |

### What Makes It Genuinely Strong

- Visual repo tree with per-file slop heatmap is immediately demo-able — nobody has shipped this
- Contributor-level profiling is the most WOW feature in the room
- PR info-density scoring maps directly to Track A rubric
- Doc-vs-codebase validation (symbol existence check) is a hard problem tackled on Track B
- "Just paste a GitHub URL" UX is frictionless — judges can test live during demo

### Real Risks Identified

- **Scope is 3x a 72-hour project** — every feature listed would take a week each; ruthless cutting is required
- **GitHub API rate limits** — need GitHub OAuth or PAT flow on day 1, not as an afterthought
- **Detection without an LLM** — rules explicitly dock points for "just ask another LLM"; real linguistic/statistical signals required
- **Contributor shaming risk** — rules say don't shame people for using AI; frame as "review quality signal" not a guilt score
- **Doc-vs-code validation is very hard** — deep semantic validation is a PhD problem; limit to surface-level checks (does this function exist?)

### Recommended Scope for 72 Hours

**Build (core WOW):**
- Repo tree heatmap by slop score
- PR description info-density score
- Commit message entropy / pattern analysis
- Contributor slop profile (PR quality over time)
- README surface-level claim checker (symbol existence)

**Defer or cut:**
- Deep semantic doc-vs-behaviour validation
- Full file-level content slop scoring
- Historical trend charts per contributor
- Bulk PR batch analysis (do top 5 only)
- Any social/sharing features

---

## 5. Implementation Difficulties & Solutions

### 5.1 GitHub API — Rate Limits, Pagination, and Data Access

**Difficulty: Nightmare Tier**

#### Problem: Rate limits will kill you silently

- Unauthenticated REST API: 60 requests/hour
- A single medium repo (200 files, 50 PRs, 500 commits) needs 800–1,200 API calls to fully scan
- At 60/hr that's a 14-hour wait per repo
- Even authenticated you get 5,000/hr — a large monorepo can blow that in one scan
- GitHub GraphQL API has a separate node limit of 500,000 nodes/hour
- Burst-scanning hits secondary rate limits (429s) that aren't well documented

**Solution:**
- Always require GitHub PAT from the user — never anonymous
- Use GraphQL over REST: one GraphQL query can fetch a PR's title, body, diff, author, and first 100 comments in a single request vs 4 REST calls
- Implement exponential backoff with jitter on every request
- Cache everything aggressively in Redis or SQLite — if a commit SHA was scanned before, never re-fetch it
- Show a live progress indicator so the user doesn't assume it's broken

#### Problem: Paginating through history is a deep rabbit hole

- GitHub's commit list API returns max 100 per page
- A repo with 3,000 commits needs 30 API calls just for the list — before fetching any content
- PR lists, review comments, file trees all have their own pagination
- Naive sequential awaiting takes minutes for real repos
- Diffs for large files get truncated at 300 lines with no warning — the `patch` field contains a truncation marker

**Solution:**
- Set a hard scan depth limit: last 90 days of commits, last 50 PRs, first 3 levels of the file tree
- Use concurrent request pools (max 5 parallel) with a semaphore, not raw `Promise.all`
- For truncated diffs, detect the `@@ ... @@` truncation signal and fall back to fetching raw file content directly
- Never promise full-history analysis in v1 — scope to "recent activity window"

#### Problem: Private repos and permissions

- If the user enters a private repo URL, every API call returns 404 — not 403 (GitHub's design to prevent org enumeration)
- OAuth scopes are confusing: `repo` vs `public_repo` vs `read:org` each unlock different data
- Missing scope = silent empty responses on some endpoints

**Solution:**
- Implement GitHub OAuth app flow properly from day one
- Request `repo` scope (covers public + private)
- On any 404, first verify if the repo exists publicly before showing an error
- Show the user exactly which scopes the app has and what that enables

---

### 5.2 Detection Signals — Building Real Analysis Without an LLM

**Difficulty: Nightmare Tier**

> **Critical rule:** The hackathon explicitly disqualifies tools that "just ask another LLM if this is AI-generated." You cannot call OpenAI/Claude and ask "is this a slop PR?" Real linguistic and statistical signals are required.

#### Problem: PR description vs diff — the core detection problem

- Real signal: how much information in the PR description is just restating what's already visible in the diff?
- Computing semantic similarity between natural language text and code diffs is non-trivial
- Naive keyword overlap misses paraphrasing
- Pure embedding similarity requires running a model
- A diff that changes 1,000 lines of similar code looks identical to one changing 1,000 lines of genuinely different logic

**Solution — three-layer signal stack:**

1. **Lexical layer:** Extract identifiers from the diff (function names, variable names, class names) and measure what % appear verbatim in the description — high overlap = diff-restating slop
2. **Structural layer:** Count concrete claims in the description (specific line references, "because X", "fixes Y", "trade-off Z") vs vague filler ("updated", "improved", "refactored")
3. **Embedding layer:** Run `all-MiniLM-L6-v2` locally (40MB, fast CPU inference) to get cosine similarity between description and a natural-language summary of changed symbols

Combine into a weighted score. Each layer is independently explainable.

#### Problem: Commit message analysis — distinguishing human from AI

- AI-generated commit messages have statistical fingerprints: unusually consistent length (45–72 chars), high use of present-tense imperative verbs ("Add", "Update", "Fix", "Implement"), low variance in vocabulary across a contributor's history, suspiciously uniform structure
- But these same patterns describe a well-disciplined human who follows conventional commits
- False positive rate on good engineers will be high
- Short lazy commits like "wip" or "asdf" score as human (low perplexity) but are also slop — just a different kind

**Solution:**
- Don't score individual commits — score contributor commit *distributions*
- A human's commit messages have high variance in length, tone, and specificity over time
- An AI-assisted contributor shows low variance + high conventional-commit compliance + vocabulary entropy collapse
- Use rolling window stats: stddev of message length, type-token ratio of vocabulary, ratio of commits with body text vs subject-only
- Flag the pattern, not the individual commit

#### Problem: Documentation quality scoring — circular explanations and filler

- Detecting circular docs ("The config object configures the configuration") requires semantic self-reference detection
- AI docs have specific filler patterns: every section restates the heading, uses hedging adverbs ("typically", "generally", "usually"), has no concrete examples, and has suspiciously uniform paragraph length
- Measuring "no concrete examples" requires a definition of "concrete"

**Solution:**
- Define "concrete" operationally: code blocks, specific version numbers, command-line examples, named error messages, actual file paths
- Count these per section — a section with zero is abstract by definition
- For circularity, extract noun phrases from headings and check if they appear as the primary subject of the opening sentence
- For hedging density, maintain a curated list of ~80 AI-favoured hedging terms and score their frequency per 1,000 words
- All rule-based — fast, explainable, and defensible to judges

---

### 5.3 Repo File Tree — Parsing, Scoring, and Rendering at Scale

**Difficulty: Hard**

#### Problem: Monorepos will break the tree renderer

- A monorepo can have 50,000+ files across hundreds of folders
- GitHub's Trees API with `recursive=true` returns a flat JSON list that can be 5–15MB of raw JSON
- Parsing and building a nested tree structure in the browser will freeze the UI
- Rendering 50,000 tree nodes in the DOM will make the page unusable

**Solution:**
- Never render the full tree at once
- Use virtual scrolling (react-virtual or tanstack-virtual) — only render what's visible
- Score at the directory level first (aggregate slop score per folder), then lazy-load file-level scores on folder expand
- Cap the initial scan at top 3 directory levels
- For monorepos, let the user select a subdirectory to focus the analysis
- Show a "repo too large — scanning top 500 files" warning rather than silently degrading

#### Problem: Scoring file content — what signal to use?

- Fetching file content is straightforward, but "file-level slop score" for a `.ts` file is ambiguous
- AI-generated code has over-commented obvious things, consistent naming, dead code left in, and functions that are too long
- Measuring this reliably without an LLM is genuinely hard

**Solution:**
- Focus file-level scoring on documentation files (README, CHANGELOG, docs/ folder, inline JSDoc/docstrings) where slop signals are cleaner
- For source files, score comment-to-code ratio, comment redundancy (does the comment say exactly what the function name says?), and function length distribution
- Use AST parsing (tree-sitter via WASM in the browser, or a backend language parser) to extract real structure
- Limit source file deep-scan to files touched by flagged PRs or commits

---

### 5.4 Contributor Profiling — Accuracy, Fairness, and the False Positive Trap

**Difficulty: Hard**

#### Problem: A good engineer looks like an AI to a naive scorer

- Senior engineers who follow conventional commits, write clean PR descriptions, and maintain consistent style will score as "AI-generated" by naive detectors
- An engineer who writes "fix: resolve null pointer in UserService.authenticate() when session token is expired" is doing exactly what you'd ask an AI to do — but they're doing it correctly from experience
- False positive rate on good engineers will be embarrassing if judges test it on their own repos

**Solution:**
- Never show an absolute AI score — show a relative signal compared to the contributor's own baseline
- If someone has always written clean, consistent commit messages, that's their voice — flag deviations from their own pattern: sudden length uniformity, vocabulary shift, structural change
- Also weight by diff complexity: a clean message on a trivial 2-line fix is expected; a clean message on a 500-line cross-module refactor with zero explanation of the "why" is suspicious

#### Problem: The "naming and shaming" rule from the judges

- The hackathon rules explicitly say don't build tools that shame people for using AI
- A per-contributor "AI slop %" leaderboard sorted worst-to-best is exactly that
- If judges see this in the demo they will flag it, even if detection is accurate

**Solution:**
- Reframe completely: call it "review quality signal" not "AI detection per contributor"
- Show it as "PRs with low information density" — a factual, objective quality metric
- Default the contributor view to aggregate team stats, not individual rankings
- Make the per-contributor drill-down opt-in
- Frame as "your own signal" not a public leaderboard

---

### 5.5 Backend Architecture — Long-Running Jobs and Real-Time Progress

**Difficulty: Hard**

#### Problem: A full repo scan takes 2–10 minutes — HTTP will timeout

- Scanning a real repo (fetching 50 PRs + diffs + 500 commits + file tree + doc files + running embedding models) takes between 2 and 10 minutes
- A standard HTTP request will timeout in 30–60 seconds
- If you run everything synchronously in a single request you'll get a 504 on every real repo
- A job queue + polling or SSE/WebSockets is required — this backend complexity is where most teams silently fail

**Solution:**
- Use Server-Sent Events (SSE) from day one
- The client opens one SSE connection, the server streams progress events as each module completes (tree scan done → PR scan done → embedding done → report ready)
- On the backend, use a worker queue (BullMQ with Redis, or in-memory for demo)
- Each analysis module emits progress independently — file tree appears while PR analysis is still running
- This is the best demo moment: the repo filling in live in real time

#### Problem: Where to store results?

- If every scan is ephemeral, users can't revisit their report or share it with their team
- Full scan results for large repos can be hundreds of MB of structured data
- Over-engineering this kills velocity; under-engineering means re-scanning on every page load

**Solution:**
- Store scan results as a single compressed JSON blob per scan, keyed by `repoFullName + scanTimestamp`
- Use SQLite for metadata (scan status, repo name, timestamp, summary scores) and object storage (S3, Cloudflare R2, or local filesystem for demo) for the full result blob
- Cache by commit SHA of HEAD — if the repo HEAD hasn't changed, serve the cached report instantly
- TTL of 24 hours is fine for demo purposes

---

### 5.6 Embedding Models — Running Locally Without an LLM API

**Difficulty: Medium**

#### Problem: Sentence embeddings without calling an external LLM

- PR description vs diff similarity scoring needs embeddings
- Calling OpenAI Embeddings API would technically be "delegating to an AI" and might get flagged
- Running a large model locally is slow and memory-intensive
- Embedding code diffs with a text model gives poor-quality representations

**Solution:**
- Use `sentence-transformers/all-MiniLM-L6-v2` via ONNX Runtime — 40MB, runs on CPU in ~50ms per sentence, no GPU required
- For code specifically, use `microsoft/codebert-base` (also ONNX-exportable) to embed code snippets, and MiniLM for natural language text
- Convert the diff into a natural language summary using rule-based templates ("Changed functions: X, Y. Added parameters: Z") before embedding — this allows comparison within the same embedding space
- Everything runs locally and fast

---

### 5.7 Frontend — Visualizing Complex Hierarchical Data

**Difficulty: Medium**

#### Problem: The repo heatmap tree is harder than it looks

- A file tree with color-coded slop scores sounds straightforward but the interaction design is tricky
- Options: expandable tree list (familiar but slow to scan), treemap (shows scale but loses hierarchy), sunburst (beautiful but hard to read)
- Users need to see both the folder structure AND the relative severity of slop simultaneously
- Off-the-shelf tree components don't support per-node color scoring out of the box

**Solution:**
- Use D3.js treemap for the top-level overview (shows relative file size + slop severity as color)
- Use a standard expandable tree list for navigation/drilling down
- Implement both as two views with a toggle
- The treemap is the WOW screenshot — makes slop visible at a glance across the whole repo
- For the tree list, use react-arborist which supports per-node custom rendering and handles virtualization

#### Problem: Showing contributor timelines without looking like surveillance

- A chart of "PR quality score over time per contributor" can look like an HR surveillance dashboard depending on design choices
- Color choices, labels, and framing matter enormously
- Red bars labeled "AI slop detected" next to someone's name is very different from a neutral quality trend line

**Solution:**
- Use blue/neutral color palette for contributor views — never red for individual contributors
- Label axes as "information density score" not "AI score"
- Show team aggregate first, individual on drill-down
- Frame as "PR description quality over time"
- Add explanatory note: "Low scores indicate PR descriptions that closely mirror the visible diff without adding context"

---

### 5.8 Calibration — Making Scores Meaningful and Trustworthy

**Difficulty: Medium**

#### Problem: What does a score of 67 even mean?

- Without calibration, scores are meaningless numbers
- Judges will ask "how do you know this threshold is right?" — a question that needs a real answer

**Solution:**
- Before launch, manually scan 10–15 well-known open source repos (React, Flask, Django, Next.js, FastAPI) and build a baseline distribution
- Show scores relative to this baseline: "This PR scores in the bottom 15% of PRs across surveyed open source projects"
- For the bake-off bonus, this baseline becomes the accuracy evaluation dataset — pick repos where you can manually label 20 PRs as slop or not, then show the confusion matrix

#### Problem: Non-English repos will break everything

- Hedging word lists, filler phrase detectors, and lexical overlap measures are all English-specific
- A Japanese or Spanish repo will score randomly
- If a judge enters a non-English repo during the demo, the tool will produce garbage scores with high confidence

**Solution:**
- Detect the dominant language using a lightweight library (lingua-py or langdetect — fast and small)
- If non-English detected, disable rule-based signals and fall back to embedding-only scoring with a clear notice
- Better to show partial results honestly than confident wrong results

---

## 6. GitHub OAuth & Rate Limiting

### Does GitHub Login Solve the Rate Limit Problem?

**Short answer: Yes for the primary rate limit. No for secondary rate limits.**

### Rate Limit Tiers

| Auth Method | Requests/Hour |
|---|---|
| No auth (anonymous) | 60 |
| OAuth / PAT | 5,000 |
| GraphQL (OAuth) | 15,000 (node-based) |

### What OAuth Fixes

| Issue | Status |
|---|---|
| Primary rate limit (per hour) | Solved — 83x more headroom |
| Access to private repos | Solved — with `repo` scope |
| User identity (contributor profiling) | Solved — know who is scanning |
| Secondary rate limits (concurrency) | NOT solved — separate system |
| GraphQL node limits (500k nodes/hr) | NOT solved — separate quota |
| Large repo scan in under 2 minutes | Partial — depends on request design |

### The Secondary Rate Limit — The Real Wall

GitHub has an undocumented secondary rate limit that triggers when you make too many concurrent requests in a short window — regardless of your hourly quota. Fire 20 parallel requests at once and you get a `403 "secondary rate limit"` even with 4,900 of your 5,000 hourly requests remaining.

| Parameter | Value |
|---|---|
| Max safe concurrent requests | ~5 parallel |
| Min delay between requests (same resource) | ~100ms |
| Max requests per minute (safe zone) | ~80–90 |
| Penalty when triggered | 60s block + Retry-After header |
| Does OAuth help here? | No — it's per-IP + per-token |

### Real Scan Math — Medium Repo (200 files, 50 PRs, 300 commits)

| Operation | Requests |
|---|---|
| File tree fetch (recursive) | 1 |
| PR list + metadata (50 PRs, GraphQL) | 1 |
| PR diffs (50 PRs, paginated) | 50–100 |
| Commit list (300 commits, 100/page) | 3 |
| Commit messages + metadata (batched) | ~30 |
| Doc file contents (README, docs/) | 10–20 |
| **Total** | **~200 requests** |
| At 5 concurrent, 100ms delay | ~60–90 seconds |
| Hourly quota used | 200 / 5,000 (4%) |

**Conclusion:** For a medium repo, OAuth login completely solves the rate limit problem. A single user can scan ~25 repos per hour comfortably. Switching from REST to GraphQL for PRs and commits is the single biggest efficiency gain — batch 50 PR descriptions + authors into 1 query instead of 50 calls.

The thing that will actually cause problems is the **secondary rate limit** — fixed with `p-limit` (Node.js concurrency limiter, one line of setup) limiting to max 5 simultaneous requests.

---

## 7. Event-Driven Lazy Analysis Architecture

### The Core Insight

The user proposed making the deep analysis system event-driven: except for the initial overview scan, all deep/particular PR or contributor analysis would be initiated only when the user clicks to request it.

This is called **on-demand lazy analysis** — the same pattern used by SonarCloud and CodeClimate in production.

### Why It's the Right Call — Beyond Rate Limits

When someone pastes a repo URL, they don't know yet which PRs they care about or which contributor they're suspicious of. Forcing a 5-minute full scan before they see anything means staring at a loading spinner without knowing if the tool is even useful. With the event-driven approach, they see the overview in 30 seconds, get curious about a specific PR or contributor, click it, and the analysis appears in 10 seconds. This is a dramatically better product experience and will show in the demo.

### 3-Tier Analysis Model

#### Tier 1 — Auto Scan on Repo Submit
**Runs always | ~15–30 seconds | ~40 API calls**

- File tree fetch + folder-level slop heatmap (aggregate scores only)
- Last 20 PR titles + descriptions fetched (no diffs yet)
- Commit message list (last 100) — entropy + pattern scoring
- README + top-level docs fetched — surface slop score
- Contributor list + PR count per contributor
- Overall repo slop health score (summary card)

#### Tier 2 — Triggered on User Click
**On demand | ~5–15 seconds per item | ~20–60 API calls**

- Click a PR → fetch its full diff → run info-density score + diff-restate analysis
- Click a contributor → fetch their last 30 PRs + commit history → build quality timeline
- Click a folder → fetch + score every file inside it
- Click a doc file → run full circular reference + filler + claim-vs-code check
- Click "analyse all open PRs" → batch process all 50 PRs sequentially with progress bar

#### Tier 3 — Explicit "Deep Scan" Button
**User-initiated | 2–10 minutes | 200–800 API calls**

- Full commit history analysis (all time, not just last 100)
- Every PR diff scored (not just ones user clicked)
- All doc files deep-analysed (not just README)
- File-level source code scoring (AST-based comment redundancy)
- Cross-contributor style convergence analysis (stylometric comparison)
- Generates full exportable PDF/JSON report

### What This Architecture Solves

| Metric | Value |
|---|---|
| API calls on initial load | ~40 (vs 800 for full scan) |
| Time to first meaningful result | under 30 seconds |
| Hourly quota used on initial scan | ~1% |
| Cost of deep analysis | Paid only when user needs it |

### Event Flow — What Happens When User Clicks a PR

```
User clicks PR #42
  → Emit analyse:pr event
  → Show loading skeleton on that PR card
  → Fetch diff via GitHub API (1 request)
  → Run scoring pipeline (lexical + structural + embedding)
  → Stream results back via SSE
  → Cache result in-memory (keyed by PR number + updated_at)
  → Render inline — no page reload
  → Second click on same PR is instant (cache hit)
```

### New Difficulties Introduced by This Pattern

#### 1. Cache invalidation
If a PR gets updated while the user is looking at the cached analysis, they'll see stale scores.

**Solution:** Key the cache on `pr_number + updated_at timestamp`, not just PR number. Check the timestamp on click before deciding to use the cache.

#### 2. Partial state UI
The dashboard now shows a mix of "scored" and "not yet scored" items simultaneously. Without a clear visual language this looks broken.

**Solution:** Three distinct states for every item:
- Gray placeholder badge = "not yet analysed"
- Pulse animation = "analysing"
- Colored score badge = "done"

Users immediately understand the model without any explanation.

#### 3. Concurrent clicks
User clicks 5 PRs rapidly — the backend now has 5 simultaneous analysis jobs firing at GitHub, risking the secondary rate limit.

**Solution:** Client-side queue so only 1–2 analyses run at a time, with the others queued and shown as "waiting." Use `p-limit` with a concurrency of 2 — one line of setup.

#### 4. Session loss
User does 20 click-analyses, then refreshes the page — everything is gone.

**Solution:** Decide upfront whether to persist per-item results to the DB or accept session-only caching. For the hackathon, session-only with a clear "results are session-only" notice is fine and saves significant backend complexity.

---

## Summary — Key Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Auth | GitHub OAuth (not anonymous or PAT-only) | 83x rate limit increase, private repo access, user identity |
| API style | GraphQL over REST | Batch 50 PR objects in 1 query instead of 50 calls |
| Scan depth | Last 90 days, last 50 PRs, top 3 directory levels | Fits within rate limits, delivers fast first result |
| Analysis trigger | Event-driven (lazy on click) | 30s first result vs 10min full scan; better UX and demo |
| Concurrency | p-limit, max 5 parallel requests | Avoids secondary rate limits regardless of user behaviour |
| Progress updates | Server-Sent Events (SSE) | No timeout issues, real-time partial results |
| Result storage | Compressed JSON blob + SQLite metadata | Simple schema, fast retrieval, no ORM overhead |
| Embeddings | all-MiniLM-L6-v2 via ONNX Runtime (local) | No external LLM call, 40MB, CPU-fast, passes hackathon rules |
| Tree rendering | D3.js treemap (overview) + react-arborist (navigation) | WOW screenshot + practical drill-down |
| Score calibration | Baseline from 10–15 known OSS repos | Gives relative scoring, enables bake-off accuracy metrics |
| Language detection | lingua-py or langdetect | Graceful degradation on non-English repos |
| Contributor framing | "PR review quality signal" not "AI slop %" | Passes hackathon's no-shaming rule, more accurate framing |

---

## Detection Signals Reference

### For PR Descriptions (Track A)

| Signal | Method | What it catches |
|---|---|---|
| Identifier overlap | Extract symbols from diff, check % in description | Diff-restating filler |
| Concrete claim count | Count line refs, "because", "fixes", "trade-off" phrases | Vague vs specific writing |
| Embedding cosine similarity | all-MiniLM-L6-v2, description vs diff summary | Semantic redundancy |
| Hedging phrase density | Curated ~80-word list, per-1000-word frequency | AI hedging patterns |
| Description length vs diff size | Ratio check | Too short or too templated |

### For Commit Messages (Track A)

| Signal | Method | What it catches |
|---|---|---|
| Length stddev (per contributor) | Rolling window stats | Suspiciously uniform length |
| Type-token ratio | Vocabulary diversity over time | Entropy collapse |
| Imperative verb ratio | POS tagging | AI-style present-tense pattern |
| Body-text presence ratio | % commits with body vs subject-only | Auto-generated subject-only messages |
| Burstiness coefficient | Commit timestamp distribution | Bulk AI-generated batches |

### For Documentation (Track B)

| Signal | Method | What it catches |
|---|---|---|
| Concrete element count | Count code blocks, version numbers, commands, file paths | Abstract filler docs |
| Circular reference detection | Extract noun phrases from headings, check opening sentence subject | Self-referential explanations |
| Hedging adverb frequency | Curated list per 1,000 words | AI hedging language |
| Paragraph length variance | stddev of paragraph lengths per doc | Suspiciously uniform AI paragraphs |
| Symbol existence check | Extract claimed function/class names, verify in codebase | False documentation |

### For Contributor Profiling (Track A)

| Signal | Method | What it catches |
|---|---|---|
| Personal baseline deviation | Compare individual's stats to their own history | Style drift, not just "AI style" |
| Vocabulary shift | Embedding distance between old and new commit language | Sudden change in writing voice |
| PR complexity vs description depth | Diff line count vs description information density | Missing "why" on complex changes |
| Cross-contributor style convergence | Stylometric comparison across team | Everyone writing identically |

---

*Document generated from full planning discussion — Slop Scan Hackathon, May 2026.*
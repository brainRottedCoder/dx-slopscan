# Hugo — Slop Scan Hackathon Submission

**Hackathon:** Slop Scan · Hackathon Raptors · May 29 – Jun 1, 2026  
**Team:** Shubh Varshney (solo)  
**Primary track:** Track A — Code Review  
**Bonus track:** Track B — Docs & KBs (cross-track engine)  
**AI tools used:** Cursor, Claude (coding assistant)

---

## Live links

| Link | What |
|------|------|
| 🌐 **Web app** | https://dx-slopscan.vercel.app/scan |
| 🔌 **API** | https://dx-slopscan.onrender.com/health |
| 📦 **GitHub** | https://github.com/brainRottedCoder/dx-slopscan |
| 🖥️ **CLI** | `npx dx-slopscan check <github-pr-url>` |
| 🔩 **Chrome extension** | Load unpacked from `hugo-extension/` |

---

## What it does

Hugo scores a pull request description on a **0–100 scale** by measuring **epistemic contribution** — how much of the text could *not* be derived from reading the diff.

A description that only says *"updated the auth service"* scores differently from one that says *"root cause: token refresh fired 200ms after expiry on iOS clock-drift; fixed by refreshing at 80% TTL; tested with 45s offset via Charles proxy; risk: 20% more refresh calls on small nodes."*

Hugo catches the first kind. Zero LLM calls in the detection path.

---

## The detection approach

### Why not keyword matching

Keyword matching can be fooled by any template. Hugo instead measures *structure of thought*:

- **Novelty** — each sentence is compared to diff chunks via cosine similarity. High overlap = derivable = red.
- **Reasoning** — a regex parser finds causal, contrastive, tradeoff, hypothesis, and constraint acts in each clause — then scores the *quality of the reason*, not just its presence (`"because Redis"` > `"because it's faster"`).
- **Anchor** — causal connectors must reference specific entities extracted from the diff to count. `"because tokenManager.ts"` scores; `"because performance"` does not.
- **Mirror** — TF-IDF vocabulary overlap with the diff is penalised. Prose that just paraphrases the code changes fails this signal even if grammatically correct.
- **Coverage** — checklist matching with anti-gaming: a bare heading `"Root cause:"` without a substantive following clause does not count.
- **Specificity** — numbers, identifiers, and named artifacts must appear, not just generic abstractions.
- **Structure** — reviewer-oriented layout (WHY section, explicit risks, named reviewers) is detected structurally.

All seven signals (plus Reach and Lean) are combined in a weighted ensemble. The weights are **public** and **configurable**.

### Why it's hard to game

The signals are orthogonal. Adding filler sentences boosts word count but kills Lean. Copying identifiers from the diff inflates apparent specificity but raises Mirror. Adding a jargon-dense "context" paragraph without reasoning acts scores on Haze. The system detects **patterns of omission** — what's missing — not just what's present.

### Species classifier

After scoring, an auditable rule-based classifier assigns one of **11 slop species** based on signal combinations:

| Species | Pattern | Example fix |
|---------|---------|-------------|
| The Echo | High Mirror + Low Novelty | Replace "what changed" with "why it needed to change" |
| The Hollow | No WHY, No Risk, No Reasoning | Answer: what would a reviewer need to know? |
| The Haze | High jargon + zero causality | Replace abstract nouns with concrete claims |
| The Bullet | Bullet dump, no narrative | Add one paragraph explaining why this bundle exists |
| The Vault | Security diff, no security context | Name permissions changed and blast radius |
| The Ghost | Too short | Three sentences minimum: problem, approach, verification |
| The Stencil | Generic openers, interchangeable | Find one thing only THIS PR would say |
| The Padding | Low lean, high word count | Delete any sentence that adds no new fact or number |
| The Surface | Accurate WHAT, missing WHY | Add root cause and what was wrong before |
| The Spiral | Circular restatements | Each sentence must introduce exactly one new concept |
| The Fuse | No decision context | Add: why this approach and not the alternatives? |

Every species classification includes: a verbatim evidence substring, a counterfactual, and a one-sentence fix. No LLMs.

---

## Bonus point claims

### 🏆 The Bake-Off (+5) — accuracy metrics against labeled corpus

**Dataset:** `benchmark-corpus/` — **193** hand-labeled real PR descriptions  
- 87 slop PRs (label: 0)  
- 106 quality PRs (label: 1)

**Labeling criterion:** Did the description explain WHY, not just WHAT? Does it contain anything a reviewer couldn't infer from the diff?

**Results at threshold = 25 (fast mode, TF-IDF):**

| Metric | Value |
|--------|------:|
| Precision (slop detection) | **0.957** |
| Recall (slop detection) | **0.840** |
| F1 | **0.894** |
| Accuracy | **0.891** |

**Confusion matrix (193 total, threshold = 25):**

```
                   Predicted
                  Quality   Slop
Actual  Quality |   103  |   3  |   (106)
        Slop    |    14  |  73  |   (87)
                   (117)   (76)
```

- **True Positives (slop caught):** 73 / 87 = 83.9%  
- **False Positives (quality flagged):** 3 / 106 = 2.8%  
- **True Negatives (quality cleared):** 103 / 106 = 97.2%  
- **False Negatives (slop missed):** 14 / 87 = 16.1%

**Where it fails (honest):**

- Very short kernel-style PRs that are dense but terse (score < 40 even when high quality)
- Non-English descriptions (reasoning regexes are English-first; ~15% accuracy drop)
- Entity injection: copying identifier names from diff into prose can inflate Anchor
- High-context internal PRs where "obvious" WHY doesn't need writing down

Regenerate: `cd benchmark-corpus && python evaluate.py` (or `make benchmark`)

---

### 🔥 Live Fire (+5) — real content from the wild

Hugo analyzes actual public GitHub pull requests in real-time via the GitHub API.

**Try it now on real PRs:**

```bash
# Real production PRs — not synthetic test data
npx dx-slopscan check https://github.com/django/django/pull/17880
npx dx-slopscan check https://github.com/psf/requests/pull/6600
npx dx-slopscan check https://github.com/pallets/flask/pull/5421
```

Or paste any `github.com/*/pull/*` URL into https://dx-slopscan.vercel.app/scan.

**What the live output shows:**

1. Per-sentence heatmap: red (derivable from diff), orange (partial), green (novel), purple (epistemic act)
2. Signal breakdown: which of the 9 signals scored high/low and why
3. Species detected: which slop pattern was found, with verbatim evidence
4. What's missing checklist: WHY / tradeoffs / alternatives / risks / evidence / scope / rollback
5. Reviewer questions: exact questions a code reviewer would ask

**The Chrome extension** fires automatically on any public GitHub PR page — zero configuration. It scrapes the visible description + diff from the DOM and shows an inline badge without leaving GitHub.

---

### 📦 Open Source Ready (+3)

| Requirement | Status |
|------------|--------|
| Installable CLI package | `npx dx-slopscan check <url>` (npm, no install required) |
| Local Docker | `make demo` (single command, spins up API + UI) |
| CI | `.github/workflows/ci.yml` — pytest + frontend build on every push |
| Contribution guide | [`CONTRIBUTING.md`](CONTRIBUTING.md) — taxonomy, benchmark, signal, anti-gaming sections |
| Public repo | https://github.com/brainRottedCoder/dx-slopscan |
| License | MIT |

---

### 🔀 Cross-Track Scanner (+3)

Hugo's detection engine is unified — the same 9 signals work on both PR prose (Track A) and documentation (Track B).

**Track A — Code Review (`/scan`):**  
PR descriptions, commit messages, code review summaries. Signals tuned for diff-relative novelty and epistemic reasoning about code changes.

**Track B — Docs & KBs (`/doc-quality`):**  
Documentation pages, internal wikis, knowledge base articles. Same engine in `mode: "docs"`, coverage checklist extended with: working example, prerequisites, step-by-step, migration path.

Both tracks use identical backend (`POST /analyze` with `mode: "pr"` or `mode: "docs"`), identical signal weights, identical scoring range. The only difference is the coverage checklist triggers and output framing.

**Try Track B:**  
Paste any documentation section at https://dx-slopscan.vercel.app/doc-quality and select Track B mode.

---

## Presentation

### 2-minute script (for video / live demo)

1. **(0:00)** Open a GitHub PR that looks fine on first glance — descriptive title, a few bullet points, reasonable length.
2. **(0:20)** The Chrome extension has already scored it: `34/100 · Medium Slop · The Stencil`.
3. **(0:35)** Click the badge → scan page opens with full breakdown. Show the per-sentence heatmap: almost every sentence is red (derivable from diff) or orange.
4. **(1:00)** Show the species card: "Interchangeable with any other PR of this type. 'Updated the auth service' could describe 10,000 other PRs."
5. **(1:15)** Show the "What's missing" checklist: WHY, tradeoffs, risks all unchecked.
6. **(1:30)** Show the Template Generator: it produces a scaffold with the missing sections pre-filled as prompts.
7. **(1:45)** Paste the counterfactual from the score card (root cause → fix → risk → test). Re-analyze. Score jumps to `78/100 · Quality`.
8. **(2:00)** Show CLI: `npx dx-slopscan check <same-url>` — same score in the terminal. One command, zero config.

### Why judges will trust the numbers

- Detection logic is **fully auditable** — every sentence has a label and explanation
- Species rules are **readable if-statements** in `backend/detection/signals/species.py`
- Benchmark corpus is **public and reproducible** — 193 PRs, methodology documented
- We state failure modes explicitly — see Limitations above and `benchmark-corpus/limitations.md`

---

## Running locally (one command)

```bash
git clone https://github.com/brainRottedCoder/dx-slopscan
cd dx-slopscan
make demo
```

Opens API on `http://localhost:8000` and UI on `http://localhost:3000/scan`.

No GPU. No paid API keys. No special setup.

---

## Stack

| Layer | Tech | Why |
|-------|------|-----|
| Backend | FastAPI (Python 3.11) | Fast async, Pydantic models, easy Docker |
| Signals | scikit-learn, regex, TF-IDF, optional sentence-transformers | Zero LLM in detection |
| Frontend | Next.js 14 static export → Vercel | Fast, free hosting |
| CLI | Node.js (zero runtime deps) | `npx` works without install |
| Extension | Chrome MV3 content script | Runs where PRs are read |
| CI | GitHub Actions | pytest + build on every push |
| Deployment | Render (API) + Vercel (UI) | Free tiers, Docker-compatible |

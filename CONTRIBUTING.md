# Contributing to Hugo — dx-slopscan

**Owner:** Shubh Varshney · **Repository:** https://github.com/brainRottedCoder/dx-slopscan

Thanks for your interest. Contributions that improve detection accuracy, taxonomy coverage, or benchmark quality are most welcome.

---

## Quick setup

```bash
git clone https://github.com/brainRottedCoder/dx-slopscan
cd dx-slopscan

# Backend
cp backend/.env.example backend/.env   # add GITHUB_TOKEN (optional)
pip install -r backend/requirements.txt
uvicorn backend/main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev

# Or everything at once
make demo   # docker-compose up
```

Run tests before opening a PR:

```bash
make test         # pytest backend/tests/
make benchmark    # fast corpus evaluation
```

---

## Where to contribute

### 1 — Taxonomy (highest value)

The **11-species taxonomy** is the most impactful part of the project. A well-defined new species catches a pattern that the current signals miss as a species even if they score it low.

To propose a new species, open an issue with:

1. **Behavioral definition** — what does this species do that no current one captures?
2. **Measurable signal** — which signal combination indicates it? (e.g. `Structure > 0.7 AND Novelty < 0.3`)
3. **Three verbatim examples** — real PR descriptions that match the pattern
4. **One-sentence fix** — imperative; what the author should do differently
5. **Counterfactual** — the fixed version of one example

Existing species: ECHO, HOLLOW, HAZE, SPIRAL, SURFACE, STENCIL, FUSE, GHOST, BULLET, VAULT, PADDING.  
Code: [`backend/detection/signals/species.py`](backend/detection/signals/species.py)  
UX copy: [`frontend/lib/species.ts`](frontend/lib/species.ts)

### 2 — Benchmark corpus expansion

We have **193 labeled PRs** (106 quality, 87 slop). More labeled data improves F1 and makes the confusion matrix more reliable.

Labeling criterion:
- **Slop (0):** The description could have been written by reading only the diff. It describes *what* changed.
- **Quality (1):** The description contains WHY, tradeoffs, risks, or specifics that a reviewer couldn't infer. It contains *human thought*.

Secondary criterion: does it contain anything a code reviewer would learn that they couldn't get from reading `git diff`?

Format: `benchmark-corpus/generate_corpus.py` and `benchmark-corpus/labeling_methodology.md`  
If you label PRs, include your reasoning — we compute inter-rater agreement when comparing label batches.

### 3 — Signal improvements

All signals live under [`backend/detection/signals/`](backend/detection/signals/). Each has its own module:

| Signal | Module | What to improve |
|--------|--------|-----------------|
| Coverage | `coverage.py` | New epistemic checklist triggers; stricter anti-gaming |
| Novelty | `novelty.py` | Sentence splitter (nested lists, code-inline, CJK); embedding fallback |
| Reasoning | `reasoning.py` | Non-English epistemic act patterns; new act types |
| Anchor | `mirror.py` | Entity extraction from diff; cross-sentence reference tracking |
| Mirror | `mirror.py` | Exact-match duplicate detection; phrase-level overlap |
| Reach | `reach.py` | Diff chunking heuristics; uncovered chunk threshold |
| Lean | `lean.py` | Stopword list expansion; domain-specific filler lists |
| Specificity | `specificity.py` | Domain-specific identifier patterns; units/measurements |
| Structure | `structure.py` | New reviewer-oriented layout patterns |

Write tests in [`backend/tests/test_signals.py`](backend/tests/test_signals.py) for any new detection logic.

### 4 — Anti-gaming

The current anti-gaming logic (in Reasoning and Coverage) blocks:
- Entity stuffing (copying identifiers to inflate Anchor)
- Checklist header gaming (`"Root cause:"` without a substantive clause)
- Verbosity bombs (long clauses that don't add reasoning acts)

Known open vectors:
- **Wholesale sentence copying** from diff into description (exact match, not semantic)
- **Epistemic wrapper** — one or two genuine reasoning sentences around a sloppy body
- **Template injection** — filling checklist items with minimal content

If you have detection ideas for these, open an issue before implementing.

### 5 — Non-English support

The **Reasoning** signal uses English-first regex patterns. The Novelty and Reach signals use `paraphrase-MiniLM-L3-v2` which handles many languages via its multilingual training — but coverage varies. Contributions to expand reasoning act patterns for other languages are welcome.

---

## Pull request guidelines

- One feature or fix per PR
- **Write a PR description that would score ≥ 60 on Hugo** — practice what we preach
- Tests in `backend/tests/` for any new detection logic
- Update `frontend/lib/species.ts` if adding a species (matches backend enum)
- Update benchmark metrics in `README.md` if the confusion matrix changes significantly
- No dependencies that require paid APIs or non-standard system libraries

---

## Issue templates

**Bug:** Input text (or synthetic equivalent that reproduces it), actual output, expected output.

**New species:** Behavioral definition, signal combination, three verbatim examples, one-sentence fix, counterfactual.

**False positive:** PR description that scored low but deserves high — include why you believe so and what the engine got wrong.

**False negative:** PR description that scored high despite being slop — include the specific pattern you think the engine missed.

---

## Running the full test suite

```bash
# Signal unit tests (35 tests)
make test

# Fast benchmark (TF-IDF, ~10s, 193 labeled PRs)
make benchmark

# Full benchmark (sentence-transformers, requires pip install sentence-transformers)
make benchmark-full

# Anti-gaming adversarial scenarios (50 tests)
make adversarial

# Ablation / cross-validation study
make cross-validate
```

---

## License

MIT. By contributing, you agree your contributions are licensed under the same terms.

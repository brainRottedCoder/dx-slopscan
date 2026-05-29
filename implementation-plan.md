# Full Implementation Plan — GitHub Repo Slop Scanner

**Version:** 1.0  
**Based on:** `prd.md` + `discussion.md`  
**Authored by:** Senior Engineer perspective (DevOps + System Design + Full-Stack)  
**Build Target:** 72-hour hackathon MVP with production-grade architecture

---

## Engineering Principles (Apply to Every Phase)

Before phases begin, every contributor must internalize these non-negotiable standards:

```
CODE RULES
──────────
1.  TypeScript strict mode everywhere. No `any`. No `!` non-null assertions.
2.  Every function has a single responsibility. Max 40 lines per function.
3.  Every module exports only what other modules must consume. No barrel leaks.
4.  No magic numbers. Every constant is named and exported from a constants file.
5.  Errors are typed. Never `throw new Error("string")` — always a domain error class.
6.  No implicit side effects. Pure functions for all scoring and detection logic.
7.  Every async function handles rejection explicitly. No unhandled promise rejections.
8.  All environment variables validated at startup with a schema (zod). App crashes fast if config is missing.
9.  Comments explain WHY, never WHAT. Code explains what.
10. Every file under 200 lines. If it grows beyond that, split it.

NAMING
──────
- Files:               kebab-case          (pr-analyser.ts)
- Types/Interfaces:    PascalCase
- Functions/variables: camelCase
- Constants:           SCREAMING_SNAKE_CASE
- React components:    PascalCase, one component per file
- Test files:          *.test.ts or *.spec.ts, co-located with the module

TESTING RULES
─────────────
- Every detection signal function has unit tests before being used in a pipeline.
- Every API route has integration tests.
- No mocking of internal domain logic — only mock external I/O (GitHub API, filesystem).
- Tests run in CI on every push. No phase is "done" without green tests.
```

---

## Master File Structure

This structure is fixed before Phase 1 begins. Every new file goes into the right location. No exceptions.

```
slop-scanner/
│
├── apps/
│   ├── web/                            # React + TypeScript frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/                 # Dumb presentational components
│   │   │   │   ├── features/           # Feature-specific smart components
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── scan/
│   │   │   │   │   ├── heatmap/
│   │   │   │   │   ├── pr-analysis/
│   │   │   │   │   ├── contributors/
│   │   │   │   │   └── docs/
│   │   │   │   └── layout/
│   │   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── stores/                 # Zustand state stores
│   │   │   ├── services/               # API client calls (no logic)
│   │   │   ├── utils/                  # Pure frontend utilities
│   │   │   ├── types/                  # Frontend-only types
│   │   │   ├── constants/
│   │   │   ├── pages/
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── vitest.config.ts
│   │   └── package.json
│   │
│   └── api/                            # Node.js + TypeScript backend (Fastify)
│       ├── src/
│       │   ├── routes/                 # Route handlers only — no logic
│       │   │   ├── auth.routes.ts
│       │   │   ├── scan.routes.ts
│       │   │   ├── pr.routes.ts
│       │   │   ├── contributor.routes.ts
│       │   │   └── docs.routes.ts
│       │   ├── services/               # Orchestration layer
│       │   │   ├── scan.service.ts
│       │   │   ├── pr.service.ts
│       │   │   ├── contributor.service.ts
│       │   │   └── docs.service.ts
│       │   ├── workers/                # BullMQ job definitions
│       │   │   ├── scan.worker.ts
│       │   │   └── deep-scan.worker.ts
│       │   ├── sse/                    # SSE stream management
│       │   │   └── sse-manager.ts
│       │   ├── cache/                  # Cache layer abstraction
│       │   │   ├── sqlite.cache.ts
│       │   │   └── memory.cache.ts
│       │   ├── db/                     # SQLite schema + migrations
│       │   │   ├── schema.ts
│       │   │   └── migrations/
│       │   ├── config/                 # Env + app config (zod-validated)
│       │   │   └── env.ts
│       │   ├── errors/                 # Typed domain error classes
│       │   │   └── domain-errors.ts
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts
│       │   │   └── rate-limit.middleware.ts
│       │   └── server.ts
│       ├── tests/
│       │   ├── unit/
│       │   ├── integration/
│       │   └── fixtures/               # Static mock GitHub API responses
│       └── package.json
│
├── packages/
│   ├── detection/                      # Pure detection engine (no I/O, no framework)
│   │   ├── src/
│   │   │   ├── pr/
│   │   │   │   ├── lexical-overlap.ts
│   │   │   │   ├── concrete-claims.ts
│   │   │   │   ├── hedging-density.ts
│   │   │   │   ├── diff-restate.ts
│   │   │   │   └── pr-scorer.ts        # Composes above into final score
│   │   │   ├── commits/
│   │   │   │   ├── length-stats.ts
│   │   │   │   ├── type-token-ratio.ts
│   │   │   │   ├── verb-ratio.ts
│   │   │   │   ├── burstiness.ts
│   │   │   │   └── commit-scorer.ts
│   │   │   ├── docs/
│   │   │   │   ├── concrete-elements.ts
│   │   │   │   ├── circularity.ts
│   │   │   │   ├── hedging-density.ts
│   │   │   │   ├── paragraph-variance.ts
│   │   │   │   ├── symbol-validator.ts
│   │   │   │   └── doc-scorer.ts
│   │   │   ├── contributors/
│   │   │   │   ├── baseline.ts
│   │   │   │   ├── vocabulary-shift.ts
│   │   │   │   └── contributor-scorer.ts
│   │   │   ├── embeddings/
│   │   │   │   ├── minilm.ts           # all-MiniLM-L6-v2 ONNX wrapper
│   │   │   │   ├── codebert.ts         # codebert-base ONNX wrapper
│   │   │   │   └── similarity.ts       # cosine similarity utilities
│   │   │   ├── language/
│   │   │   │   └── detector.ts         # Language detection + graceful degradation
│   │   │   ├── calibration/
│   │   │   │   ├── baseline-store.ts   # OSS baseline percentile data
│   │   │   │   └── relative-scorer.ts  # Percentile conversion
│   │   │   └── constants/
│   │   │       ├── hedging-terms.ts    # ~80 hedging words
│   │   │       ├── imperative-verbs.ts # AI-style commit verb list
│   │   │       └── signal-weights.ts   # Weighted scoring constants
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── github-client/                  # GitHub API abstraction (no detection logic)
│   │   ├── src/
│   │   │   ├── graphql/
│   │   │   │   ├── queries/            # .graphql files or typed template literals
│   │   │   │   └── graphql-client.ts
│   │   │   ├── rest/
│   │   │   │   └── rest-client.ts
│   │   │   ├── throttle/
│   │   │   │   ├── p-limit-pool.ts     # max-5 concurrent wrapper
│   │   │   │   └── backoff.ts          # exponential backoff + jitter
│   │   │   ├── adapters/               # Map raw GitHub responses → domain types
│   │   │   │   ├── pr.adapter.ts
│   │   │   │   ├── commit.adapter.ts
│   │   │   │   └── tree.adapter.ts
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── shared-types/                   # Zero-dependency type definitions
│       ├── src/
│       │   ├── scan.types.ts
│       │   ├── pr.types.ts
│       │   ├── commit.types.ts
│       │   ├── contributor.types.ts
│       │   ├── doc.types.ts
│       │   ├── score.types.ts
│       │   └── sse.types.ts
│       └── package.json
│
├── scripts/
│   ├── seed-baseline.ts                # Pre-scan OSS repos for calibration
│   ├── download-onnx-models.ts         # Pull ONNX model files at build time
│   ├── run-bakeoff.ts                  # Generate confusion matrix from labelled set
│   └── health-check.ts
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # Lint + test on every push
│       └── baseline-seed.yml           # Weekly OSS baseline refresh
│
├── models/                             # ONNX model files (gitignored, downloaded at build)
│   ├── minilm/
│   └── codebert/
│
├── data/
│   └── baseline/
│       ├── baseline-scores.json        # Pre-computed OSS baseline distributions
│       └── labelled-evaluation-set.json  # Manually labelled PRs for bake-off
│
├── docker-compose.yml                  # Local dev (Redis if needed for BullMQ)
├── turbo.json                          # Turborepo pipeline config
├── pnpm-workspace.yaml
├── package.json                        # Root workspace package
├── tsconfig.base.json                  # Shared strict TS config
├── .eslintrc.base.json                 # Shared ESLint config
├── .prettierrc
├── .env.example                        # All required env vars documented
└── COMPLIANCE.md                       # Framing decisions — why no "AI score" labels
```

---

## Phase Overview (Feature → Phase Mapping)

| Phase | Name | PRD Features | Gate Condition |
|---|---|---|---|
| 1 | Foundation & Monorepo Setup | None (scaffolding) | CI green, types compile, dev server starts |
| 2 | GitHub Integration Layer | F-001, F-002, F-003 | OAuth flow complete, API calls work, rate limiting active |
| 3 | Detection Engine Core | F-401–F-408 | All signal functions unit-tested, scores deterministic |
| 4 | Tier 1 Scan Backend | F-101–F-107, F-601–F-608 | Scan pipeline returns in ≤30s, SSE streams, results cached |
| 5 | Tier 1 Frontend & Heatmap | F-501–F-507, F-107 UI | Treemap renders, badges work, live SSE progress visible |
| 6 | Tier 2 On-Demand Analysis | F-201–F-206, F-409–F-410 | Click-to-analyse works for PR, folder, contributor, docs |
| 7 | Calibration, Compliance & Polish | F-411, F-203, F-205, F-701–F-703 | Relative scores show, deep doc scan works, no shaming |
| 8 | Tier 3, Export & Demo Hardening | F-301–F-306, F-606 | Deep scan button works, export works, demo rehearsed |

---

## Phase 1 — Foundation, Monorepo & Tooling

### Objective
Zero feature code. One hundred percent infrastructure. Every developer must be able to
`pnpm install && pnpm dev` and have a working skeleton in under 5 minutes. CI must pass.
The monorepo build graph must be correctly wired before any feature work begins.

### 1.1 Monorepo Scaffold (Turborepo + pnpm workspaces)

```bash
pnpm init
pnpm add -D turbo
```

`turbo.json`:
```json
{
  "pipeline": {
    "build":     { "dependsOn": ["^build"], "outputs": ["dist/**"] },
    "test":      { "dependsOn": ["build"] },
    "typecheck": { "dependsOn": ["^build"] },
    "lint":      {}
  }
}
```

`packages/detection` builds before `apps/api` imports it. This ordering is enforced by the
pipeline, not by convention.

### 1.2 Shared TypeScript Config

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "skipLibCheck": false
  }
}
```

Every `tsconfig.json` in `apps/` and `packages/` extends this. `strict` is never
overridden to false anywhere in the project.

### 1.3 `packages/shared-types` — Wire All Domain Types First

All types used across the system are defined here before any feature code is written.

```typescript
// packages/shared-types/src/score.types.ts
export interface SignalScore {
  readonly signal:      string;
  readonly value:       number;       // 0–1 normalized
  readonly weight:      number;
  readonly explanation: string;
}

export interface CompositeScore {
  readonly total:       number;       // 0–100
  readonly grade:       'A' | 'B' | 'C' | 'D' | 'F';
  readonly signals:     SignalScore[];
  readonly computedAt:  string;       // ISO timestamp
}

// packages/shared-types/src/sse.types.ts
export type SseEventType =
  | 'scan:started'
  | 'scan:tree_done'
  | 'scan:prs_done'
  | 'scan:commits_done'
  | 'scan:docs_done'
  | 'scan:complete'
  | 'scan:error'
  | 'analysis:started'
  | 'analysis:complete';

export interface SseEvent<T = unknown> {
  readonly type:      SseEventType;
  readonly scanId:    string;
  readonly payload:   T;
  readonly timestamp: string;
}
```

### 1.4 ESLint + Prettier Configuration

`.eslintrc.base.json` must enforce:
- `@typescript-eslint/no-explicit-any: error`
- `@typescript-eslint/consistent-type-imports: error`
- `no-console: warn` (use structured logger in production paths)
- `import/order` with group separation enforced
- `unicorn/filename-case: ['error', { case: 'kebabCase' }]`

### 1.5 Frontend Scaffold (Vite + React + TypeScript + Tailwind)

```bash
pnpm create vite apps/web --template react-ts
pnpm add tailwindcss @tailwindcss/typography
```

Theme tokens defined in `tailwind.config.ts` at this stage — not retroactively:
```typescript
colors: {
  score: {
    high:   '#22c55e',  // green-500  — used on folder/repo-level
    medium: '#f59e0b',  // amber-500
    low:    '#6b7280',  // gray-500   — neutral; used on contributor views
    danger: '#ef4444',  // red-500    — only repo-level, NEVER per-contributor
  }
}
```

### 1.6 Backend Scaffold (Fastify + TypeScript)

```bash
pnpm add fastify @fastify/cors @fastify/cookie @fastify/session
```

`server.ts` registers plugins and routes only. Zero business logic lives here.

### 1.7 Environment Validation (Zod — Fail Fast)

```typescript
// apps/api/src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  GITHUB_CLIENT_ID:     z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  SESSION_SECRET:       z.string().min(32),
  PORT:                 z.coerce.number().default(3001),
  NODE_ENV:             z.enum(['development', 'test', 'production']),
  DB_PATH:              z.string().default('./data/slop.db'),
  MODELS_DIR:           z.string().default('./models'),
});

export const env = envSchema.parse(process.env);
// App crashes immediately on startup if any var is missing or invalid.
// Never fails at runtime due to missing config.
```

### 1.8 CI Pipeline

`.github/workflows/ci.yml`:
```yaml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo lint
      - run: pnpm turbo typecheck
      - run: pnpm turbo build
      - run: pnpm turbo test
```

### Phase 1 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `shared-types` compiles with zero errors | Build | `tsc --noEmit` exits 0 |
| ESLint runs on all packages | Lint | Zero errors |
| Frontend dev server starts | Manual | `localhost:5173` serves HTML |
| Backend starts and `/health` returns 200 | Integration | curl returns 200 |
| Env schema rejects missing vars | Unit | `env.ts` throws on bad input |
| Turbo pipeline resolves in correct order | Build | `turbo build --dry` shows correct dep graph |

### Phase 1 Gate Checklist
- [ ] `pnpm install && pnpm dev` works fresh on a clean machine
- [ ] All TypeScript compiles in strict mode with zero errors
- [ ] CI workflow runs and passes on GitHub
- [ ] Tailwind theme tokens committed and documented
- [ ] All shared types from PRD §7 are in `shared-types` — no placeholders

---

## Phase 2 — GitHub Integration Layer

### Objective
Build the entire GitHub API client (`packages/github-client`) and the complete OAuth flow
(F-001, F-002, F-003). No feature code uses GitHub directly — everything must go through
this package. Rate limiting and backoff are live here before a single scan runs.

### 2.1 `packages/github-client` — Rate-Limited GraphQL + REST

```typescript
// packages/github-client/src/throttle/p-limit-pool.ts
import pLimit from 'p-limit';

export const MAX_CONCURRENT = 5;
export const githubPool = pLimit(MAX_CONCURRENT);
// Every outbound GitHub API call is wrapped: githubPool(() => fetch(...))
```

```typescript
// packages/github-client/src/throttle/backoff.ts
export async function withBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err) || attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt + jitter(), 30_000);
      await sleep(delay);
    }
  }
  throw new Error('unreachable');
}

function jitter(): number {
  return Math.random() * 500;
}
```

Retryable errors: 429, 503, network timeouts, secondary rate limit 403.
Non-retryable: 401, 404, 422.

### 2.2 GraphQL Client With Typed Queries

Every query lives in its own file with a fully typed response interface:

```typescript
// packages/github-client/src/graphql/queries/get-prs.ts
export const GET_RECENT_PRS = `
  query GetRecentPRs($owner: String!, $name: String!, $count: Int!) {
    repository(owner: $owner, name: $name) {
      pullRequests(last: $count, orderBy: {field: UPDATED_AT, direction: DESC}) {
        nodes {
          number title body state createdAt updatedAt
          author { login avatarUrl }
          additions deletions changedFiles
        }
      }
    }
  }
`;

export interface GetRecentPrsResponse {
  repository: {
    pullRequests: {
      nodes: GithubPrNode[];
    };
  };
}
```

No inline query strings in service code. Ever.

### 2.3 Domain Adapters

Map raw GitHub shapes to shared-types domain models. The rest of the codebase only
ever handles domain types — never raw GitHub API response shapes.

```typescript
// packages/github-client/src/adapters/pr.adapter.ts
import type { GithubPrNode } from '../graphql/response-types.js';
import type { PullRequest } from '@slop-scanner/shared-types';

export function adaptPr(node: GithubPrNode): PullRequest {
  return {
    number:       node.number,
    title:        node.title,
    body:         node.body ?? '',
    state:        node.state,
    author:       node.author?.login ?? 'ghost',
    avatarUrl:    node.author?.avatarUrl ?? null,
    createdAt:    node.createdAt,
    updatedAt:    node.updatedAt,
    additions:    node.additions,
    deletions:    node.deletions,
    changedFiles: node.changedFiles,
  };
}
```

### 2.4 GitHub OAuth Flow (F-002)

Routes in `apps/api/src/routes/auth.routes.ts`:

| Route | Purpose |
|---|---|
| `GET /auth/github` | Redirect to GitHub OAuth with `repo` scope |
| `GET /auth/github/callback` | Exchange code for token, store in session, redirect frontend |
| `GET /auth/me` | Return user identity + capabilities JSON |
| `POST /auth/logout` | Clear session |

Session stores the access token encrypted server-side. The token is **never** sent to
the browser in any response body.

### 2.5 Repository URL Parsing (F-001)

```typescript
// packages/github-client/src/parse-repo-url.ts
export function parseRepoUrl(url: string): RepoRef {
  const pattern = /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?(?:tree\/([^/]+))?$/;
  const match = url.match(pattern);
  if (!match) throw new InvalidRepoUrlError(url);
  return { owner: match[1]!, repo: match[2]!, branch: match[3] };
}
```

Handles: trailing slash, `.git` suffix, branch ref in URL, HTTPS and SSH formats.

### 2.6 Scope Transparency (F-003)

`GET /auth/me` returns capabilities object:
```typescript
{
  login:        string,
  scopes:       string[],
  capabilities: {
    privateRepos:  boolean,
    prAccess:      boolean,
    commitAccess:  boolean,
  }
}
```

Frontend `<ScopePanel />` renders this as a collapsible pre-scan information panel.

### Phase 2 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `parseRepoUrl` parses 8 valid URL formats | Unit | All return correct `{ owner, repo, branch }` |
| `parseRepoUrl` throws typed error on bad URL | Unit | `InvalidRepoUrlError` thrown |
| `withBackoff` retries on 429 exactly N times | Unit | Mock fn called N+1 times before success |
| `withBackoff` does not retry 404 | Unit | Throws immediately, called once |
| `adaptPr` maps all fields correctly | Unit | Every field present, no extra fields |
| `githubPool` never exceeds 5 concurrent | Unit | Spy confirms max concurrency |
| OAuth redirect contains `scope=repo` | Integration | 302 location header inspected |
| `/auth/me` returns 401 when not logged in | Integration | Status 401 confirmed |
| GraphQL client propagates typed API error | Integration | `GitHubApiError` is instance-checked |
| REST diff fetch handles truncation marker | Unit | Truncated diff detected correctly |

### Phase 2 Gate Checklist
- [ ] OAuth login completes end-to-end in dev environment
- [ ] All GitHub calls verified to go through `githubPool` (test assertion)
- [ ] No raw `fetch` or `axios` calls exist outside `github-client` package
- [ ] Adapters cover all 4 domain types: PR, commit, tree, contributor
- [ ] Rate limit response headers logged on every API response
- [ ] `.env.example` updated with all required OAuth vars

---

## Phase 3 — Detection Engine Core

### Objective
Build every detection signal as a **pure function** in `packages/detection`. Zero I/O.
Zero framework dependencies. Fully unit-tested before any pipeline uses them.
This is the intellectual core of the product and must be bulletproof.

### 3.1 PR Detection Signals (F-401, F-402, F-404)

Each signal is a separate module. Typed input → `SignalScore` output.

```typescript
// packages/detection/src/pr/lexical-overlap.ts

export interface LexicalOverlapInput {
  readonly diffSymbols:      string[];  // identifiers extracted from diff
  readonly descriptionText:  string;
}

export function computeLexicalOverlap(input: LexicalOverlapInput): SignalScore {
  const { diffSymbols, descriptionText } = input;
  if (diffSymbols.length === 0) {
    return buildSignalScore('lexical_overlap', 0, SIGNAL_WEIGHTS.LEXICAL_OVERLAP,
      'No symbols in diff — cannot compute overlap');
  }
  const lowerDesc = descriptionText.toLowerCase();
  const found = diffSymbols.filter(s => lowerDesc.includes(s.toLowerCase()));
  const value  = found.length / diffSymbols.length;
  return buildSignalScore(
    'lexical_overlap', value, SIGNAL_WEIGHTS.LEXICAL_OVERLAP,
    `${found.length} of ${diffSymbols.length} diff symbols appear verbatim in description`,
  );
}
```

```typescript
// packages/detection/src/pr/concrete-claims.ts

const CONCRETE_PATTERNS = [
  /\bfixes?\s+#\d+/i,
  /\bbecause\b/i,
  /\bdue\s+to\b/i,
  /\btrade.?off\b/i,
  /line\s+\d+/i,
  /\bbreaking\s+change\b/i,
] as const;

export function countConcreteClaims(text: string): SignalScore {
  const matches = CONCRETE_PATTERNS.filter(p => p.test(text));
  const normalized = Math.min(matches.length / 3, 1); // 3+ claims = full score
  return buildSignalScore('concrete_claims', normalized, SIGNAL_WEIGHTS.CONCRETE_CLAIMS,
    `Found ${matches.length} concrete claim(s)`);
}
```

```typescript
// packages/detection/src/constants/hedging-terms.ts
export const HEDGING_TERMS: readonly string[] = [
  'typically', 'generally', 'usually', 'basically', 'essentially',
  'in most cases', 'it is worth noting', 'it should be noted',
  'somewhat', 'rather', 'fairly', 'quite', 'simply', 'just',
  'arguably', 'perhaps', 'possibly', 'might', 'could potentially',
  // ... ~80 total — no duplicates (enforced by test)
] as const;

// packages/detection/src/pr/hedging-density.ts
export function computeHedgingDensity(text: string): SignalScore {
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 10) return zeroScore('hedging_density', 'Text too short to score');
  const per1000 = (countHedges(text) / wordCount) * 1000;
  const normalized = Math.min(per1000 / 20, 1); // 20+ per 1000 = max slop signal
  return buildSignalScore('hedging_density', normalized, SIGNAL_WEIGHTS.HEDGING_DENSITY,
    `${per1000.toFixed(1)} hedging terms per 1,000 words`);
}
```

### 3.2 Commit Distribution Analyser (F-405)

Distribution-level scoring only — never score a single commit in isolation.

```typescript
// packages/detection/src/commits/burstiness.ts
// Fano factor: variance/mean of inter-commit intervals
// High value = commits cluster in bursts (AI batch-writing signature)
export function computeBurstiness(isoTimestamps: string[]): number {
  if (isoTimestamps.length < 3) return 0;
  const ms        = isoTimestamps.map(t => Date.parse(t)).sort((a, b) => a - b);
  const intervals = ms.slice(1).map((t, i) => t - ms[i]!);
  const mean      = avg(intervals);
  const variance  = avgSquaredDiff(intervals, mean);
  return mean === 0 ? 0 : variance / mean;
}
```

```typescript
// packages/detection/src/commits/commit-scorer.ts
export interface CommitBatch {
  readonly messages:   string[];
  readonly timestamps: string[];
}

export function scoreCommitDistribution(batch: CommitBatch): CompositeScore {
  const lengthStats  = computeLengthStats(batch.messages);
  const ttr          = computeTypeTokenRatio(batch.messages);
  const verbRatio    = computeImperativeVerbRatio(batch.messages);
  const bodyRatio    = computeBodyPresenceRatio(batch.messages);
  const burstiness   = computeBurstiness(batch.timestamps);
  return composeScore([lengthStats, ttr, verbRatio, bodyRatio,
    buildSignalScore('burstiness', normalize(burstiness), SIGNAL_WEIGHTS.BURSTINESS,
      `Fano factor: ${burstiness.toFixed(2)}`)]);
}
```

### 3.3 Documentation Signals (F-406, F-407, F-408)

```typescript
// packages/detection/src/docs/concrete-elements.ts
const CONCRETE_PATTERNS = {
  codeBlock:    /```[\s\S]*?```/g,
  inlineCode:   /`[^`]+`/g,
  semver:       /\bv?\d+\.\d+\.\d+\b/g,
  shellCommand: /^\$\s+.+/gm,
  filePath:     /(?:^|[\s(])(\.{0,2}\/[\w./\-]+\.\w+)/gm,
  namedError:   /\b[A-Z][a-zA-Z]+Error\b/g,
} as const;

export function countConcreteElements(text: string): ConcreteElementScore {
  return Object.fromEntries(
    Object.entries(CONCRETE_PATTERNS).map(([key, pattern]) => [
      key, (text.match(pattern) ?? []).length,
    ]),
  ) as ConcreteElementScore;
}
```

```typescript
// packages/detection/src/docs/circularity.ts
// Detects: "The config object configures the configuration"
// Method: extract noun phrases from heading, check if they are
// the primary subject of the section's opening sentence.
export function detectCircularReferences(sections: DocSection[]): CircularityFlag[] {
  return sections
    .map(section => {
      const headingNouns    = extractNounPhrases(section.heading);
      const openingSubjects = extractNounPhrases(getFirstSentence(section.body));
      const overlap         = intersection(headingNouns, openingSubjects);
      return overlap.length > 0
        ? { sectionHeading: section.heading, overlappingTerms: overlap }
        : null;
    })
    .filter((f): f is CircularityFlag => f !== null);
}
```

```typescript
// packages/detection/src/docs/symbol-validator.ts
// Surface-level check only: does claimed symbol exist in codebase index?
// Not runtime behavior validation (that is out of scope for v1).
export function validateSymbolClaims(
  docText:        string,
  codebaseIndex:  CodebaseIndex,
): SymbolValidationResult {
  const claimed  = extractClaimedSymbols(docText);
  const verified = claimed.filter(s => codebaseIndex.symbols.has(s));
  const missing  = claimed.filter(s => !codebaseIndex.symbols.has(s));
  return { claimed, verified, missing, accuracy: verified.length / (claimed.length || 1) };
}
```

### 3.4 Embedding Module (F-403) — Local ONNX, No External LLM

```typescript
// packages/detection/src/embeddings/minilm.ts
// all-MiniLM-L6-v2: 40MB, ~50ms per sentence on CPU, no GPU required
import * as ort from 'onnxruntime-node';

let session: ort.InferenceSession | null = null;

export async function getEmbedding(text: string): Promise<Float32Array> {
  if (!session) {
    session = await ort.InferenceSession.create(MINILM_MODEL_PATH);
  }
  const tokens = tokenize(text);
  const output  = await session.run(buildInputTensor(tokens));
  return meanPool(output['last_hidden_state']!.data as Float32Array);
}
```

```typescript
// packages/detection/src/embeddings/similarity.ts
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  const dot  = a.reduce((sum, val, i) => sum + val * b[i]!, 0);
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return magA === 0 || magB === 0 ? 0 : dot / (magA * magB);
}
```

### 3.5 Language Detection (F-410)

```typescript
// packages/detection/src/language/detector.ts
export type SupportedAnalysis = 'full' | 'embeddings_only' | 'none';

export function detectAnalysisCapability(text: string): {
  language:   string;
  capability: SupportedAnalysis;
} {
  const language = detector.detectLanguageOf(text);
  return {
    language,
    capability: language === 'ENGLISH' ? 'full' : 'embeddings_only',
  };
}
// Non-English: English hedging/lexical signals disabled; embedding-only active.
// Honest partial results > confident wrong results.
```

### 3.6 Composite PR Scorer (Powers F-201)

```typescript
// packages/detection/src/pr/pr-scorer.ts
export async function scorePullRequest(input: PrScoringInput): Promise<CompositeScore> {
  const lexical   = computeLexicalOverlap({ diffSymbols: input.diffSymbols, descriptionText: input.description });
  const claims    = countConcreteClaims(input.description);
  const hedging   = computeHedgingDensity(input.description);

  const [descEmb, diffEmb] = await Promise.all([
    getEmbedding(input.description),
    getEmbedding(buildDiffSummary(input.diffSymbols, input.changedFunctions)),
  ]);
  const similarity  = cosineSimilarity(descEmb, diffEmb);
  const embedScore  = buildSignalScore('embedding_similarity', similarity,
    SIGNAL_WEIGHTS.EMBEDDING, `Cosine similarity: ${similarity.toFixed(3)}`);

  // High overlap AND high similarity AND low claims = slop pattern.
  // Invert lexical and embedding: high overlap is bad, not good.
  return composeScore([
    invertScore(lexical),
    claims,
    invertScore(embedScore),
    hedging,
  ]);
}
```

### 3.7 Signal Weights (Single Source of Truth)

```typescript
// packages/detection/src/constants/signal-weights.ts
// Weights must sum to 1.0 — enforced by unit test.
export const SIGNAL_WEIGHTS = {
  LEXICAL_OVERLAP:  0.25,
  CONCRETE_CLAIMS:  0.30,
  EMBEDDING:        0.30,
  HEDGING_DENSITY:  0.15,
} as const satisfies Record<string, number>;
```

### Phase 3 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `computeLexicalOverlap` at 100% overlap | Unit | value ≈ 1.0 |
| `computeLexicalOverlap` at 0% overlap | Unit | value = 0.0 |
| `computeLexicalOverlap` with no symbols | Unit | Returns 0 with explanation string |
| `countConcreteClaims` detects "fixes #42" | Unit | Signal fires, count ≥ 1 |
| `countConcreteClaims` on empty text | Unit | Returns 0, no crash |
| `computeHedgingDensity` on typical AI PR | Unit | value > 0.5 |
| `computeHedgingDensity` on terse commit | Unit | value < 0.2 |
| `computeBurstiness` on uniform timestamps | Unit | Low Fano factor |
| `computeBurstiness` on burst+silence pattern | Unit | High Fano factor |
| `countConcreteElements` on markdown with code block | Unit | codeBlock count = 1 |
| `detectCircularReferences` on self-referential section | Unit | Flag returned with overlapping terms |
| `validateSymbolClaims` flags missing function | Unit | Missing array contains symbol |
| `cosineSimilarity` of identical vectors | Unit | Returns 1.0 |
| `cosineSimilarity` of orthogonal vectors | Unit | Returns 0.0 |
| `detectAnalysisCapability` on Japanese | Unit | Returns `embeddings_only` |
| `scorePullRequest` is deterministic | Unit | Same input called twice → identical output |
| `SIGNAL_WEIGHTS` values sum to 1.0 | Unit | Constant invariant enforced |
| `HEDGING_TERMS` has no duplicates | Unit | Set size === array length |

### Phase 3 Gate Checklist
- [ ] Every signal function has ≥ 3 unit tests (normal, edge, degenerate input)
- [ ] All detection functions are pure — no I/O, no global state, verified by test
- [ ] ONNX models download and load within 10 seconds in CI
- [ ] `scorePullRequest` determinism test passes (same input → same output, called twice)
- [ ] `HEDGING_TERMS` reviewed; duplicates removed
- [ ] All weights in `signal-weights.ts` documented with rationale comments

---

## Phase 4 — Tier 1 Scan Backend & Infrastructure

### Objective
Wire the GitHub client and detection engine into a complete scan pipeline.
Implement SSE streaming, the SQLite cache, the worker queue, and all Tier 1 backend
routes. By end of phase, `POST /scan` triggers a full overview scan and streams
live progress to the client.

### 4.1 SQLite Schema

```typescript
// apps/api/src/db/schema.ts
export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS scans (
    id             TEXT PRIMARY KEY,
    repo_full_name TEXT NOT NULL,
    head_sha       TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'pending',
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at   TEXT,
    summary_json   TEXT,
    result_path    TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_scans_repo ON scans(repo_full_name);
  CREATE INDEX IF NOT EXISTS idx_scans_sha  ON scans(head_sha);

  CREATE TABLE IF NOT EXISTS contributor_baselines (
    login          TEXT NOT NULL,
    repo_full_name TEXT NOT NULL,
    stats_json     TEXT NOT NULL,
    updated_at     TEXT NOT NULL,
    PRIMARY KEY (login, repo_full_name)
  );
`;
```

### 4.2 Scan Cache

```typescript
// apps/api/src/cache/sqlite.cache.ts
export class ScanCache {
  isCachedBySha(headSha: string): boolean       { ... }
  getScanBySha(headSha: string): StoredScan | null { ... }
  storeScan(scan: CompletedScan): void           { ... }
  invalidateOlderThan(hours: number): void       { ... }
}
// Cache key: repo full name + HEAD SHA
// TTL: 24 hours (configurable via env)
```

### 4.3 SSE Manager

```typescript
// apps/api/src/sse/sse-manager.ts
export class SseManager {
  private readonly streams = new Map<string, ServerResponse>();

  register(scanId: string, res: ServerResponse): void {
    res.setHeader('Content-Type',  'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection',    'keep-alive');
    this.streams.set(scanId, res);
    res.on('close', () => this.streams.delete(scanId));
  }

  emit<T>(scanId: string, event: SseEvent<T>): void {
    this.streams.get(scanId)?.write(`data: ${JSON.stringify(event)}\n\n`);
  }

  close(scanId: string): void {
    this.streams.get(scanId)?.end();
    this.streams.delete(scanId);
  }
}
```

### 4.4 Scan Service — Tier 1 Orchestration

```typescript
// apps/api/src/services/scan.service.ts
export async function runTier1Scan(
  scanId:  string,
  repoRef: RepoRef,
  token:   string,
  sse:     SseManager,
): Promise<Tier1ScanResult> {
  const client = buildGitHubClient(token);

  // Each step wraps calls in githubPool.
  // Each step has independent try/catch — partial failure does not abort.
  // SSE emits after EVERY step so client sees incremental progress.

  const tree = await safeStep(() => client.getFileTree(repoRef));
  sse.emit(scanId, mkEvent('scan:tree_done', scanId, tree));

  const prs = await safeStep(() => client.getRecentPrs(repoRef, SCAN_LIMITS.MAX_PRS_PREVIEW));
  sse.emit(scanId, mkEvent('scan:prs_done', scanId, prs));

  const commits     = await safeStep(() => client.getRecentCommits(repoRef, SCAN_LIMITS.MAX_COMMITS));
  const commitScore = commits ? await scoreCommitDistribution(commits) : null;
  sse.emit(scanId, mkEvent('scan:commits_done', scanId, commitScore));

  const docs    = await safeStep(() => client.getTopLevelDocs(repoRef));
  const docScore = docs ? await scoreDocsSurface(docs) : null;
  sse.emit(scanId, mkEvent('scan:docs_done', scanId, docScore));

  const result = composeHealthScore({ tree, prs, commitScore, docScore });
  sse.emit(scanId, mkEvent('scan:complete', scanId, result));
  return result;
}
```

### 4.5 API Routes

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/scan` | Start Tier 1 scan; returns `{ scanId }` |
| `GET` | `/api/scan/:id/stream` | SSE connection; streams progress events |
| `GET` | `/api/scan/:id` | Return cached scan result |
| `GET` | `/api/scan/:id/status` | Poll-based fallback for SSE-less clients |

### 4.6 Scan Depth Constants (F-604)

```typescript
// apps/api/src/config/scan-limits.ts
// Single source of truth. Never hardcode these values inline.
export const SCAN_LIMITS = {
  MAX_COMMITS:          100,
  MAX_PRS:              50,
  MAX_PRS_PREVIEW:      20,
  MAX_TREE_DEPTH:       3,
  MAX_FILES:            500,
  MAX_LOOKBACK_DAYS:    90,
  MAX_DOC_FILES:        20,
  TIER2_MAX_CONCURRENT: 2,
} as const;
```

### 4.7 Truncated Diff Fallback (F-605)

```typescript
// packages/github-client/src/rest/rest-client.ts
export function isDiffTruncated(patch: string): boolean {
  return patch.includes('@@ ... @@') || patch.endsWith('\\ No newline at end of file\n...');
}

export async function fetchFullFileFallback(
  owner: string, repo: string, path: string, ref: string,
): Promise<string> {
  // Used when diff is truncated at 300 lines
  return await githubPool(() => fetchRawFileContent(owner, repo, path, ref));
}
```

### Phase 4 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `POST /scan` with valid repo returns `{ scanId }` | Integration | 202 with scanId in body |
| `GET /scan/:id/stream` opens SSE connection | Integration | 200 with `text/event-stream` header |
| SSE emits `scan:tree_done` event | Integration | Event received within 5s (mock GitHub) |
| SSE emits `scan:complete` event | Integration | Final event received |
| Second scan on same SHA served from cache | Integration | No GitHub API calls on second scan |
| Cache invalidation after 24h | Unit | `invalidateOlderThan(24)` removes stale entry |
| `SseManager.emit` is no-op on disconnected client | Unit | No crash on orphaned stream |
| Scan step failure does not abort whole scan | Integration | Docs step 404 → others still complete |
| Max 5 concurrent requests enforced | Integration | Spy confirms concurrency cap |
| Scan depth limits enforced for commits | Unit | 101 commits → capped to 100 |
| `POST /scan` without auth returns 401 | Integration | Status 401 confirmed |
| Truncated diff detected and fallback triggered | Unit | `isDiffTruncated` returns true |

### Phase 4 Gate Checklist
- [ ] Full Tier 1 scan runs against real GitHub in dev environment
- [ ] SSE stream shows 5 distinct progress events in correct order
- [ ] Second scan on same repo HEAD confirmed from cache (logged)
- [ ] Concurrent 3-scan stress test does not trigger GitHub secondary rate limit
- [ ] Zero business logic inside route handlers — all delegated to services
- [ ] SQLite migrations run cleanly on a fresh empty database

---

## Phase 5 — Tier 1 Frontend, Heatmap & Live Progress

### Objective
Build the complete user-facing Tier 1 experience: landing page, URL input, OAuth button,
SSE-driven live progress, D3 treemap, virtualized tree list, PR card list,
contributor summary, repo health score card, and three-state analysis badges.

### 5.1 State Management (Zustand)

```typescript
// apps/web/src/stores/scan.store.ts
interface ScanStore {
  scanId:   string | null;
  status:   'idle' | 'scanning' | 'complete' | 'error';
  result:   Tier1ScanResult | null;
  progress: SseEvent[];
  // Actions
  startScan:       (repoUrl: string) => Promise<void>;
  connectSse:      (scanId: string) => void;
  dispatchSseEvent:(event: SseEvent) => void;
  reset:           () => void;
}
```

Components read from this store; they do **not** call APIs directly.
All API calls go through `apps/web/src/services/`.

### 5.2 SSE Hook

```typescript
// apps/web/src/hooks/use-sse.ts
export function useSse(scanId: string | null): void {
  const dispatch = useScanStore(s => s.dispatchSseEvent);
  useEffect(() => {
    if (!scanId) return;
    const es    = new EventSource(`/api/scan/${scanId}/stream`);
    es.onmessage = e   => dispatch(JSON.parse(e.data) as SseEvent);
    es.onerror   = ()  => dispatch({ type: 'scan:error', scanId: scanId!, payload: null, timestamp: new Date().toISOString() });
    return () => es.close();   // always clean up on unmount
  }, [scanId, dispatch]);
}
```

### 5.3 D3 Treemap (F-501)

`apps/web/src/components/features/heatmap/RepoTreemap.tsx`

Rules for treemap rendering:
- Node size = file count in directory (proportional area)
- Node color = D3 `scaleLinear` from `score.high` (green) to `score.danger` (red) — **never on contributor nodes**
- Tooltip shows: folder name, file count, aggregate score, top flagged signals
- Click on node dispatches folder expansion event for Tier 2 analysis

### 5.4 Virtualized Expandable Tree List (F-502)

Use `react-arborist` with `tanstack-virtual` for rows.

```typescript
// apps/web/src/components/ui/ScoreBadge.tsx
type BadgeState = 'pending' | 'analysing' | 'scored';

const BADGE_CONFIG: Record<BadgeState, { label: string; className: string }> = {
  pending:   { label: '—',   className: 'bg-gray-200 text-gray-500' },
  analysing: { label: '···', className: 'bg-amber-100 text-amber-600 animate-pulse' },
  scored:    { label: '',    className: '' },  // numeric score with dynamic color class
};
```

### 5.5 PR Card List (F-103 UI)

Per PR card:
- Title, author avatar, relative age, additions/deletions delta
- `<ScoreBadge state="pending" />` until Tier 2 triggered by user click
- Body description truncated to 150 chars with expand-on-click
- Click dispatches `analysePr(prNumber)` to analysis queue store

### 5.6 Contributor Summary (F-106 UI)

Team aggregate card:
- Total contributors, average activity window
- Aggregate PR quality (pending until scanned)
- Contributor list is **alphabetical** — never sorted by score
- Individual drill-down is opt-in via "View profile" link

### 5.7 Repo Health Score Card (F-107 UI)

Shows: overall score (0–100), letter grade (A–F), breakdown chips for
PR Quality / Commit Patterns / Documentation Density.
Animated count-up on score reveal.
Percentile vs OSS baseline when calibration data is present.

### 5.8 Live Progress Timeline

Collapsible progress log rendering each SSE event as it arrives:

```
✓ File tree fetched (234 files, 3 levels)
✓ 20 pull requests loaded
✓ 100 commits scored (entropy: moderate)
✓ README and 3 docs analysed
✓ Report ready
```

### Phase 5 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `<ScoreBadge>` renders pending state | Unit | Gray, dash label, no pulse class |
| `<ScoreBadge>` renders analysing state | Unit | `animate-pulse` class present |
| `<ScoreBadge>` renders scored state | Unit | Numeric value in output |
| Treemap renders correct node count | Unit | 5-folder mock → 5 visible nodes |
| Treemap never uses red on contributor views | Unit | Color scale check |
| `useSse` calls `es.close()` on unmount | Unit | Cleanup called |
| SSE error event sets store status to 'error' | Unit | Store state checked |
| PR card click dispatches `analysePr` | Unit | Action called with correct PR number |
| URL input rejects non-GitHub URLs | Unit | Inline validation error shown |
| Full Tier 1 flow shows health score | E2E (Playwright) | Health card visible after mock scan |
| Treemap click triggers folder expand | E2E | Expansion event dispatched |
| 500 tree nodes render without visible lag | E2E | No JS frame drop in DevTools |

### Phase 5 Gate Checklist
- [ ] Complete Tier 1 demo runs end-to-end: paste URL → stream → heatmap + health card
- [ ] Treemap readable at both 1920×1080 and 1366×768
- [ ] No individual contributor shown with score or rank in default view
- [ ] Three badge states are visually distinct — confirmed by manual review
- [ ] All colors use Tailwind theme tokens — no hardcoded hex values in components
- [ ] `react-arborist` tree handles 500 nodes without lag (tested manually)

---

## Phase 6 — Tier 2 On-Demand Analysis

### Objective
Implement all click-triggered deep analyses: PR info-density scoring, contributor
quality profile, folder file scan, and documentation deep scan. Client-side queue
serializes concurrent user clicks to prevent secondary API rate limit spikes.

### 6.1 Client-Side Analysis Queue (F-507)

```typescript
// apps/web/src/stores/analysis-queue.store.ts
interface AnalysisQueueStore {
  queue:   AnalysisJob[];
  active:  number;          // currently running (max = SCAN_LIMITS.TIER2_MAX_CONCURRENT)
  enqueue: (job: AnalysisJob) => void;
  dequeue: () => void;
}
// Rapid-click scenario:
// User clicks PR #12 → active = 1, starts immediately
// User clicks PR #13 → active = 1, badge shows "waiting"
// PR #12 completes  → dequeue → PR #13 starts
```

### 6.2 PR Deep Analysis Backend (F-201, F-202)

```typescript
// apps/api/src/services/pr.service.ts
export async function analysePr(
  prNumber: number,
  repoRef:  RepoRef,
  token:    string,
): Promise<PrAnalysisResult> {
  const cacheKey = `${prNumber}:${await getUpdatedAt(prNumber, token)}`;
  const cached   = prCache.get(cacheKey);
  if (cached) return cached;     // instant on cache hit

  const [diff, pr] = await Promise.all([
    githubClient.getPrDiff(prNumber),
    githubClient.getPrDetail(prNumber),
  ]);

  const diffSymbols = extractSymbolsFromDiff(diff);
  const score       = await scorePullRequest({
    description:      pr.body,
    diffSymbols,
    changedFunctions: extractChangedFunctions(diff),
    diffLineCount:    diff.split('\n').length,
  });

  const result: PrAnalysisResult = { prNumber, score, analyzedAt: now() };
  prCache.set(cacheKey, result);
  return result;
}
```

Route: `POST /api/scan/:id/analyse/pr/:prNumber`

### 6.3 Contributor Profile Backend (F-203)

Route: `POST /api/scan/:id/analyse/contributor/:login`

Fetches last 30 PRs for contributor, builds personal baseline deviation
(F-409), returns timeline of `informationDensity` scores per PR.
Field names enforce framing: `informationDensity` — not `slopScore`, `aiScore`, or similar.

### 6.4 Folder File Scan Backend (F-204)

Route: `POST /api/scan/:id/analyse/folder`
Body: `{ path: string }`

Streams per-file scores via SSE as each file is processed. User sees folder
filling in progressively rather than waiting for the full batch.

### 6.5 Documentation Deep Scan Backend (F-205)

Route: `POST /api/scan/:id/analyse/doc`
Body: `{ filePath: string }`

Runs full Track B pipeline on single document:
- F-406: Circularity detection
- F-407: Concrete elements count
- F-404: Hedging density
- F-408: Symbol existence check

Returns per-section breakdown — not a single flat score.

### 6.6 Frontend: PR Analysis Panel

When a PR card is clicked:
1. Badge transitions to `analysing` state
2. Inline expansion panel slides open (no page navigation)
3. Score breakdown renders as 4 signal rows:
   - Lexical overlap bar (inverted — lower overlap = better)
   - Concrete claims counter
   - Embedding similarity gauge
   - Hedging density histogram
4. Natural-language explanation below each signal bar
5. "What this means" summary paragraph at the bottom

### 6.7 Frontend: Contributor Quality Timeline (F-504)

```typescript
// apps/web/src/components/features/contributors/ContributorTimeline.tsx
```

- Line chart using Recharts of `informationDensity` over last 30 PRs
- **Blue/neutral palette exclusively** — no red, no orange on contributor views
- Y-axis label: "Information Density (0–100)"
- Footnote: "Low scores indicate PR descriptions that closely mirror the visible
  diff without adding context about why the change was made."
- **Zero instances of "AI" or "slop" in the entire component tree**

### Phase 6 Tests

| Test | Type | Pass Condition |
|---|---|---|
| `POST /analyse/pr/:n` returns score object | Integration | 200 with `{ score, signals }` |
| Second call for same PR (no update) served from cache | Integration | No GitHub API call made |
| Updated PR (changed `updated_at`) re-fetches | Integration | Cache miss confirmed |
| Analysis queue limits to 2 concurrent | Unit | Third job waits |
| PR expansion panel renders all 4 signal rows | Unit | All signals present in DOM |
| Contributor timeline uses no red color | Unit | No `#ef4444` in rendered output |
| Folder scan SSE streams per-file events | Integration | Multiple events received |
| Doc scan response contains per-section array | Integration | `sections` array in response body |
| `extractSymbolsFromDiff` ignores deleted lines | Unit | `-` prefixed lines excluded |
| `scorePullRequest` on empty description | Unit | Returns low score, does not throw |

### Phase 6 Gate Checklist
- [ ] Click a PR, wait ≤15s, see full scored breakdown — tested on real GitHub
- [ ] Click same PR again → instant result (no network request in DevTools)
- [ ] Click two PRs rapidly → second shows "waiting" badge, not two simultaneous loaders
- [ ] Contributor timeline passes copy audit: zero "AI", "slop", "artificial" labels
- [ ] All 4 Tier 2 analysis types (PR, folder, contributor, doc) work end-to-end in dev

---

## Phase 7 — Calibration, Compliance & Quality Polish

### Objective
Add score calibration against real OSS baselines, wire language detection graceful
degradation, implement personal baseline deviation for contributors, and audit every
user-facing label and color for compliance with hackathon no-shaming rules.

### 7.1 OSS Baseline Seeding Script (F-411)

```typescript
// scripts/seed-baseline.ts
const OSS_REPOS = [
  'facebook/react',
  'pallets/flask',
  'django/django',
  'vercel/next.js',
  'tiangolo/fastapi',
  'microsoft/vscode',
  'denoland/deno',
  'rust-lang/rust',
  'nodejs/node',
  'torvalds/linux',
] as const;
// Scan each, extract score distributions, store in data/baseline/baseline-scores.json.
// CI runs this weekly via baseline-seed.yml.
```

### 7.2 Relative Scorer (F-411)

```typescript
// packages/detection/src/calibration/relative-scorer.ts
export function getPercentile(rawScore: number, distribution: number[]): number {
  const sorted = [...distribution].sort((a, b) => a - b);
  return Math.round((sorted.filter(s => s <= rawScore).length / sorted.length) * 100);
}

export function formatRelativeScore(percentile: number): string {
  if (percentile <= 15) return `Bottom 15% of surveyed OSS repositories`;
  if (percentile <= 40) return `Below OSS median`;
  if (percentile <= 60) return `Near OSS median`;
  return `Above OSS median`;
}
```

### 7.3 Personal Baseline Deviation (F-409)

```typescript
// packages/detection/src/contributors/baseline.ts
export interface ContributorBaseline {
  readonly login:          string;
  readonly msgLengthMean:  number;
  readonly msgLengthStddev:number;
  readonly vocabCentroid:  Float32Array;  // mean embedding of past messages
  readonly avgInfoDensity: number;
  readonly sampleSize:     number;
}

export function deviatesFromBaseline(
  current:  ContributorStats,
  baseline: ContributorBaseline,
): DeviationResult {
  const lengthZScore = Math.abs(current.avgMsgLength - baseline.msgLengthMean)
    / (baseline.msgLengthStddev || 1);
  const vocabDrift = 1 - cosineSimilarity(current.embeddingCentroid, baseline.vocabCentroid);
  return {
    lengthDeviation: lengthZScore,
    vocabularyDrift: vocabDrift,
    isSignificant:   lengthZScore > 2.0 || vocabDrift > 0.3,
    explanation:     buildDeviationExplanation(lengthZScore, vocabDrift),
  };
}
// Key insight: flag deviations from a contributor's OWN history,
// not against a global threshold. Avoids false positives on disciplined engineers.
```

### 7.4 Compliance Audit — Every Score Label Reviewed

Run this checklist on every component, route response, and export field:

```
COMPLIANCE CHECKLIST (run on every UI component and API response)
──────────────────────────────────────────────────────────────────
✗ Does any field name contain "slop", "AI", "artificial"?     → Rename
✗ Does any chart use red/orange on contributor-specific view? → Change to blue/neutral
✗ Is there a score leaderboard sorted worst-to-best?          → Remove or make opt-in
✗ Does any tooltip say "AI-generated"?                        → Replace with "low information density"
✗ Does any export field expose system internals or tokens?    → Strip via sanitize functions

APPROVED TERMINOLOGY
────────────────────
✓ "information density"
✓ "review quality signal"
✓ "documentation concreteness"
✓ "PR description quality"
✓ "writing style consistency"
```

Create `COMPLIANCE.md` at project root documenting every framing decision and why.

### 7.5 Domain Error UX Polish

```typescript
// apps/api/src/errors/domain-errors.ts
export class InvalidRepoUrlError extends Error {
  readonly code = 'INVALID_REPO_URL';
  constructor(url: string) {
    super(`"${url}" is not a valid GitHub repository URL`);
  }
}

export class PrivateRepoError extends Error {
  readonly code       = 'PRIVATE_REPO';
  readonly userMessage = 'This repository is private. Ensure you have authorized access via GitHub OAuth.';
}

export class RateLimitError extends Error {
  readonly code: 'RATE_LIMIT';
  readonly retryAfter: number;  // seconds
  constructor(retryAfter: number) {
    super(`GitHub rate limit exceeded. Retry after ${retryAfter}s.`);
    this.retryAfter = retryAfter;
  }
}

export class NonEnglishRepoNotice {
  readonly code       = 'NON_ENGLISH';
  readonly language:    string;
  readonly capability:  SupportedAnalysis = 'embeddings_only';
  readonly userMessage: string;
  constructor(language: string) {
    this.language    = language;
    this.userMessage = `Detected non-English content (${language}). Rule-based signals disabled; embedding-only scoring active.`;
  }
}
```

Every error maps to a user-visible notification with actionable guidance, not a raw
stack trace.

### Phase 7 Tests

| Test | Type | Pass Condition |
|---|---|---|
| Baseline seed script produces valid JSON | Script | Zod schema validates output |
| `getPercentile` on bottom-10% score | Unit | Returns ≤ 10 |
| `formatRelativeScore` boundary values | Unit | All 4 tier strings tested |
| `deviatesFromBaseline` flags z-score > 2.0 | Unit | `isSignificant = true` |
| No "AI" in any API response field names | Integration | Regex scan on all responses passes |
| No red on contributor component views | Unit | Render tree scan finds no danger color |
| Language detection disables hedging signals | Unit | Non-English → hedging signal skipped |
| `PrivateRepoError` returns 403 with `userMessage` | Integration | Response has `userMessage` field |
| Relative score shown on health card | E2E | "OSS median" text visible in output |
| `COMPLIANCE.md` covers all renamed fields | Manual | All decisions documented |

### Phase 7 Gate Checklist
- [ ] All API response field names audited — zero "slop", "AI", "artificial" in any production field
- [ ] Contributor timeline and profile colors pass neutral palette check
- [ ] Baseline JSON committed to `data/baseline/baseline-scores.json`
- [ ] Language detection tested against Japanese, Spanish, German text samples
- [ ] `COMPLIANCE.md` written, reviewed, and committed
- [ ] Every domain error class has a `userMessage` string suitable for direct display

---

## Phase 8 — Tier 3, Export & Demo Hardening

### Objective
Ship Tier 3 deep scan, exportable reports, full performance validation,
demo failure-scenario hardening, bake-off accuracy setup, and deployment readiness.
The product must survive a live demo where a judge pastes their own unknown repo URL.

### 8.1 Deep Scan Worker (F-301–F-305)

```typescript
// apps/api/src/workers/deep-scan.worker.ts
export async function runDeepScan(job: DeepScanJob): Promise<void> {
  const { scanId, repoRef, token } = job.data;
  // Long-running: runs as background job, streams SSE throughout.
  // Each step is independent — failure in one does not abort others.

  await runFullCommitHistory(scanId, repoRef, token, sse);
  await runAllPrDiffScoring(scanId, repoRef, token, sse);
  await runAllDocDeepAnalysis(scanId, repoRef, token, sse);
  await runCrossContributorConvergence(scanId, repoRef, token, sse);
  await generateFullReport(scanId);

  sse.emit(scanId, mkEvent('scan:complete', scanId, { tier: 3 }));
  sse.close(scanId);
}
```

### 8.2 Exportable Report (F-306)

```typescript
// apps/api/src/services/export.service.ts
export function generateJsonReport(scan: CompletedScan): ExportableReport {
  return {
    meta: {
      repo:        scan.repoFullName,
      scanId:      scan.id,
      generatedAt: now(),
      scopeLimits: SCAN_LIMITS,
      note:        'Scores represent information density and review quality signals, not AI authorship detection.',
    },
    health:       scan.result.health,
    prAnalyses:   scan.result.prs.map(sanitizePrForExport),
    commitScores: scan.result.commits,
    docScores:    scan.result.docs,
    contributors: scan.result.contributors.map(sanitizeContributorForExport),
  };
}
// sanitize* functions strip: raw tokens, internal system IDs, GitHub API responses,
// any field containing "slop" or "ai" as a key name.
```

Route: `GET /api/scan/:id/export` (returns JSON; optional PDF via puppeteer for demo).

### 8.3 Performance Benchmarks — Must Pass Before Demo

```
Target Performance — Measured on Medium Repo (200 files, 50 PRs, 300 commits)
──────────────────────────────────────────────────────────────────────────────

Tier 1 full scan:
  Target:  ≤ 30 seconds (POST /scan → scan:complete event)
  Measure: Server-side timer, logged per run

PR deep analysis (Tier 2):
  Target:  ≤ 15 seconds per PR
  Measure: Route handler timing middleware

Treemap render (500 nodes):
  Target:  ≤ 500ms to first paint
  Measure: Chrome DevTools Performance timeline

Tree list scroll (500 nodes):
  Target:  60fps — no dropped frames
  Measure: Chrome DevTools frame timeline

SQLite write (full scan result):
  Target:  ≤ 100ms
  Measure: Instrumented write calls

ONNX model cold load:
  Target:  ≤ 10 seconds on server startup
  Measure: Server startup log timestamp
```

### 8.4 Demo Resilience — All Must Handle Gracefully

```
8 Failure Scenarios — Every One Must Not Crash
────────────────────────────────────────────────

1. Judge enters a monorepo (> 50,000 files)
   Expected: "Scanning top 500 files" warning banner; analysis proceeds normally

2. Judge enters a private repo they own
   Expected: Clear OAuth prompt; no misleading 404 error message

3. Judge enters a non-English repository
   Expected: "Non-English detected. Embedding-only scoring active." Notice shown

4. GitHub API rate limit hit mid-scan
   Expected: Partial results shown with notice; Retry-After respected; no crash

5. Judge clicks 5 PRs in rapid succession
   Expected: All 5 eventually complete; client queue serializes them correctly

6. Network drops during SSE stream
   Expected: Frontend reconnects; progress restored from /status endpoint

7. ONNX model file missing at startup
   Expected: Embedding signals skipped; other signals still run; clear notice

8. Repository has no PRs, no commits (empty/new repo)
   Expected: "No recent activity to analyse" graceful UI; no broken/empty state
```

### 8.5 Bake-Off Accuracy Setup (Hackathon Bonus +5 Points)

```typescript
// data/baseline/labelled-evaluation-set.json
// Minimum 20 manually-reviewed entries across known repos
[
  {
    "repo":       "vercel/next.js",
    "prNumber":   54012,
    "label":      "high_quality",
    "humanNotes": "Detailed ISR cache behavior explanation with trade-offs"
  },
  {
    "repo":       "example-org/slop-demo",
    "prNumber":   87,
    "label":      "low_quality",
    "humanNotes": "Description restates diff entirely; no 'why' context provided"
  }
]
```

```bash
# scripts/run-bakeoff.ts
# 1. Load labelled evaluation set
# 2. Run scorePullRequest on each PR
# 3. Classify as high/low quality using threshold
# 4. Compute confusion matrix and print to stdout
# 5. Write results to data/bakeoff-results.json
```

### 8.6 Final CI Pipeline

```yaml
# .github/workflows/ci.yml
jobs:
  ci:
    steps:
      - name: Lint
        run: pnpm turbo lint
      - name: Type check
        run: pnpm turbo typecheck
      - name: Unit tests
        run: pnpm turbo test:unit
      - name: Integration tests
        run: pnpm turbo test:integration
      - name: E2E tests (Playwright)
        run: pnpm turbo test:e2e
      - name: Bundle size check
        run: pnpm turbo build && pnpm size-limit
      - name: Bake-off accuracy (must be ≥ 70% precision)
        run: pnpm tsx scripts/run-bakeoff.ts
```

### Phase 8 Tests

| Test | Type | Pass Condition |
|---|---|---|
| Deep scan job completes without timeout | Integration | Finishes within 10 minutes |
| SSE emits ≥ 4 distinct Tier 3 event types | Integration | Event types confirmed |
| JSON export passes Zod schema validation | Unit | No validation errors |
| Export contains no tokens or internal IDs | Unit | Regex scan finds no secrets |
| Monorepo shows warning, does not crash | E2E | Warning banner visible |
| Non-English repo shows capability notice | E2E | Notice banner visible |
| 5 rapid PR clicks all eventually complete | E2E | All 5 panels show `scored` state |
| Bake-off precision ≥ 70% | Script | Confusion matrix output checked |
| Lighthouse TTI < 3s on fresh load | Lighthouse | Score ≥ 90 |
| Bundle size < 500KB gzipped | size-limit | Check passes |
| Zero console errors on full demo flow | E2E | Playwright captures no browser errors |

### Phase 8 Gate Checklist
- [ ] Demo rehearsed on 3 real repos: facebook/react, pallets/flask, one unknown
- [ ] All 8 failure scenarios handled gracefully — tested manually one by one
- [ ] Bake-off confusion matrix generated and committed to `data/bakeoff-results.json`
- [ ] Export JSON valid in external JSON viewer with no internal fields exposed
- [ ] Project README has: one-line description, screenshot, install steps, "how it works"
- [ ] CI pipeline fully green including E2E and bake-off
- [ ] Zero `TODO`, `FIXME`, or `console.log` remaining in production code paths
- [ ] `COMPLIANCE.md` reviewed and accurate

---

## Dependency Graph (Phases Are Sequential — No Borrowing Ahead)

```
Phase 1 (Foundation)
    └── Phase 2 (GitHub Client + OAuth)
            └── Phase 3 (Detection Engine)
                    ├── Phase 4 (Tier 1 Backend)
                    │       └── Phase 5 (Tier 1 Frontend)
                    │               └── Phase 6 (Tier 2 On-Demand)
                    │                       └── Phase 7 (Calibration + Compliance)
                    │                               └── Phase 8 (Tier 3 + Demo)
                    └── (Detection engine is independently testable at any point)
```

Each phase gate must be cleared before the next phase begins.
No feature borrowing from a future phase.

---

## Global Rules — Quick Reference

```
NEVER ALLOWED ANYWHERE IN THE CODEBASE
────────────────────────────────────────
✗ `any` TypeScript type
✗ Inline GitHub API fetch outside packages/github-client
✗ Detection logic inside a route handler
✗ Magic number literals (use SCAN_LIMITS / SIGNAL_WEIGHTS constants)
✗ console.log in production code paths (use structured logger)
✗ Red color or "AI score" label on per-contributor views
✗ External LLM API call for detection (ONNX local only)
✗ Unhandled promise rejection
✗ Component with both API calls and rendering logic (separate hooks from components)
✗ Inline query strings in service code (all GraphQL queries in dedicated files)

ALWAYS REQUIRED
────────────────
✓ Typed domain error class for every failure mode
✓ Signal breakdown with every composite score
✓ SSE progress stream for every operation taking > 2s
✓ Cache check before every GitHub API call
✓ p-limit pool on every batch GitHub fetch
✓ Language detection before running rule-based signals
✓ `updated_at` in every cache key involving mutable GitHub data
✓ Unit tests before a signal function is used in a pipeline
✓ Natural-language explanation alongside every numeric score
```

---

*Implementation plan derived from `prd.md` and `discussion.md` — Slop Scan Hackathon, May 2026.*

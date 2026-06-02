# Slop Scanner

Measure open-source repository **information density** with transparent, explainable signals — not authorship guessing.

![Slop Scanner dashboard](docs/screenshot-dashboard.svg)

## How it works

1. Sign in with GitHub OAuth and paste a public repository URL.
2. **Tier 1** scans fetch the file tree, recent PRs, commits, and top-level docs, then compute a health score calibrated against OSS baselines.
3. **Tier 2** deep-dives on demand: PR descriptions, contributor profiles, folder scans, and documentation sections.
4. **Tier 3** background jobs extend analysis across full commit history and contributor convergence.
5. Export a sanitized JSON report for offline review.

Scores reflect review-quality and documentation concreteness signals. See [COMPLIANCE.md](COMPLIANCE.md) for framing rules.

## Install

```bash
pnpm install
cp .env.example .env
# Fill GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SESSION_SECRET
# GITHUB_CALLBACK_URL must use the Vite port (5173), not the API port (3001)
```

If scan fails with `NODE_MODULE_VERSION` / `better-sqlite3` errors after upgrading Node, recompile native deps:

```bash
pnpm rebuild:native
```

### Development

```bash
pnpm dev
```

- API: http://localhost:3001
- Web: http://localhost:5173

### Verification

```bash
pnpm turbo lint typecheck test
pnpm test:e2e
pnpm bakeoff
pnpm seed:baseline
```

## Project layout

| Path | Purpose |
|------|---------|
| `apps/api` | Fastify API, SQLite cache, SSE |
| `apps/web` | React + Vite dashboard |
| `packages/detection` | Scoring engine & calibration |
| `packages/github-client` | GitHub REST/GraphQL |
| `data/baseline` | OSS baseline & bake-off labels |

## License

MIT

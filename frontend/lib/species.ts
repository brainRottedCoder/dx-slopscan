export interface SpeciesItem {
  type: string
  name: string
  color: string
  lucideIcon: string
  signal: string
  desc: string
  example: string
  fix: string
  counterfactual: string
}

export const SPECIES_DATA: SpeciesItem[] = [
  {
    type: 'ECHO',
    name: 'The Echo',
    color: '#ff1744',
    lucideIcon: 'Copy',
    signal: 'High Mirror + Low Novelty',
    desc: "Restates the diff in prose. Every sentence is predictable from the code changes. Adds zero information a reviewer couldn't get by reading the diff.",
    example: '"Updated the authentication middleware. Changed the session handler. Modified the login flow."',
    fix: 'Explain WHY not WHAT. Replace every sentence that describes what changed with one that explains why it needed to change.',
    counterfactual: '"Root cause: token refresh was firing 200ms after expiry, causing 3% of mobile sessions to see 401 errors. Fixed by triggering refresh at 80% of TTL."',
  },
  {
    type: 'HOLLOW',
    name: 'The Hollow',
    color: '#ff6d00',
    lucideIcon: 'Ghost',
    signal: 'Zero Reasoning + No WHY + No Risk',
    desc: 'Answers nothing a reviewer needs to know. No rationale, no tradeoffs, no risks flagged. Could have been written without reading the code at all.',
    example: '"This PR makes improvements to the system. Please review and approve."',
    fix: 'Write for the reviewer, not yourself. Answer: what would I need to know to review this confidently?',
    counterfactual: '"The rate limiter was using wall clock time, allowing 2x burst at minute boundaries. Replaced with sliding window. Reviewers: check the Redis memory usage at L89."',
  },
  {
    type: 'HAZE',
    name: 'The Haze',
    color: '#ffab00',
    lucideIcon: 'Layers',
    signal: 'High Jargon + Zero Causality',
    desc: 'Dense with technical vocabulary but no causal reasoning. Sounds sophisticated but contains no transferable knowledge. Strip the jargon — if nothing remains, nothing was explained.',
    example: '"Refactored the modular architecture to improve scalability and maintainability through optimized codebase restructuring."',
    fix: 'Replace every abstract noun with a concrete claim. "Scalability" → what specifically scales, by how much, under what conditions.',
    counterfactual: '"Replaced the N+1 query in UserService.getWithRoles() with a single JOIN. Before: 47 DB calls per request. After: 1. Measured with pg_stat_statements."',
  },
  {
    type: 'SPIRAL',
    name: 'The Spiral',
    color: '#b388ff',
    lucideIcon: 'RefreshCw',
    signal: 'Circular Sentence Structure',
    desc: 'Each sentence restates the previous one with synonyms. High inter-sentence cosine similarity. The description circles without advancing.',
    example: '"Auth handles authentication. Authentication is managed by the auth layer. The auth layer handles the authentication process."',
    fix: 'Each sentence must introduce exactly one concept the previous paragraph did not contain. Delete any sentence that paraphrases an earlier one.',
    counterfactual: '"Problem: concurrent logouts caused thundering herd. Solution: token rotation with 80% TTL refresh. Tradeoff: 20% more refresh calls. Mitigation: batch refresh queue."',
  },
  {
    type: 'SURFACE',
    name: 'The Surface',
    color: '#00e676',
    lucideIcon: 'Circle',
    signal: 'Missing WHY + Low Novelty',
    desc: 'Accurately describes what changed but never explains why. Useful today, useless in 6 months when someone asks "why does this code exist?"',
    example: '"Changed the database query. Updated the pagination logic. Modified the user service."',
    fix: 'Add root cause: what was wrong before, and why does this fix it? The "why" is the institutional memory that survives the code change.',
    counterfactual: '"Root cause: OFFSET pagination degrades to O(n) at page 500, adding 3.2s to p99. Switched to cursor pagination using the created_at index."',
  },
  {
    type: 'STENCIL',
    name: 'The Stencil',
    color: '#448aff',
    lucideIcon: 'Files',
    signal: 'Generic Openers + Low Reasoning',
    desc: 'Interchangeable with any other PR of the same type. "Fixed the bug. Updated tests. Various improvements." could describe 10,000 other PRs.',
    example: '"Fixed the bug. Updated tests. Minor refactoring. Please merge."',
    fix: 'Find one thing about THIS specific change that no other PR of this type would say. That is the sentence that earns a purple label.',
    counterfactual: '"The specific bug: JWT validation cached the public key with a 6-hour TTL, but rotation happens every 4 hours. The 2-hour overlap caused 401s for ~2% of API calls."',
  },
  {
    type: 'FUSE',
    name: 'The Fuse',
    color: '#00c853',
    lucideIcon: 'Timer',
    signal: 'No Evidence + No Risk + Low Reasoning',
    desc: 'Accurate today, useless in 30 days. No decision context. When the code changes again in 6 months, nobody will know why this approach was chosen.',
    example: '"Added error handling for edge cases. Improved stability and reliability."',
    fix: 'Add the decision context. Why this approach and not the alternatives? Decisions need context to outlive code changes.',
    counterfactual: '"Added retry with exponential backoff (max 3 attempts, 100ms base). Alternative: circuit breaker — rejected because the upstream recovers in <500ms, making circuit breaker overhead unjustified."',
  },
  {
    type: 'GHOST',
    name: 'The Ghost',
    color: '#9e9e9e',
    lucideIcon: 'Ghost',
    signal: 'Very Short Description',
    desc: 'Too brief for a reviewer to assess risk or intent. Often a title repeat or one-liner that forces every question into review comments.',
    example: '"Fix auth bug."',
    fix: 'Minimum viable PR body: problem, approach, and how you verified it — even in three sentences.',
    counterfactual: '"Root cause: refresh fired after expiry on drifted clocks. Fix: refresh at 80% TTL. Tested with 45s offset on iOS Safari."',
  },
  {
    type: 'BULLET',
    name: 'The Bullet',
    color: '#7c4dff',
    lucideIcon: 'List',
    signal: 'Bullet Dump + No WHY',
    desc: 'A list of changes without narrative glue. Each bullet may be accurate but nothing explains how they connect or what to scrutinize.',
    example: '"- Updated auth\n- Fixed tests\n- Refactored middleware\n- Bumped version"',
    fix: 'Add one paragraph before the list: why this bundle of changes exists and what reviewers should watch.',
    counterfactual: '"Auth tokens were expiring under clock skew; the bullets below implement refresh-at-80%-TTL. Scrutinize queue ordering at L89."',
  },
  {
    type: 'VAULT',
    name: 'The Vault',
    color: '#d500f9',
    lucideIcon: 'Shield',
    signal: 'Security Diff + No Security Context',
    desc: 'Touches auth, secrets, or permissions but never discusses threat model, blast radius, or what could go wrong.',
    example: '"Updated JWT validation and session store." (diff changes crypto paths)',
    fix: 'Name permissions changed, secret handling, and what a security-minded reviewer should verify.',
    counterfactual: '"JWT public key cache TTL was 6h but rotation is every 4h — caused 2% 401s. Review: key fetch path and failure mode if JWKS is down."',
  },
  {
    type: 'PADDING',
    name: 'The Padding',
    color: '#ff5252',
    lucideIcon: 'AlignJustify',
    signal: 'Low Lean + High Word Count',
    desc: 'Long but repetitive. Same idea restated with synonyms; low unique information per word.',
    example: '"This comprehensive update improves overall system stability and enhances reliability through various optimizations and improvements."',
    fix: 'Delete sentences that do not add a new fact, number, or named entity.',
    counterfactual: '"Retry backoff: 100ms base, max 3 attempts. Measured p99 drop from 4.2s to 1.1s on staging."',
  },
]

export function getSpeciesMeta(type: string): SpeciesItem | undefined {
  return SPECIES_DATA.find(s => s.type === type)
}

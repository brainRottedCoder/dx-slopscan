/**
 * PR signal weights — must sum to 1.0 (enforced by unit test).
 * Higher weight = stronger influence on composite PR score.
 */
export const SIGNAL_WEIGHTS = {
  /** Lexical overlap between diff symbols and description (inverted in scorer). */
  LEXICAL_OVERLAP: 0.2,
  /** Concrete claims such as issue refs and rationale phrases. */
  CONCRETE_CLAIMS: 0.25,
  /** Embedding similarity between description and diff summary (inverted). */
  EMBEDDING: 0.25,
  /** Hedging phrase density in PR body. */
  HEDGING_DENSITY: 0.15,
  /** Description mirrors diff without added context (F-202). */
  DIFF_RESTATE: 0.15,
} as const satisfies Record<string, number>;

/** Commit distribution signal weights (sum to 1.0). */
export const COMMIT_SIGNAL_WEIGHTS = {
  LENGTH_STATS: 0.2,
  TYPE_TOKEN_RATIO: 0.2,
  VERB_RATIO: 0.2,
  BODY_PRESENCE: 0.2,
  BURSTINESS: 0.2,
} as const satisfies Record<string, number>;

/** Documentation signal weights (sum to 1.0). */
export const DOC_SIGNAL_WEIGHTS = {
  CONCRETE_ELEMENTS: 0.3,
  CIRCULARITY: 0.2,
  HEDGING_DENSITY: 0.15,
  PARAGRAPH_VARIANCE: 0.2,
  SYMBOL_ACCURACY: 0.15,
} as const satisfies Record<string, number>;

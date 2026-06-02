/** Minimum word count before hedging density is scored. */
export const MIN_HEDGING_WORD_COUNT = 10;

/** Hedging terms per 1,000 words treated as maximum slop signal. */
export const HEDGING_MAX_PER_1000_WORDS = 20;

/** Concrete claim patterns required for a full concrete-claims score. */
export const CONCRETE_CLAIMS_FULL_COUNT = 3;

/** Minimum commit timestamps required for burstiness. */
export const MIN_BURSTINESS_SAMPLES = 3;

/** MiniLM embedding vector dimension. */
export const MINILM_EMBEDDING_DIM = 384;

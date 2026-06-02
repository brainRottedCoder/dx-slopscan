export { scoreCommitDistribution } from './commits/commit-scorer.js';
export { computeBurstiness } from './commits/burstiness.js';
export { SIGNAL_WEIGHTS, COMMIT_SIGNAL_WEIGHTS, DOC_SIGNAL_WEIGHTS } from './constants/signal-weights.js';
export { HEDGING_TERMS } from './constants/hedging-terms.js';
export { scoreDocumentation } from './docs/doc-scorer.js';
export { countConcreteElements } from './docs/concrete-elements.js';
export { detectCircularReferences } from './docs/circularity.js';
export { validateSymbolClaims } from './docs/symbol-validator.js';
export { cosineSimilarity } from './embeddings/similarity.js';
export { getEmbedding } from './embeddings/minilm.js';
export { getCodeEmbedding } from './embeddings/codebert.js';
export { isOnnxEmbeddingActive } from './embeddings/onnx-availability.js';
export { detectAnalysisCapability, type SupportedAnalysis } from './language/detector.js';
export { getPercentile, formatRelativeScore, calibrateHealthScore } from './calibration/relative-scorer.js';
export {
  getBaselineDistribution,
  loadBaselineFile,
  resetBaselineCacheForTests,
} from './calibration/baseline-store.js';
export { baselineScoresSchema, type BaselineScoresFile } from './calibration/baseline-schema.js';
export {
  buildContributorBaseline,
  deviatesFromBaseline,
  type ContributorBaseline,
  type ContributorStats,
  type DeviationResult,
} from './contributors/baseline.js';
export { computeLexicalOverlap } from './pr/lexical-overlap.js';
export { countConcreteClaims } from './pr/concrete-claims.js';
export { computeHedgingDensity } from './pr/hedging-density.js';
export { computeDiffRestate } from './pr/diff-restate.js';
export { scorePullRequest } from './pr/pr-scorer.js';
export { computeDocHedgingDensity } from './docs/hedging-density.js';
export { computeParagraphVariance } from './docs/paragraph-variance.js';
export { computeVocabularyShift } from './contributors/vocabulary-shift.js';
export { scoreContributorPattern } from './contributors/contributor-scorer.js';
export {
  loadBakeoffDatasetFromFile,
  runBakeoffEvaluation,
  type BakeoffResults,
} from './bakeoff/bakeoff-runner.js';

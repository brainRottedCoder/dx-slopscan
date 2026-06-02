import type { CommitBatch , CompositeScore } from '@slop-scanner/shared-types';

import { COMMIT_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { composeScore } from '../utils/composite-score.js';
import { clamp01 } from '../utils/math.js';
import { buildSignalScore } from '../utils/signal-score.js';

import { computeBodyPresenceRatio } from './body-presence-ratio.js';
import { computeBurstiness } from './burstiness.js';
import { computeLengthStats } from './length-stats.js';
import { computeTypeTokenRatio } from './type-token-ratio.js';
import { computeImperativeVerbRatio } from './verb-ratio.js';

const BURSTINESS_NORMALIZER = 5;

/** Score commit message distribution (never single-commit). */
export function scoreCommitDistribution(batch: CommitBatch): CompositeScore {
  const lengthStats = computeLengthStats(batch.messages);
  const ttr = computeTypeTokenRatio(batch.messages);
  const verbRatio = computeImperativeVerbRatio(batch.messages);
  const bodyRatio = computeBodyPresenceRatio(batch.messages);
  const burstiness = computeBurstiness(batch.timestamps);

  const burstinessSignal = buildSignalScore(
    'burstiness',
    clamp01(burstiness / BURSTINESS_NORMALIZER),
    COMMIT_SIGNAL_WEIGHTS.BURSTINESS,
    `Fano factor: ${burstiness.toFixed(2)}`,
  );

  return composeScore([lengthStats, ttr, verbRatio, bodyRatio, burstinessSignal]);
}

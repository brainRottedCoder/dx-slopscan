import type { SignalScore } from '@slop-scanner/shared-types';

import { DOC_SIGNAL_WEIGHTS } from '../constants/signal-weights.js';
import { buildSignalScore, zeroScore } from '../utils/signal-score.js';

const MIN_PARAGRAPHS = 2;
const MIN_WORDS_PER_PARAGRAPH = 8;
const LOW_VARIANCE_COEFFICIENT = 0.15;

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function wordCount(paragraph: string): number {
  return paragraph.split(/\s+/).filter((word) => word.length > 0).length;
}

/** Flag suspiciously uniform paragraph lengths in documentation (F-205). */
export function computeParagraphVariance(text: string): SignalScore {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length < MIN_PARAGRAPHS) {
    return zeroScore(
      'paragraph_variance',
      'Not enough paragraphs to measure length variance',
      DOC_SIGNAL_WEIGHTS.PARAGRAPH_VARIANCE,
    );
  }

  const lengths = paragraphs.map(wordCount);
  if (lengths.some((length) => length < MIN_WORDS_PER_PARAGRAPH)) {
    return zeroScore(
      'paragraph_variance',
      'Paragraphs too short for variance analysis',
      DOC_SIGNAL_WEIGHTS.PARAGRAPH_VARIANCE,
    );
  }

  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const variance =
    lengths.reduce((sum, length) => sum + (length - mean) ** 2, 0) / lengths.length;
  const coefficient = Math.sqrt(variance) / mean;
  const uniformity = Math.max(0, 1 - coefficient / LOW_VARIANCE_COEFFICIENT);
  const normalized = Math.min(uniformity, 1);

  return buildSignalScore(
    'paragraph_variance',
    normalized,
    DOC_SIGNAL_WEIGHTS.PARAGRAPH_VARIANCE,
    `Paragraph length coefficient of variation: ${coefficient.toFixed(2)}`,
  );
}

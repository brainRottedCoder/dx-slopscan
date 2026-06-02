export type SupportedAnalysis = 'full' | 'embeddings_only' | 'none';

const CJK_PATTERN = /[\u3040-\u30ff\u4e00-\u9fff\u3400-\u4dbf]/u;
const LATIN_PATTERN = /[A-Za-z]/;
const SPANISH_HINTS =
  /\b(el|la|los|las|para|con|este|esta|porque|también|descripción|cambio)\b/iu;
const GERMAN_HINTS =
  /\b(der|die|das|und|ist|nicht|für|änderung|beschreibung|wird|sind)\b/iu;

/** Detect language capability for analysis degradation (F-410). */
export function detectAnalysisCapability(text: string): {
  language: string;
  capability: SupportedAnalysis;
} {
  const sample = text.trim();
  if (sample.length === 0) {
    return { language: 'unknown', capability: 'none' };
  }

  if (CJK_PATTERN.test(sample)) {
    return { language: 'ja', capability: 'embeddings_only' };
  }

  if (SPANISH_HINTS.test(sample)) {
    return { language: 'es', capability: 'embeddings_only' };
  }

  if (GERMAN_HINTS.test(sample)) {
    return { language: 'de', capability: 'embeddings_only' };
  }

  if (LATIN_PATTERN.test(sample)) {
    return { language: 'en', capability: 'full' };
  }

  return { language: 'unknown', capability: 'embeddings_only' };
}

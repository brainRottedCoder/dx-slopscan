import { describe, expect, it } from 'vitest';

import { detectAnalysisCapability } from './detector.js';

describe('detectAnalysisCapability', () => {
  it('returns full for English', () => {
    const result = detectAnalysisCapability('This PR fixes authentication middleware.');
    expect(result.capability).toBe('full');
    expect(result.language).toBe('en');
  });

  it('returns embeddings_only for Japanese', () => {
    const result = detectAnalysisCapability('この変更は認証ミドルウェアを修正します。');
    expect(result.capability).toBe('embeddings_only');
  });

  it('returns embeddings_only for Spanish', () => {
    const result = detectAnalysisCapability(
      'Este cambio actualiza el middleware de autenticación para la API.',
    );
    expect(result.capability).toBe('embeddings_only');
    expect(result.language).toBe('es');
  });

  it('returns embeddings_only for German', () => {
    const result = detectAnalysisCapability(
      'Diese Änderung aktualisiert das Authentifizierungs-Middleware und wird nicht rückgängig gemacht.',
    );
    expect(result.capability).toBe('embeddings_only');
    expect(result.language).toBe('de');
  });

  it('returns none for empty text', () => {
    const result = detectAnalysisCapability('   ');
    expect(result.capability).toBe('none');
  });
});

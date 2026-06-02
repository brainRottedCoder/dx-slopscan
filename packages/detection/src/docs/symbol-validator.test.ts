import { describe, expect, it } from 'vitest';

import { validateSymbolClaims } from './symbol-validator.js';

describe('validateSymbolClaims', () => {
  it('flags missing symbols', () => {
    const result = validateSymbolClaims('Call MissingService from AuthController', {
      symbols: new Set(['AuthController']),
    });
    expect(result.missing).toContain('MissingService');
  });

  it('lists verified symbols', () => {
    const result = validateSymbolClaims('AuthController handles login', {
      symbols: new Set(['AuthController']),
    });
    expect(result.verified).toContain('AuthController');
  });

  it('returns accuracy 1 when no symbols claimed', () => {
    const result = validateSymbolClaims('plain text only', { symbols: new Set() });
    expect(result.accuracy).toBe(1);
  });
});

import { describe, expect, it } from 'vitest';

import { decryptToken, encryptToken } from './token-crypto.js';

const SECRET = 'test-session-secret-32-chars-min!!';

describe('token-crypto', () => {
  it('round-trips token encryption', () => {
    const token = 'gho_test_token_value';
    const encrypted = encryptToken(token, SECRET);
    expect(encrypted).not.toContain(token);
    expect(decryptToken(encrypted, SECRET)).toBe(token);
  });
});

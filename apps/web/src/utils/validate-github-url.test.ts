import { describe, expect, it } from 'vitest';

import { validateGithubRepoUrl } from './validate-github-url.js';

describe('validateGithubRepoUrl', () => {
  it('accepts standard github repo URLs', () => {
    expect(validateGithubRepoUrl('https://github.com/octo/hello')).toBeNull();
  });

  it('rejects empty input', () => {
    expect(validateGithubRepoUrl('')).toMatch(/required/i);
  });

  it('rejects non-GitHub URLs', () => {
    expect(validateGithubRepoUrl('https://gitlab.com/octo/hello')).toMatch(/valid GitHub/i);
  });
});

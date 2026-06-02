import { describe, expect, it } from 'vitest';

import { InvalidRepoUrlError } from './errors/invalid-repo-url.error.js';
import { parseRepoUrl } from './parse-repo-url.js';

describe('parseRepoUrl', () => {
  const cases = [
    {
      url: 'https://github.com/facebook/react',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'https://github.com/facebook/react/',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'https://github.com/facebook/react.git',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'https://github.com/facebook/react/tree/main',
      expected: { owner: 'facebook', repo: 'react', branch: 'main' },
    },
    {
      url: 'http://github.com/facebook/react',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'git@github.com:facebook/react.git',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'git@github.com:facebook/react',
      expected: { owner: 'facebook', repo: 'react' },
    },
    {
      url: 'github.com/facebook/react',
      expected: { owner: 'facebook', repo: 'react' },
    },
  ] as const;

  it.each(cases)('parses $url', ({ url, expected }) => {
    expect(parseRepoUrl(url)).toEqual(expected);
  });

  it('throws InvalidRepoUrlError on bad input', () => {
    expect(() => parseRepoUrl('https://gitlab.com/a/b')).toThrow(InvalidRepoUrlError);
  });
});

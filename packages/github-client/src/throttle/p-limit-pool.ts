import pLimit from 'p-limit';

import { MAX_CONCURRENT } from '../constants/github.js';

/** Shared concurrency pool — every GitHub API call must use this. */
export const githubPool = pLimit(MAX_CONCURRENT);

export { MAX_CONCURRENT };

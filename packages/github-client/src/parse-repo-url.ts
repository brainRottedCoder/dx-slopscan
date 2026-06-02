import type { RepoRef } from '@slop-scanner/shared-types';

import { InvalidRepoUrlError } from './errors/invalid-repo-url.error.js';

const HTTPS_PATTERN =
  /^(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?(?:tree\/([^/]+))?\/?$/i;

const SSH_PATTERN = /^git@github\.com:([^/]+)\/([^/]+?)(?:\.git)?$/i;

const SSH_PROTOCOL_PATTERN =
  /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i;

function buildRef(owner: string, repo: string, branch?: string): RepoRef {
  const ref: RepoRef = { owner, repo: repo.replace(/\.git$/i, '') };
  if (branch) {
    return { ...ref, branch };
  }
  return ref;
}

/** Parse owner, repo, and optional branch from common GitHub URL formats (F-001). */
export function parseRepoUrl(url: string): RepoRef {
  const trimmed = url.trim();

  const httpsMatch = trimmed.match(HTTPS_PATTERN);
  if (httpsMatch) {
    return buildRef(httpsMatch[1]!, httpsMatch[2]!, httpsMatch[3]);
  }

  const sshMatch = trimmed.match(SSH_PATTERN);
  if (sshMatch) {
    return buildRef(sshMatch[1]!, sshMatch[2]!);
  }

  const sshProtocolMatch = trimmed.match(SSH_PROTOCOL_PATTERN);
  if (sshProtocolMatch) {
    return buildRef(sshProtocolMatch[1]!, sshProtocolMatch[2]!);
  }

  throw new InvalidRepoUrlError(url);
}

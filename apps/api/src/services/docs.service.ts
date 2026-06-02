import { scoreDocumentation } from '@slop-scanner/detection';
import { buildGitHubClient } from '@slop-scanner/github-client';
import type {
  DocAnalysisResult,
  DocSection,
  FileTreeNode,
  RepoRef,
} from '@slop-scanner/shared-types';

import type { SseManager } from '../sse/sse-manager.js';
import { mkSseEvent } from '../sse/sse-manager.js';
import { listFilesInFolder } from '../utils/folder-files.js';

import type { GitHubClientFactory } from './pr.service.js';

function parseSections(text: string): DocSection[] {
  const parts = text.split(/^##\s+/m).filter((part) => part.trim().length > 0);
  if (parts.length === 0) {
    return [
      {
        heading: 'Document',
        content: text,
        score: 0,
        signals: [],
      },
    ];
  }

  return parts.map((part) => {
    const lines = part.split('\n');
    const heading = lines[0]?.trim() ?? 'Section';
    const content = lines.slice(1).join('\n');
    const composite = scoreDocumentation({
      text: content,
      sections: [{ heading, body: content }],
      codebaseIndex: { symbols: new Set() },
    });
    return {
      heading,
      content,
      score: composite.total,
      signals: composite.signals.map((signal) => signal.signal),
    };
  });
}

/** Deep-scan a single documentation file. */
export async function analyseDocFile(
  filePath: string,
  repoRef: RepoRef,
  headSha: string,
  token: string,
  clientFactory: GitHubClientFactory = buildGitHubClient,
): Promise<DocAnalysisResult> {
  const client = clientFactory(token);
  const content = await client.rest.fetchRawFileContent(
    repoRef.owner,
    repoRef.repo,
    filePath,
    headSha,
  );

  const sections = parseSections(content);
  const overall = scoreDocumentation({
    text: content,
    sections: sections.map((section) => ({ heading: section.heading, body: section.content })),
    codebaseIndex: { symbols: new Set() },
  });

  return {
    filePath,
    sections,
    overallScore: overall,
    analyzedAt: new Date().toISOString(),
  };
}

export interface FolderFileScore {
  readonly path: string;
  readonly score: number;
}

/** Stream per-file folder scores over SSE. */
export async function analyseFolder(
  scanId: string,
  folderPath: string,
  tree: readonly FileTreeNode[],
  repoRef: RepoRef,
  headSha: string,
  token: string,
  sse: SseManager,
  clientFactory: GitHubClientFactory = buildGitHubClient,
): Promise<readonly FolderFileScore[]> {
  const client = clientFactory(token);
  const paths = listFilesInFolder(tree, folderPath).slice(0, 50);
  const scores: FolderFileScore[] = [];

  sse.emit(scanId, mkSseEvent('analysis:started', scanId, { folderPath }));

  for (const path of paths) {
    try {
      const content = await client.rest.fetchRawFileContent(
        repoRef.owner,
        repoRef.repo,
        path,
        headSha,
      );
      const result = scoreDocumentation({
        text: content,
        sections: [{ heading: path, body: content }],
        codebaseIndex: { symbols: new Set() },
      });
      const entry = { path, score: result.total };
      scores.push(entry);
      sse.emit(scanId, mkSseEvent('analysis:folder_file_done', scanId, entry));
    } catch {
      const entry = { path, score: 0 };
      scores.push(entry);
      sse.emit(scanId, mkSseEvent('analysis:folder_file_done', scanId, entry));
    }
  }

  sse.emit(scanId, mkSseEvent('analysis:folder_complete', scanId, { folderPath, scores }));
  return scores;
}

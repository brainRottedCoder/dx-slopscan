/** Server-sent event types emitted during scan and analysis workflows. */
export type SseEventType =
  | 'scan:started'
  | 'scan:tree_done'
  | 'scan:prs_done'
  | 'scan:commits_done'
  | 'scan:docs_done'
  | 'scan:complete'
  | 'scan:error'
  | 'analysis:started'
  | 'analysis:folder_file_done'
  | 'analysis:folder_complete'
  | 'analysis:complete'
  | 'deep_scan:started'
  | 'deep_scan:commits_done'
  | 'deep_scan:prs_done'
  | 'deep_scan:docs_done'
  | 'deep_scan:contributors_done'
  | 'deep_scan:complete';

/** Typed SSE envelope streamed to the frontend. */
export interface SseEvent<T = unknown> {
  readonly type: SseEventType;
  readonly scanId: string;
  readonly payload: T;
  readonly timestamp: string;
}

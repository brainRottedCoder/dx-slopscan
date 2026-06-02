import { Card } from '../../ui/Card.js';

export interface ScanNoticeBannerProps {
  readonly notices: readonly string[];
}

/** Non-blocking scan notices (monorepo cap, language mode, empty repo). */
export function ScanNoticeBanner({ notices }: ScanNoticeBannerProps) {
  if (notices.length === 0) return null;

  return (
    <Card className="border-warning-amber/30" role="status" aria-live="polite">
      <p className="section-label mb-2 text-amber">Scan notices</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-secondary">
        {notices.map((notice) => (
          <li key={notice}>{notice}</li>
        ))}
      </ul>
    </Card>
  );
}

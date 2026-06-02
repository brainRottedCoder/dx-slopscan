import { useState } from 'react';

import { Button } from '../components/ui/Button.js';
import { Card } from '../components/ui/Card.js';
import { Input } from '../components/ui/Input.js';
import { AUTH_GITHUB_PATH } from '../constants/api.js';
import { useAuthStore } from '../stores/auth.store.js';
import { useScanStore } from '../stores/scan.store.js';
import { validateGithubRepoUrl } from '../utils/validate-github-url.js';

import { LandingBoot } from './LandingBoot.js';

/** Clean modern landing page with GitHub URL input and OAuth. */
export function LandingPage() {
  const [bootDone, setBootDone] = useState(false);
  const startScan = useScanStore((state) => state.startScan);
  const status = useScanStore((state) => state.status);
  const errorMessage = useScanStore((state) => state.errorMessage);
  const authStatus = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [repoUrl, setRepoUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const error = validateGithubRepoUrl(repoUrl);
    setValidationError(error);
    if (error) return;
    await startScan(repoUrl.trim());
  };

  const isSignedIn = authStatus === 'authenticated' && user != null;

  if (!bootDone) {
    return <LandingBoot onComplete={() => setBootDone(true)} />;
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center gap-8 py-8">
      <header className="animate-fade-in-up text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          <span className="text-text-primary">Slop </span>
          <span className="hero-gradient">Scanner</span>
        </h1>
        <p className="mt-3 text-secondary">
          Analyze repository information density with transparent, explainable signals
        </p>
      </header>

      <Card className="animate-fade-in-up w-full" variant="module">
        {isSignedIn ? (
          <div className="mb-4 flex items-center gap-2">
            <span className="badge badge-info">
              Signed in as <span className="font-semibold">{user.login}</span>
            </span>
          </div>
        ) : (
          <a href={AUTH_GITHUB_PATH} className="btn btn-secondary mb-4 inline-flex text-sm">
            Sign in with GitHub
          </a>
        )}

        <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
          <label className="section-label block" htmlFor="repo-url">
            Repository URL
          </label>
          <Input
            id="repo-url"
            type="url"
            large
            value={repoUrl}
            onChange={(event) => {
              setRepoUrl(event.target.value);
              if (validationError) setValidationError(validateGithubRepoUrl(event.target.value));
            }}
            placeholder="https://github.com/owner/repo"
          />
          {validationError && (
            <p className="text-sm text-red" role="alert">
              {validationError}
            </p>
          )}
          {errorMessage && status === 'error' && (
            <p className="text-sm text-red" role="alert">
              {errorMessage}
            </p>
          )}
          <Button type="submit" fullWidth disabled={status === 'scanning'}>
            {status === 'scanning' ? 'Starting scan…' : 'Scan repository'}
          </Button>
        </form>
      </Card>
    </main>
  );
}

import { AppShell } from './components/layout/AppShell.js';
import { GridBackground } from './components/layout/GridBackground.js';
import { ThemeProvider } from './components/layout/ThemeProvider.js';
import { useAuthSession } from './hooks/use-auth-session.js';
import { useSse } from './hooks/use-sse.js';
import { LandingPage } from './pages/LandingPage.js';
import { ScanResultsPage } from './pages/ScanResultsPage.js';
import { useScanStore } from './stores/scan.store.js';

export function App() {
  const status = useScanStore((state) => state.status);
  const scanId = useScanStore((state) => state.scanId);

  useAuthSession();
  useSse(scanId);

  return (
    <ThemeProvider>
      <GridBackground />
      <AppShell>{status === 'idle' ? <LandingPage /> : <ScanResultsPage />}</AppShell>
    </ThemeProvider>
  );
}

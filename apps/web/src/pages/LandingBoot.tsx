import { useEffect, useState } from 'react';

import { shouldSkipBoot } from '../components/features/landing/LandingBootCanvas.js';

const PHASE_LOGO_MS = 300;
const PHASE_SUBTITLE_MS = 800;
const PHASE_BAR_MS = 1400;
const PHASE_DONE_MS = 2200;

export interface LandingBootProps {
  readonly onComplete: () => void;
}

/** Minimal elegant boot sequence before landing form. */
export function LandingBoot({ onComplete }: LandingBootProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (shouldSkipBoot()) {
      onComplete();
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), PHASE_LOGO_MS),
      setTimeout(() => setPhase(2), PHASE_SUBTITLE_MS),
      setTimeout(() => setPhase(3), PHASE_BAR_MS),
      setTimeout(() => onComplete(), PHASE_DONE_MS),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (shouldSkipBoot()) return null;

  return (
    <div className="boot-overlay" data-testid="landing-boot">
      <div className={`boot-logo ${phase >= 1 ? 'visible' : ''}`}>
        <span className="text-text-primary">Slop</span>{' '}
        <span className="hero-gradient">Scanner</span>
      </div>
      <p className={`boot-subtitle ${phase >= 2 ? 'visible' : ''}`}>
        Repository information density analysis
      </p>
      <div className="boot-bar-track">
        <div className={`boot-bar-fill ${phase >= 3 ? 'animate' : ''}`} />
      </div>
    </div>
  );
}

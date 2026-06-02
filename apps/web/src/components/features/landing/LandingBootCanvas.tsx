import { useEffect, useRef } from 'react';

const PARTICLE_COUNT = 150;
const SKIP_BOOT =
  process.env.NODE_ENV === 'test' ||
  import.meta.env.VITE_SKIP_BOOT === 'true' ||
  import.meta.env.VITE_E2E_SKIP_BOOT === 'true';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hue: 'cyan' | 'green';
}

function createParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    hue: Math.random() > 0.5 ? 'cyan' : 'green',
  }));
}

export interface LandingBootCanvasProps {
  readonly active: boolean;
}

/** Canvas particle + grid background for boot sequence. */
export function LandingBootCanvas({ active }: LandingBootCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || SKIP_BOOT) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let gridOffset = 0;
    let pulse = 0;
    const particles = createParticles(window.innerWidth, window.innerHeight);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width, height } = canvas;
      ctx.fillStyle = 'rgba(4, 6, 8, 0.25)';
      ctx.fillRect(0, 0, width, height);

      gridOffset = (gridOffset + 0.3) % 40;
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = -gridOffset; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -gridOffset; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      pulse += 0.02;
      const ringR = 80 + Math.sin(pulse) * 20;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.15 + Math.sin(pulse) * 0.1})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.fillStyle = p.hue === 'cyan' ? 'rgba(0, 229, 255, 0.6)' : 'rgba(0, 230, 118, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  if (SKIP_BOOT) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
    />
  );
}

export function shouldSkipBoot(): boolean {
  return SKIP_BOOT;
}

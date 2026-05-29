# Frontend Theme & Design System — DevMRI
**Source:** `repomix-output-Priyanshiupadhyayji-DevMri_Codebase.xml`  
**Stack:** Next.js 14 (App Router) · TypeScript · CSS Variables · Recharts · Canvas API  
**Theme Name:** Clinical MRI / Medical Terminal ("DevMRI")  
**Tagline:** "MRI for Your Codebase" — diagnostic precision with medical imaging metaphor

---

## 1. Visual Identity & Metaphor

The entire product is framed as a **medical imaging device for a codebase**. Every visual decision reinforces this:

| Design Element | Medical Metaphor |
|---|---|
| Dark background with cyan grid | MRI scan display |
| Electric cyan (`#00e5ff`) accent | Medical monitor readout |
| Green = healthy, Red = critical | Vital sign indicators |
| Animated scan line sweeping the UI | MRI beam moving through tissue |
| Score gauge with circular SVG | Patient vital sign ring |
| "Surgery Theatre" code editor | Operating theatre |
| "Inflammation" animation on bad files | Tissue pathology |
| "Bleeding dot" on flagged items | Active haemorrhage signal |
| CRT scanline overlay | Medical terminal screen |
| Terminal with green-on-black | Diagnostic console |
| Boot animation with typewriter text | Medical system initializing |
| "INITIALIZING NEURAL CODE_BASE SCANNER…" | Diagnostic machine startup |

**Overall feel:** Premium, precise, clinical dark-tech with surgical-grade micro-interactions.

---

## 2. Dual Theme System

Themes toggle via class on `<html>`: `.light-theme` / `.dark-theme`.  
Stored in `localStorage` under key `devmri-theme`.  
Default on initial load: `light-theme` (set in `layout.tsx`).  
Most users switch to dark — dark theme is the showcase theme.

### Dark Theme — "MRI Night Mode" (showcase)

```css
:root.dark-theme {
  --bg-void:              #040608;   /* deepest black — body background */
  --bg-primary:           #0a0e14;   /* card/panel backgrounds */
  --bg-secondary:         #111822;   /* secondary surfaces */
  --bg-surface:           #1a2332;   /* elevated surfaces */
  --bg-surface-hover:     #222e40;   /* hover state of elevated surfaces */

  --scan-cyan:            #00e5ff;   /* PRIMARY BRAND ACCENT */
  --scan-cyan-dim:        #0097a7;   /* dimmed for gradients */
  --scan-cyan-glow:       rgba(0, 229, 255, 0.15);
  --scan-cyan-glow-strong:rgba(0, 229, 255, 0.30);

  --health-green:         #00e676;   /* positive / healthy state */
  --health-green-dim:     #00c853;
  --warning-amber:        #ffab00;   /* warning */
  --warning-orange:       #ff6d00;   /* stronger warning */
  --critical-red:         #ff1744;   /* critical / error */
  --info-blue:            #448aff;   /* informational */
  --purple:               #b388ff;   /* AI / secondary accent */

  --text-primary:         #e8edf4;
  --text-secondary:       #8899aa;
  --text-muted:           #556677;
  --text-dim:             #334455;
  --border-subtle:        transparent;

  --card-bg:              rgba(10, 14, 20, 0.70);
  --card-shadow:          0 4px 20px rgba(0, 0, 0, 0.30);
  --nav-bg:               rgba(4, 6, 8, 0.85);
  --nav-border:           rgba(255, 255, 255, 0.03);
  --shadow-glow:          0 0 20px rgba(0, 229, 255, 0.15);
  --shadow-glow-strong:   0 0 40px rgba(0, 229, 255, 0.25);
}
```

### Light Theme — "Clinical Precision"

```css
:root.light-theme {
  --bg-void:              #f7f9fb;
  --bg-primary:           #ffffff;
  --bg-secondary:         #f2f4f6;
  --bg-surface:           #eceef0;
  --bg-surface-hover:     #e6e8ea;

  --scan-cyan:            #0088cc;   /* softer cyan in light */
  --scan-cyan-dim:        #006699;
  --scan-cyan-glow:       rgba(0, 136, 204, 0.08);
  --scan-cyan-glow-strong:rgba(0, 136, 204, 0.15);

  --health-green:         #00a854;
  --health-green-dim:     #007a3d;
  --warning-amber:        #fa8c16;
  --warning-orange:       #fa541c;
  --critical-red:         #f5222d;
  --info-blue:            #1890ff;
  --purple:               #722ed1;

  --text-primary:         #191c1e;
  --text-secondary:       #3f4850;
  --text-muted:           #6f7881;
  --text-dim:             #bfc7d2;

  --card-bg:              rgba(255, 255, 255, 0.90);
  --card-shadow:          0 12px 40px rgba(0, 97, 147, 0.05);
  --nav-bg:               rgba(255, 255, 255, 0.85);
  --nav-border:           rgba(0, 0, 0, 0.05);
  --shadow-glow:          0 0 20px rgba(0, 136, 204, 0.10);
  --shadow-glow-strong:   0 0 40px rgba(0, 136, 204, 0.15);
}
```

### RGB Variants (for rgba() compositing)

Every semantic color has a matching `-rgb` variant for translucent compositing:

```css
--scan-cyan-rgb:       0, 229, 255   /* dark */  |  0, 136, 204   /* light */
--health-green-rgb:    0, 230, 118   /* dark */  |  0, 168, 84    /* light */
--warning-amber-rgb:   255, 171, 0  /* dark */  |  250, 140, 22  /* light */
--critical-red-rgb:    255, 23, 68  /* dark */  |  245, 34, 45   /* light */
--bg-void-rgb:         4, 6, 8      /* dark */  |  247, 249, 251 /* light */
--bg-primary-rgb:      10, 14, 20   /* dark */  |  255, 255, 255 /* light */
--text-primary-rgb:    232, 237, 244 /* dark */ |  25, 28, 30    /* light */
--text-muted-rgb:      85, 102, 119 /* dark */  |  111, 120, 129 /* light */
```

---

## 3. Typography

### Font Imports
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900
  &family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

### Tokens
| Token | Value |
|---|---|
| `--font-display` | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` |
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` |

### Type Scale
| Element | Size | Weight | Letter-spacing |
|---|---|---|---|
| `h1` | `3rem` | `900` | `-0.02em` |
| `h2` | `2rem` | `900` | `-0.02em` |
| `h3` | `1.5rem` | `900` | `-0.02em` |
| `h4` | `1.125rem` | `900` | `-0.02em` |
| Body | inherited | `400` | normal |
| `.score-number` | `4.5rem` | `800` | `-0.03em` |
| `.cost-ticker` | `2.5rem` | `700` | — |
| Terminal / code | `0.8rem` | `400` | normal |
| Badges | `0.75rem` | `600` | `0.05em` uppercase |
| Mono labels | `var(--font-mono)` | varies | `0.08–0.15em` |

### Utility Classes
```css
.mono        — JetBrains Mono
.text-cyan   — var(--scan-cyan)
.text-green  — var(--health-green)
.text-amber  — var(--warning-amber)
.text-red    — var(--critical-red)
.text-secondary — var(--text-secondary)
.text-muted  — var(--text-muted)
```

### Hero Logo Treatment
```css
/* "Dev" in text-primary, "MRI" in gradient */
background: linear-gradient(135deg, var(--scan-cyan), var(--health-green));
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
font-size: clamp(4.5rem, 14vw, 9rem);
font-weight: 950;
letter-spacing: -0.07em;
```

---

## 4. Spacing & Radius System

### Border Radius
| Token | Value | Used on |
|---|---|---|
| `--radius-sm` | `8px` | Badges, small chips, tooltips |
| `--radius-md` | `12px` | Buttons, inputs, small cards |
| `--radius-lg` | `16px` | Primary cards, panels |
| `--radius-xl` | `24px` | Large containers, modals |

### Standard Spacing
| Class | Value |
|---|---|
| `.gap-4` | `4px` |
| `.gap-8` | `8px` |
| `.gap-12` | `12px` |
| `.gap-16` | `16px` |
| `.gap-24` | `24px` |
| `.gap-32` | `32px` |
| Card padding | `24px` |
| Button padding | `12px 24px` |
| Input padding | `14px 20px` |
| Large input | `18px 24px` |
| Container max-width | `1200px` |
| Narrow container | `720px` |

### Grid Utilities
```css
.grid-2 { grid-template-columns: repeat(2, 1fr); gap: 20px; }
.grid-3 { grid-template-columns: repeat(3, 1fr); gap: 20px; }
.grid-4 { grid-template-columns: repeat(4, 1fr); gap: 16px; }
/* All collapse to 1 column at ≤768px */
```

---

## 5. Elevation & Shadow System

### Card Shadows

**Dark theme:**
```css
/* Default card */
box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,229,255,0.03);

/* Hover card */
box-shadow: 0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,255,0.10);

/* Glow card */
box-shadow: 0 0 15px rgba(0,229,255,0.08);
```

**Light theme:**
```css
box-shadow: 0 12px 40px rgba(0,97,147,0.05);  /* default */
box-shadow: 0 12px 48px rgba(0,97,147,0.08);  /* hover */
```

### Glow Shadows
```css
--shadow-glow:        0 0 20px rgba(0,229,255,0.15);
--shadow-glow-strong: 0 0 40px rgba(0,229,255,0.25);  /* dark */
--shadow-glow-strong: 0 0 40px rgba(0,136,204,0.15);  /* light */
```

---

## 6. Glassmorphism System

The primary card style across the entire app:

```css
.card, .module-card {
  background: rgba(10, 14, 20, 0.72);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(0, 229, 255, 0.15);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(0,229,255,0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Hover state */
.card:hover, .module-card:hover {
  border-color: rgba(0, 229, 255, 0.40);
  transform: translateY(-4px) scale(1.005);
  box-shadow: 0 12px 48px rgba(0,0,0,0.6), 0 0 30px rgba(0,229,255,0.10);
}
```

### Module Cards (premium variant)
Adds:
- `::before` top edge light strip: `linear-gradient(90deg, transparent, var(--scan-cyan), transparent)` (appears on hover)
- `::after` inner glow ring: `linear-gradient(135deg, rgba(cyan,0.2), transparent 50%, rgba(cyan,0.1))` (appears on hover)
- 3D lift: `transform: translateY(-4px) scale(1.01)` on hover

### Surgery Glass Card
```css
.surgery-glass-card {
  background: rgba(10, 14, 20, 0.60);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.05);
  /* Hover: rgba(0,229,255,0.08) bg + rgba(0,229,255,0.30) border */
}
```

---

## 7. Component Library

### Buttons (Premium 3D System)

All buttons share shimmer sweep `::after` on hover:
```css
/* Shimmer sweep — slides from left(-60%) to right(130%) on hover */
background: linear-gradient(105deg,
  transparent 30%, rgba(255,255,255,0.12) 45%,
  rgba(255,255,255,0.20) 50%, rgba(255,255,255,0.12) 55%, transparent 70%);
transition: left 0.6s ease;
```

| Variant | Background | Text | Shadow |
|---|---|---|---|
| `.btn-primary` | `linear-gradient(135deg, cyan, cyan-dim)` | `var(--bg-void)` | `0 4px 15px rgba(cyan, 0.3)` |
| `.btn-success` | `var(--health-green)` | `#000` | `0 4px 15px rgba(green, 0.2)` |
| `.btn-secondary` | `var(--bg-surface)` | `var(--text-primary)` | subtle |
| `.btn-ghost` | transparent | `var(--scan-cyan)` | none |
| `.generate-fix-btn` | `linear-gradient(135deg, #7c3aed, #4f46e5)` | white | purple glow |
| `.btn-scan-primary` | `var(--scan-cyan)` solid | `#000` | `0 0 20px rgba(cyan, 0.2)` |

**Hover behavior (all):** `translateY(-2 to -4px) scale(1.01–1.02)` + stronger shadow  
**Active behavior:** `translateY(1px) scale(0.98)` + `transition-duration: 0.08s`  
**Disabled:** `opacity: 0.5`, `cursor: not-allowed`, no transform

### Inputs

```css
.input {
  background: var(--bg-secondary);
  border: 1px solid rgba(0,229,255,0.10);
  border-radius: var(--radius-md);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  padding: 14px 20px;
}
.input:focus {
  border-color: var(--scan-cyan);
  box-shadow: 0 0 0 3px var(--scan-cyan-glow);
}
/* .input-lg — 18px 24px padding, 1.25rem, radius-lg */
```

### Badges

```css
/* Base — pill shape */
.badge { border-radius: 100px; padding: 4px 10px; font-size: 0.75rem;
         font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.badge-critical { bg: rgba(255,23,68,0.15);  color: critical-red;    border: 1px solid rgba(255,23,68,0.30);  }
.badge-high     { bg: rgba(255,109,0,0.15); color: warning-orange;   border: 1px solid rgba(255,109,0,0.30); }
.badge-medium   { bg: rgba(255,171,0,0.15); color: warning-amber;    border: 1px solid rgba(255,171,0,0.30); }
.badge-low      { bg: rgba(0,230,118,0.15); color: health-green;     border: 1px solid rgba(0,230,118,0.30); }
.badge-info     { bg: rgba(68,138,255,0.15);color: info-blue;        border: 1px solid rgba(68,138,255,0.30);}
```

### Grade Badges
```css
/* 48×48px, border-radius: radius-md, font-size: 1.5rem, weight: 900 */
.grade-a { bg: rgba(0,230,118,0.2);  color/border: health-green; }
.grade-b { bg: rgba(0,229,255,0.2);  color/border: scan-cyan;    }
.grade-c { bg: rgba(255,171,0,0.2);  color/border: warning-amber;}
.grade-d { bg: rgba(255,109,0,0.2);  color/border: warning-orange;}
.grade-f { bg: rgba(255,23,68,0.2);  color/border: critical-red; }
```

### Score Gauge
```css
.score-number { font-family: var(--font-mono); font-size: 4.5rem;
                font-weight: 800; letter-spacing: -0.03em; }
.score-label  { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
```
SVG circular progress: stroke dasharray `(score/100)*691` on radius-110 circle. Stroke color is score-reactive: green ≥80, cyan ≥60, amber ≥40, orange ≥20, red <20.

### Cost Ticker (Friction cost display)
```css
.cost-ticker {
  font-family: var(--font-mono); font-size: 2.5rem; font-weight: 700;
  background: linear-gradient(135deg, var(--warning-amber), var(--critical-red));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Terminal / Log
```css
.terminal {
  background: var(--bg-void);  /* #040608 always, even in light */
  border: 1px solid rgba(0,229,255,0.08);
  font-family: var(--font-mono); font-size: 0.8rem; line-height: 1.8;
  color: var(--text-secondary);
}
.terminal-prefix  { color: var(--scan-cyan); }  /* ">" prompt */
.terminal-success { color: var(--health-green); }
.terminal-error   { color: var(--critical-red); }
/* Surgery terminal: font-size: 0.8rem, color: #00e676 on #040608 */
```

### Chat System (Floating + Premium variants)

**Floating chat window:**
- Fixed bottom-right, `400×600px`, `border-radius: 20px`
- Background: `#0a0e14`, border `rgba(cyan,0.15)`
- Animation: `chatSlideIn` — slides up + scale from 0.9

**User messages:** Right-aligned, `rgba(cyan,0.22)` bg, cyan border, `border-bottom-right-radius: 2px`  
**AI messages:** Left-aligned, `#111822` bg, `#1a2332` border, `border-bottom-left-radius: 2px`

**Suggestion chips:** `rgba(cyan,0.05)` bg, cyan text, pill shape (20px radius), `font-size: 0.75rem`

### Recommendation Card (`.rec-card`)
```css
background: var(--bg-secondary);
border: 1px solid rgba(0,229,255,0.06);
border-radius: var(--radius-md); padding: 20px;
/* Hover: border cyan 0.15, bg: bg-surface */
```
Cost label: `var(--warning-amber)`, mono font.  
Impact label: `var(--health-green)`, mono font, `font-size: 0.85rem`.

### Progress Bars
```css
/* Scan progress fill — cyan to green gradient */
background: linear-gradient(90deg, var(--scan-cyan), var(--health-green));

/* Savings meter */
background: linear-gradient(90deg, var(--scan-cyan), var(--health-green));

/* Module score bar — 6px tall, bg: bg-secondary */
```

---

## 8. Animation Library

### Keyframes Reference

| Name | Effect | Usage |
|---|---|---|
| `scanLine` | Top-to-bottom sweep, fade in/out | MRI scan line |
| `scanPulse` | Opacity pulse 0.3→1 | Loop arrows, scan dots |
| `scanBeamX` | Left-to-right beam | MRI matrix scanner |
| `heartbeat` | Scale 1→1.3, opacity 0.5→1 | Live indicator dots |
| `fadeInUp` | `translateY(20px)→0` + opacity | Component reveal |
| `shimmer` | Background position sweep | Skeleton loader, button sheen |
| `glow` | Box-shadow pulse (0.2→0.4 opacity) | Glowing elements |
| `mriDots` | Scale + cyan glow + opacity | MRI matrix active dots |
| `flicker` | Opacity drops at irregular intervals | CRT flicker effect |
| `pulseScan` | Opacity + brightness cycling | X-ray skeleton mode |
| `tissueInflammation` | Scale 1→1.2→1.1 | Bad folder discovered |
| `tissueScanning` | Brightness + cyan drop-shadow | Folder under scan |
| `scanningLineVertical` | `translateY(-100px)→1000px` | Surgery panel line |
| `scoreCount` | Scale 0.5→1 + opacity | Score number reveal |
| `chatEnter` | `translateY(30px)→0 + scale 0.95→1` | Chat window open |
| `chatSlideIn` | `translateY(40px)→0 + scale 0.9→1` | Floating chat open |
| `msgIn` | `translateY(10px)→0` + opacity | Chat message arrive |
| `bootBar` | `scaleX(0)→1` left-origin | Boot loading bar |
| `mascotFloat` | `translateY(0)→-3px→0 + scale 1→1.03` | 3D mascot idle |
| `pulseRing` | Scale 1→1.15 + opacity | Pulse ring |
| `orbitSpin` | `rotate(360deg)` | Orbit ring |
| `scanPulseRing` | Scale 1→2.5 + opacity 0.5→0 | Chapter scan ring |
| `radiation-pulse` | Scale 1→1.3 + opacity 0.3→0 | Danger indicator |
| `savingsGlow` | Opacity 0.3→0.8 | Savings meter tip |
| `scorePulse` | Scale 1→1.1 + text-shadow | Score update |
| `x-ray-pulse` | Border cyan 0.3→0.7 | X-ray mode border |
| `countUp` | `translateY(10px)→0` + opacity | Friction number reveal |
| `fixBtnShimmer` | `translateX(-100%)→100%` | Fix button loading |
| `slideInUp` | `translateY(20px)→0` | Toast notification |

### Transition Tokens
```css
--transition-fast:   0.15s ease;
--transition-normal: 0.30s ease;
--transition-slow:   0.50s ease;
/* Premium: 0.35s cubic-bezier(0.19, 1, 0.22, 1) — buttons */
/* Elastic: 0.6s cubic-bezier(0.16, 1, 0.3, 1) — cards, modals */
```

---

## 9. Specialized UI Patterns

### Grid Background (MRI Aesthetic)
```css
.grid-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
/* Radial vignette over grid */
.grid-bg::after {
  background: radial-gradient(ellipse at 50% 50%, transparent 0%, var(--bg-void) 70%);
}
/* Light theme: rgba(0,136,204,0.04) — darker grid, lighter fade */
/* Dark theme: rgba(0,229,255,0.03) — subtle cyan grid */
```

### MRI Matrix (10×10 dot grid)
```css
.mri-matrix { grid-template-columns: repeat(10, 1fr); gap: 8px; background: rgba(0,0,0,0.4); }
.mri-dot { background: rgba(0,229,255,0.10); border-radius: 2px; }
.mri-dot-active { animation: mriDots 1.5s ease-in-out infinite; }
.mri-dot-complete { background: var(--health-green); box-shadow: 0 0 8px rgba(0,230,118,0.3); }
/* Scanner beam: 4px wide vertical bar, box-shadow: 0 0 20px cyan */
```

### MRI Slice Visualization (folder heatmap)
- `400px` tall container with dark gradient background
- Cyan grid overlay at `20px` spacing (denser than bg grid)
- Moving scan line: `3px` tall, gradient `transparent→cyan→transparent`, triple glow shadow
- Folder nodes: positioned absolutely, scale + glow on hover
- "Inflamed" folders: critical-red color + `tissueInflammation` keyframe
- Crosshair: 1px lines at `rgba(cyan,0.2)`
- Depth bar on right edge: `4px` wide, `linear-gradient(cyan→green)`
- Legend at bottom-left: dot (8px circle) + label

### Scan Slice Container
```css
.scan-slice { background: var(--bg-secondary); border: 1px solid rgba(cyan,0.1); }
.scan-slice-line {
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--scan-cyan), transparent);
  box-shadow: 0 0 15px var(--scan-cyan), 0 0 30px rgba(cyan,0.3);
  animation: scanLine 3s linear infinite;
}
.scan-slice-progress-fill { background: linear-gradient(90deg, cyan, green); }
```

### Pipeline Stage (Drag-and-Drop)
```css
.pipeline-stage { min-width: 100px; cursor: grab; border: 2px solid rgba(cyan,0.10); }
.pipeline-stage:hover { border-color: rgba(cyan,0.30); transform: translateY(-2px); }
.pipeline-stage.dragging { opacity: 0.5; transform: scale(0.95); }
.pipeline-stage.disabled { border-color: rgba(red,0.20); cursor: not-allowed; }
.pipeline-drop-zone.active { border-color: var(--scan-cyan); bg: rgba(cyan,0.05); }
.pipeline-drop-zone.over  { border-color: var(--health-green); bg: rgba(green,0.10); }
```

### Surgery Theatre
```css
.surgery-code-editor {
  font-family: var(--font-mono); font-size: 0.8rem;
  color: #00e676;  /* green-on-black code */
  background: #040608;
  min-height: 400px; max-height: 600px; line-height: 1.8;
}
.surgery-cursor { width: 8px; height: 16px; background: #00e676; animation: scanPulse 0.8s infinite; }
.surgery-panel {
  background: linear-gradient(135deg, rgba(2,4,6,0.98), rgba(10,14,20,0.95));
  box-shadow: 0 20px 80px rgba(0,0,0,0.6);
}
.surgery-panel::before {
  /* animated cyan scan line sweeping downward */
  animation: scanningLineVertical 4s linear infinite;
}
```

### CRT Scanlines Overlay
```css
.crt-scanline {
  background: linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.1) 50%),
              linear-gradient(90deg, rgba(255,0,0,0.02), rgba(0,255,0,0.01), rgba(0,0,255,0.02));
  background-size: 100% 4px, 3px 100%;
  opacity: 0.4;
}
```

### X-Ray Skeleton Mode (`.is-skeleton`)
When applied to parent container, all cards transform into x-ray mode:
```css
background: rgba(0,30,60,0.4);
border-color: rgba(cyan,0.40);
box-shadow: 0 0 15px rgba(cyan,0.10) inset;
animation: pulseScan 2.5s ease-in-out infinite;
/* Shimmer sweep on ::after */
/* All headings: color: #00e5ff + text-shadow: 0 0 8px rgba(cyan,0.5) */
```

### Heartbeat Indicator
```css
.heartbeat {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--scan-cyan);
  animation: heartbeat 1.5s ease-in-out infinite;
}
/* Bleeding dot (critical alert): #ff1744 + dual glow shadow */
.bleeding-dot { animation: heartbeat 1s infinite; }
```

### Floating Chat Button
```css
.floating-chat-btn {
  width: 72px; height: 72px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(cyan,0.15), rgba(10,14,20,0.92) 70%);
  box-shadow: 0 8px 40px rgba(cyan,0.35), 0 0 0 2px rgba(cyan,0.15);
  transition: all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28);  /* elastic */
}
.floating-chat-btn:hover { transform: scale(1.12); }
```

---

## 10. Scrollbar Styling

```css
::-webkit-scrollbar       { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--bg-void); }
::-webkit-scrollbar-thumb { background: var(--bg-surface); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Custom scrollbar (narrower, transparent track) */
.custom-scrollbar::-webkit-scrollbar       { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(cyan,0.20); }
```

---

## 11. Print / PDF Mode (Clinical Report)

```css
@media print {
  /* A4 portrait, 20mm margins */
  html, body { background: white; color: #040608; font-size: 11pt; }
  /* Hide: grid-bg, buttons, chat, simulator, .no-print */
  /* All cards: white bg, #dee2e6 border, no blur, break-inside: avoid */
  /* .clinical-report-header: visible with border-bottom: 4px solid #040608 */
  /* All colored text reset to #040608 */
  /* .cost-ticker: -webkit-text-fill-color: #ff1744 */
}
```

---

## 12. Responsive Breakpoints

```css
/* Mobile — ≤768px */
@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  h1 { font-size: 2rem; }
  .score-number { font-size: 3rem; }
  .cost-ticker { font-size: 1.75rem; }
  .container { padding: 0 16px; }
}
```

---

## 13. ThemeProvider Implementation

```tsx
// src/components/ThemeProvider.tsx
type Theme = 'light' | 'dark';

// Reads localStorage 'devmri-theme' on mount
// Toggles .light-theme / .dark-theme class on document.documentElement
// Flash prevention: renders children immediately, applies class before paint

// ThemeToggle button:
// 🌙 = currently light, click → dark
// ☀️ = currently dark, click → light
// border: 1px solid var(--border-subtle), 36×36px, hover → cyan border
```

---

## 14. Landing Page Animation Sequence

The landing page runs a 5-phase cinematic boot before showing the main page (Canvas API):

| Phase | Duration | What happens |
|---|---|---|
| 0 | 0s | Nothing visible |
| 1 | 300ms | Logo fades in and scales up |
| 2 | 1200ms | Typewriter text: "INITIALIZING NEURAL CODE_BASE SCANNER…" |
| 3 | 2800ms | 4 tag chips appear: `SYNAPTIC-SCAN · QUANTUM-DIAG · TISSUE-SYNC · NEURAL-FIX` |
| 4 | 4200ms | Boot progress bar animates `scaleX(0)→1` |
| done | 5400ms | `onComplete()` → main page |

**Canvas background animation:**
- 150 floating particles (cyan + green, both themes)
- Moving 60px grid with `requestAnimationFrame`
- Expanding pulse ring from center

---

## 15. Scroll-Driven Story Sections

Landing page uses `IntersectionObserver` at `threshold: 0.15–0.2`:

| Chapter | Theme Color | Key Animation |
|---|---|---|
| 01 — The Problem | `critical-red` radial bg | Floating panic icons, dashed orbit ring |
| 02 — The Scan | `scan-cyan` radial bg | Module orbit, scanPulseRing |
| 03 — The Score | Dynamic (score-reactive) | Score counter easing from 0→78 |
| 04 — The Surgery | `health-green` text | Typewriter code animation |
| 05 — Personas | Per-persona color | Card grid reveal |

---

## 16. Friction Loop Diagram

```css
.loop-node { min-width: 200px; border: 1px solid rgba(cyan,0.15); }
.loop-node-break { border-color: var(--health-green); bg: rgba(green,0.08); }
.loop-arrow { color: var(--scan-cyan); animation: scanPulse 2s infinite; }
```

---

## 17. Applying This Theme to Slop Scanner

### Direct Reuse (copy globals.css token blocks)
- Copy `:root.light-theme` and `:root.dark-theme` blocks verbatim into your `globals.css`
- Keep all token names — they form a complete semantic system
- Add to your `tailwind.config.ts` under `theme.extend.colors` as CSS var references

### Color Semantic Mapping for Slop Scanner

| DevMRI meaning | Slop Scanner meaning | Token |
|---|---|---|
| Healthy codebase | High information density PR | `--health-green` |
| Warning friction | Medium-slop content | `--warning-amber` |
| Critical issue | High-slop / zero-info | `--critical-red` |
| MRI scan active | Analysis in progress | `--scan-cyan` |
| AI diagnostics | Embedding signal | `--purple` |
| Contributor | Neutral — never red | `--text-secondary` |

### Components to Port Directly
1. **Grid background** — identical diagnostic aesthetic for Slop Scanner
2. **Glassmorphism cards** — PR cards, folder nodes, doc sections
3. **Scan line animation** — over repo tree / heatmap during Tier 1 scan
4. **Score gauge (SVG ring)** — repo health score, per-PR info-density
5. **Badge system** — slop severity badges (replace critical/high/med/low → slop level)
6. **Terminal component** — live SSE progress log
7. **Heartbeat dot** — analysis in-progress indicator
8. **Three-state badge** — pending (gray) / analysing (cyan pulse) / scored (colored)
9. **Chat window** — AI diagnosis panel (if needed)
10. **Shimmer skeleton** — "not yet analysed" state on PR cards

### Key Rules to Preserve
- **Never use `--critical-red` on individual contributor cards** — only repo-level
- **Score numbers always use `--font-mono`** — never Inter
- **Hover states always lift + glow** — `translateY(-2 to -4px)` + stronger cyan border
- **Dark theme default** for dev-tool audience
- **All transitions elastic** not linear — `cubic-bezier(0.16, 1, 0.3, 1)`

---

## 18. Full CSS Variable Quick Reference

```css
/* BACKGROUNDS */
--bg-void, --bg-primary, --bg-secondary, --bg-surface, --bg-surface-hover
--card-bg, --nav-bg

/* BRAND ACCENT (cyan) */
--scan-cyan, --scan-cyan-dim, --scan-cyan-glow, --scan-cyan-glow-strong, --scan-cyan-rgb

/* SEMANTIC COLORS */
--health-green, --health-green-dim, --health-green-rgb
--warning-amber, --warning-amber-rgb
--warning-orange
--critical-red, --critical-red-rgb
--info-blue
--purple

/* TEXT */
--text-primary, --text-primary-rgb
--text-secondary
--text-muted, --text-muted-rgb
--text-dim

/* BORDERS */
--border-subtle

/* SHADOWS */
--card-shadow, --shadow-glow, --shadow-glow-strong
--nav-border

/* FONTS */
--font-display, --font-mono

/* RADIUS */
--radius-sm(8), --radius-md(12), --radius-lg(16), --radius-xl(24)

/* TRANSITIONS */
--transition-fast(0.15s), --transition-normal(0.3s), --transition-slow(0.5s)
```

---

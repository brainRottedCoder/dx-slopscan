/**
 * Hugo Chrome Extension — Content Script
 * Aligned with Hugo v2 API (POST /analyze, hugo_score, 9 signals) and app route /scan.
 */

const DEFAULT_CONFIG = {
  API_URL: 'https://dx-slopscan.onrender.com',
  APP_URL: 'https://dx-slopscan.vercel.app',
}

async function loadConfig() {
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    try {
      const stored = await chrome.storage.sync.get(['API_URL', 'APP_URL'])
      return {
        API_URL: (stored.API_URL || DEFAULT_CONFIG.API_URL).replace(/\/$/, ''),
        APP_URL: (stored.APP_URL || DEFAULT_CONFIG.APP_URL).replace(/\/$/, ''),
      }
    } catch {
      /* fall through */
    }
  }
  return { ...DEFAULT_CONFIG }
}

/** Matches frontend SCORE_COLOR in scan/page.tsx */
function scoreColor(score) {
  if (score >= 76) return '#7AE2CF'
  if (score >= 51) return '#FDEB9E'
  if (score >= 26) return '#e07000'
  return '#ff5c6a'
}

function scoreTier(score) {
  if (score >= 76) return 'quality'
  if (score >= 51) return 'low'
  if (score >= 26) return 'medium'
  return 'high'
}

/** Matches frontend/lib/species.ts */
const SPECIES_COLORS = {
  ECHO: '#ff1744',
  HOLLOW: '#ff6d00',
  HAZE: '#ffab00',
  SPIRAL: '#b388ff',
  SURFACE: '#00e676',
  STENCIL: '#448aff',
  FUSE: '#00c853',
  GHOST: '#9e9e9e',
  BULLET: '#7c4dff',
  VAULT: '#d500f9',
  PADDING: '#ff5252',
}

function hugoMarkSvg(uid = 'ext') {
  const bgId = `hugo-bg-${uid}`
  const ringId = `hugo-ring-${uid}`
  return `<svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <defs>
    <linearGradient id="${bgId}" x1="0" y1="0" x2="96" y2="96">
      <stop offset="0%" stop-color="#0a2d3d"/>
      <stop offset="100%" stop-color="#04161f"/>
    </linearGradient>
    <linearGradient id="${ringId}" x1="48" y1="8" x2="48" y2="88">
      <stop offset="0%" stop-color="#7AE2CF"/>
      <stop offset="100%" stop-color="#077A7D"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="88" height="88" rx="18" fill="url(#${bgId})" stroke="#077A7D" stroke-width="2"/>
  <circle cx="48" cy="48" r="34" stroke="url(#${ringId})" stroke-width="2" stroke-dasharray="8 6" opacity="0.85"/>
  <path d="M22 30V22h8" stroke="#7AE2CF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M74 30V22h-8" stroke="#7AE2CF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M22 66v8h8" stroke="#7AE2CF" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M74 66v8h-8" stroke="#7AE2CF" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="28" y="30" width="9" height="36" rx="2" fill="#7AE2CF"/>
  <rect x="59" y="30" width="9" height="36" rx="2" fill="#7AE2CF"/>
  <rect x="28" y="44" width="40" height="8" rx="2" fill="#FDEB9E"/>
  <circle cx="68" cy="26" r="4" fill="#7AE2CF"/>
  <circle cx="48" cy="48" r="3" fill="#077A7D" stroke="#7AE2CF" stroke-width="1.5"/>
</svg>`
}

function renderSpeciesChips(species) {
  if (!species?.length) return ''
  const chips = species
    .map((sp) => {
      const color = SPECIES_COLORS[sp.type] || '#5d8a93'
      const title = sp.name ? `${sp.name} (${Math.round((sp.confidence || 0) * 100)}%)` : ''
      return `<span class="hugo-badge__species-chip" style="--chip-color:${color}" title="${title}">${sp.glyph || ''}</span>`
    })
    .join('')
  return `<div class="hugo-badge__species">${chips}</div>`
}

function createBadgeShell() {
  const badge = document.createElement('button')
  badge.id = 'hugo-badge'
  badge.type = 'button'
  badge.className = 'hugo-badge hugo-badge--loading'
  badge.setAttribute('aria-label', 'Hugo PR score — loading')
  badge.innerHTML = `
    <span class="hugo-badge__mark">${hugoMarkSvg()}</span>
    <span class="hugo-badge__body">
      <span class="hugo-badge__brand">Hugo</span>
      <span class="hugo-badge__status">Scanning PR…</span>
    </span>
  `
  return badge
}

function renderBadgeSuccess(badge, data) {
  const score = Math.round(data.hugo_score)
  const label = data.slop_label || 'Unknown'
  const color = scoreColor(score)
  const tier = scoreTier(score)
  const species = data.species || []
  const ms = data.processing_ms != null ? `${data.processing_ms}ms` : ''

  badge.className = `hugo-badge hugo-badge--tier-${tier}`
  badge.style.setProperty('--hugo-score-color', color)
  badge.setAttribute('aria-label', `Hugo score ${score} out of 100, ${label}. Click for full breakdown.`)
  badge.title = `Hugo ${score}/100 · ${label}\n${species.map((s) => `${s.name} (${Math.round((s.confidence || 0) * 100)}%)`).join('\n')}\nClick for full breakdown · 0 LLM calls`

  badge.innerHTML = `
    <span class="hugo-badge__mark">${hugoMarkSvg('ok')}</span>
    <span class="hugo-badge__body">
      <span class="hugo-badge__row">
        <span class="hugo-badge__score">${score}<span class="hugo-badge__score-suffix">/100</span></span>
        <span class="hugo-badge__label">${label}</span>
      </span>
      ${renderSpeciesChips(species)}
      ${ms ? `<span class="hugo-badge__meta">${ms} · 0 LLM</span>` : ''}
    </span>
    <span class="hugo-badge__cta" aria-hidden="true">↗</span>
  `
}

function renderBadgeError(badge, message) {
  badge.className = 'hugo-badge hugo-badge--error'
  badge.disabled = true
  badge.setAttribute('aria-label', `Hugo could not score this PR: ${message}`)
  badge.title = message
  badge.innerHTML = `
    <span class="hugo-badge__mark">${hugoMarkSvg('err')}</span>
    <span class="hugo-badge__body">
      <span class="hugo-badge__brand">Hugo</span>
      <span class="hugo-badge__status">Unavailable</span>
      <span class="hugo-badge__meta">${message}</span>
    </span>
  `
}

function scrapeDiffFromPage() {
  const parts = []
  const fileNames = new Set()
  const fileSelectors = [
    '.file-info a.Link--primary',
    '.file-header [data-path]',
    '.file-header .file-info a',
    'a[data-path]',
  ]
  for (const sel of fileSelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      const name = el.getAttribute('data-path') || el.textContent?.trim()
      if (name && name.length > 1 && !name.startsWith('#')) {
        fileNames.add(name.split('\n')[0].trim())
      }
    })
  }
  if (fileNames.size > 0) parts.push([...fileNames].join(' '))

  const addedLines = [...document.querySelectorAll(
    '.blob-code-addition .blob-code-inner, td.blob-code-addition .blob-code-inner',
  )]
    .slice(0, 100)
    .map((el) => el.textContent?.trim())
    .filter(Boolean)
  if (addedLines.length > 0) parts.push(addedLines.join('\n'))

  return parts.join('\n\n').slice(0, 8000)
}

function scanDeepLink(appUrl, prPageUrl) {
  const params = new URLSearchParams({
    pr: prPageUrl,
    autorun: '1',
  })
  return `${appUrl}/scan?${params.toString()}`
}

;(async () => {
  if (!window.location.pathname.match(/\/pull\/\d+/)) return

  const CONFIG = await loadConfig()

  const waitForEl = (selector, timeout = 5000) =>
    new Promise((resolve, reject) => {
      const el = document.querySelector(selector)
      if (el) return resolve(el)
      const observer = new MutationObserver(() => {
        const found = document.querySelector(selector)
        if (found) {
          observer.disconnect()
          resolve(found)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
      setTimeout(() => {
        observer.disconnect()
        reject(new Error('Timeout'))
      }, timeout)
    })

  let badge = null

  try {
    const descEl = await waitForEl('.js-comment-body, [data-testid="pr-body"]')
    const description = descEl?.innerText?.trim()
    if (!description || description.length < 10) return

    badge = createBadgeShell()
    const titleArea = document.querySelector('.gh-header-actions, .js-sticky-offset-scroll')
    if (titleArea) titleArea.prepend(badge)

    const diffText = scrapeDiffFromPage()
    const payload = { description, mode: 'pr' }
    if (diffText) payload.diff = diffText

    const res = await fetch(`${CONFIG.API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.detail || `API ${res.status}`)
    }
    const data = await res.json()
    if (data.hugo_score == null) throw new Error('Invalid API response (missing hugo_score)')

    renderBadgeSuccess(badge, data)

    badge.addEventListener('click', () => {
      window.open(scanDeepLink(CONFIG.APP_URL, window.location.href), '_blank')
    })
  } catch (err) {
    console.log('[Hugo] Could not score PR:', err.message)
    if (badge) renderBadgeError(badge, err.message)
  }
})()

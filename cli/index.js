#!/usr/bin/env node
/**
 * Hugo CLI — dx-slopscan
 * npx dx-slopscan check <github-pr-url>
 * npx dx-slopscan check --paste [--mode pr|docs]
 * npx dx-slopscan health
 * npx dx-slopscan install-hook
 */
const https = require('https')
const http = require('http')
const readline = require('readline')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const { SCORING_SIGNALS, COVERAGE_CHECKS, effectiveSignal } = require('./signals')

const DEFAULT_API = 'https://dx-slopscan.onrender.com'

function apiUrl() {
  return (process.env.HUGO_API_URL || DEFAULT_API).replace(/\/$/, '')
}

const COLORS = {
  red: '\x1b[31m', orange: '\x1b[33m', green: '\x1b[32m',
  purple: '\x1b[35m', reset: '\x1b[0m', bold: '\x1b[1m',
  dim: '\x1b[2m', cyan: '\x1b[36m', yellow: '\x1b[33m',
}

const LABEL_COLORS = {
  Quality: '\x1b[32m',
  'Low Slop': '\x1b[33m',
  'Medium Slop': '\x1b[33m',
  'High Slop': '\x1b[31m',
}

function bar(score, width = 30) {
  const filled = Math.round((score / 100) * width)
  const empty = width - filled
  const color = score >= 76 ? COLORS.green : score >= 51 ? COLORS.orange : COLORS.red
  return color + '█'.repeat(filled) + COLORS.dim + '░'.repeat(empty) + COLORS.reset
}

function request(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiPath, apiUrl())
    const isHttps = url.protocol === 'https:'
    const lib = isHttps ? https : http
    const data = body ? JSON.stringify(body) : null
    const opts = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: data
        ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
        : {},
    }
    const req = lib.request(opts, res => {
      let raw = ''
      res.on('data', c => { raw += c })
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : {}
          if (res.statusCode >= 400) {
            reject(new Error(parsed.detail || `API error ${res.statusCode}`))
            return
          }
          resolve(parsed)
        } catch {
          reject(new Error(`Invalid JSON from API: ${raw.slice(0, 200)}`))
        }
      })
    })
    req.on('error', reject)
    if (data) req.write(data)
    req.end()
  })
}

function post(apiPath, body) {
  return request('POST', apiPath, body)
}

function get(apiPath) {
  return request('GET', apiPath)
}

function printResult(data, { json = false } = {}) {
  if (json) {
    console.log(JSON.stringify(data, null, 2))
    return
  }

  const c = COLORS
  const labelColor = LABEL_COLORS[data.slop_label] || c.red

  console.log()
  console.log(c.bold + '  Hugo — DX SlopScan' + c.reset)
  console.log(c.dim + '  ─────────────────────────────────────────' + c.reset)

  if (data.pr_title) {
    console.log(c.dim + '  PR: ' + c.reset + data.pr_title)
    if (data.diff_summary) console.log(c.dim + '      ' + data.diff_summary + c.reset)
    if (data.pr_url) console.log(c.dim + '      ' + data.pr_url + c.reset)
    console.log()
  }

  console.log('  ' + bar(data.hugo_score) + '  ' + c.bold + labelColor + data.hugo_score + '/100' + c.reset + '  ' + labelColor + data.slop_label + c.reset)
  console.log()

  const s = data.signals || {}
  console.log(c.dim + '  Signals (9-signal ensemble):' + c.reset)
  for (const sig of SCORING_SIGNALS) {
    const eff = effectiveSignal(s, sig)
    const pct = (eff * 100).toFixed(0).padStart(3)
    const color = sig.invert ? c.orange : c.green
    console.log('  ' + color + `${sig.label.padEnd(14)} ${pct}/100` + c.reset + c.dim + `  ${sig.description}` + c.reset)
  }
  console.log(c.dim + `  Confidence: ${((s.confidence ?? 0) * 100).toFixed(0)}%  |  LLM calls: 0  |  ${data.processing_ms}ms` + c.reset)
  console.log()

  if (data.species?.length) {
    console.log(c.dim + '  Detected species:' + c.reset)
    for (const sp of data.species) {
      console.log(`  ${sp.glyph} ${c.bold}${sp.name}${c.reset} ${c.dim}(${(sp.confidence * 100).toFixed(0)}%)${c.reset}`)
      if (sp.evidence) console.log(`    ${c.dim}evidence: "${sp.evidence.slice(0, 70)}..."${c.reset}`)
      console.log(`    ${c.cyan}fix: ${sp.fix}${c.reset}`)
    }
    console.log()
  }

  const sentences = data.sentences || []
  const red = sentences.filter(x => x.label === 'red')
  const purple = sentences.filter(x => x.label === 'purple')

  if (red.length) {
    console.log(c.red + '  Derivable sentences (restate diff):' + c.reset)
    red.slice(0, 3).forEach(x => {
      console.log(`  ${c.dim}  "${x.text.slice(0, 90)}"${c.reset}`)
      if (x.counterfactual) console.log(`  ${c.cyan}  → ${x.counterfactual}${c.reset}`)
    })
    console.log()
  }

  if (purple.length) {
    console.log(c.purple + '  Epistemic sentences:' + c.reset)
    purple.slice(0, 2).forEach(x => {
      console.log(`  ${c.dim}  "${x.text.slice(0, 90)}"${c.reset}`)
      if (x.epistemic_acts?.length) console.log(`  ${c.purple}  → ${x.epistemic_acts[0]}${c.reset}`)
    })
    console.log()
  }

  const m = data.whats_missing || {}
  const missing = COVERAGE_CHECKS.filter(({ key }) => !m[key])
  if (missing.length) {
    console.log(c.dim + "  What's missing:" + c.reset)
    missing.forEach(({ label }) => console.log(`  ${c.red}✗${c.reset} ${label}`))
    console.log()
  }

  if (m.questions?.length) {
    console.log(c.dim + '  Questions a reviewer will ask:' + c.reset)
    m.questions.forEach(q => console.log(`  ${c.dim}→ ${q}${c.reset}`))
    console.log()
  }

  if (data.false_positive_warning) {
    console.log(c.orange + '  ⚠ ' + data.false_positive_warning + c.reset)
    console.log()
  }

  console.log(c.dim + '  ─────────────────────────────────────────' + c.reset)
  console.log(c.dim + `  API: ${apiUrl()} · Hugo v2.0 · 0 LLM calls` + c.reset)
  console.log()
}

async function checkPR(prUrl, opts) {
  console.log(COLORS.dim + '  Analyzing PR...' + COLORS.reset)
  const data = await post('/analyze', { pr_url: prUrl, mode: opts.mode || 'pr' })
  printResult(data, opts)
}

async function checkPaste(opts) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  console.log(COLORS.dim + 'Paste your PR description and press Ctrl+D (Ctrl+Z on Windows) when done:\n' + COLORS.reset)
  const lines = []
  rl.on('line', l => lines.push(l))
  rl.on('close', async () => {
    const description = lines.join('\n').trim()
    if (!description) {
      console.error('No input provided.')
      process.exit(1)
    }
    console.log(COLORS.dim + '  Analyzing...' + COLORS.reset)
    try {
      const body = { description, mode: opts.mode || 'pr' }
      if (opts.diffFile) {
        body.diff = fs.readFileSync(opts.diffFile, 'utf8')
      }
      const data = await post('/analyze', body)
      printResult(data, opts)
    } catch (e) {
      console.error(COLORS.red + 'Error:' + COLORS.reset, e.message)
      process.exit(1)
    }
  })
}

async function healthCheck() {
  const data = await get('/health')
  console.log(COLORS.green + 'Hugo API OK' + COLORS.reset)
  console.log(`  URL:     ${apiUrl()}`)
  console.log(`  Version: ${data.version}`)
  console.log(`  Model:   ${data.model}`)
  console.log(`  Signals: ${(data.signals || []).join(', ')}`)
}

function installHook() {
  let gitRoot
  try {
    gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim()
  } catch {
    console.error(COLORS.red + 'Error:' + COLORS.reset, 'Not inside a git repository.')
    process.exit(1)
  }

  const candidates = [
    path.join(__dirname, '..', 'hooks', 'pre-commit'),
    path.join(__dirname, 'hooks', 'pre-commit'),
  ]
  const hookSrc = candidates.find(p => fs.existsSync(p))
  if (!hookSrc) {
    console.error(COLORS.red + 'Error:' + COLORS.reset, 'pre-commit hook template not found.')
    process.exit(1)
  }

  const hookDest = path.join(gitRoot, '.git', 'hooks', 'pre-commit')
  fs.copyFileSync(hookSrc, hookDest)
  fs.chmodSync(hookDest, 0o755)

  console.log(COLORS.green + '✅ Hugo pre-commit hook installed' + COLORS.reset)
  console.log(COLORS.dim + '  ' + hookDest + COLORS.reset)
  console.log(COLORS.dim + '  Set HUGO_API_URL (default: ' + DEFAULT_API + ') and HUGO_THRESHOLD.' + COLORS.reset)
}

function parseCheckArgs(args) {
  const opts = { mode: 'pr', json: false, diffFile: null }
  const positional = []
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--paste') positional.push('--paste')
    else if (a === '--json') opts.json = true
    else if (a === '--mode' && args[i + 1]) { opts.mode = args[++i] }
    else if (a === '--diff' && args[i + 1]) { opts.diffFile = args[++i] }
    else if (a === '--api' && args[i + 1]) {
      process.env.HUGO_API_URL = args[++i]
    } else if (!a.startsWith('-')) positional.push(a)
  }
  return { positional, opts }
}

async function main() {
  const [,, cmd, ...rest] = process.argv

  try {
    if (cmd === 'health') {
      await healthCheck()
      return
    }

    if (cmd === 'check') {
      const { positional, opts } = parseCheckArgs(rest)
      const target = positional[0]
      if (!target) {
        console.log(COLORS.red + 'Usage:' + COLORS.reset + ' npx dx-slopscan check <github-pr-url>')
        console.log('       npx dx-slopscan check --paste [--mode pr|docs] [--diff path] [--json]')
        process.exit(1)
      }
      if (target === '--paste') {
        await checkPaste(opts)
        return
      }
      if (target.includes('github.com')) {
        await checkPR(target, opts)
        return
      }
      console.log(COLORS.red + 'Expected a GitHub PR URL or --paste.' + COLORS.reset)
      process.exit(1)
    }

    if (cmd === 'install-hook') {
      installHook()
      return
    }

    console.log()
    console.log(COLORS.bold + '  Hugo — DX SlopScan CLI' + COLORS.reset)
    console.log(COLORS.dim + '  Measures epistemic contribution in PR descriptions.' + COLORS.reset)
    console.log()
    console.log('  Commands:')
    console.log('    npx dx-slopscan check <github-pr-url> [--json]')
    console.log('    npx dx-slopscan check --paste [--mode pr|docs] [--diff file] [--json]')
    console.log('    npx dx-slopscan health')
    console.log('    npx dx-slopscan install-hook')
    console.log()
    console.log('  Environment:')
    console.log('    HUGO_API_URL   API base URL (default: ' + DEFAULT_API + ')')
    console.log('    HUGO_THRESHOLD Pre-commit warning threshold (default: 20)')
    console.log()
  } catch (e) {
    console.error(COLORS.red + 'Error:' + COLORS.reset, e.message)
    process.exit(1)
  }
}

main()

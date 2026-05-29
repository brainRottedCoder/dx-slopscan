# Phase Runner for Slop Scanner Implementation
# Usage: .\run-next-phase.ps1
# This script tracks progress and guides phase-by-phase implementation

param(
    [switch]$AutoRun,
    [switch]$Reset
)

$trackerPath = ".phase-state.json"
$planPath = "implementation-plan.md"

if ($Reset) {
    @{
        currentPhase = 1
        completedPhases = @()
        status = "ready"
        autoAdvance = $true
    } | ConvertTo-Json -Depth 3 | Set-Content $trackerPath
    Write-Host "Phase tracker reset. Starting from Phase 1." -ForegroundColor Cyan
    return
}

if (-not (Test-Path $trackerPath)) {
    Write-Error "Phase tracker not found. Run with -Reset to initialize."
    exit 1
}

$tracker = Get-Content $trackerPath | ConvertFrom-Json
$currentPhase = $tracker.currentPhase

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "SLOP SCANNER PHASE IMPLEMENTATION" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Current Phase: $currentPhase" -ForegroundColor Yellow
Write-Host "Completed: $($tracker.completedPhases -join ', ')" -ForegroundColor Green
Write-Host ""

if ($currentPhase -gt 8) {
    Write-Host "ALL PHASES COMPLETE!" -ForegroundColor Green
    exit 0
}

$phaseNames = @{
    1 = "Foundation & Monorepo Setup"
    2 = "GitHub Integration Layer"
    3 = "Detection Engine Core"
    4 = "Tier 1 Scan Backend"
    5 = "Tier 1 Frontend & Heatmap"
    6 = "Tier 2 On-Demand Analysis"
    7 = "Calibration, Compliance & Polish"
    8 = "Tier 3, Export & Demo Hardening"
}

Write-Host "Phase $currentPhase`: $($phaseNames[$currentPhase])" -ForegroundColor Magenta
Write-Host ""

if (-not $AutoRun) {
    Write-Host "To implement this phase, tell the AI agent:" -ForegroundColor White
    Write-Host "  'Implement Phase $currentPhase'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After implementation and tests pass, run:" -ForegroundColor White
    Write-Host "  .\run-next-phase.ps1 -AutoRun" -ForegroundColor Yellow
} else {
    Write-Host "Auto-run mode: Marking Phase $currentPhase as complete and advancing..." -ForegroundColor Cyan
    
    $completed = $tracker.completedPhases
    if ($completed -isnot [array]) { $completed = @() }
    $completed += $currentPhase
    
    $tracker.currentPhase = $currentPhase + 1
    $tracker.completedPhases = $completed
    $tracker.status = "phase-$($currentPhase + 1)-ready"
    
    $tracker | ConvertTo-Json -Depth 3 | Set-Content $trackerPath
    
    Write-Host "Phase $currentPhase marked complete." -ForegroundColor Green
    Write-Host ""
    
    if ($tracker.currentPhase -le 8) {
        Write-Host "Next: Phase $($tracker.currentPhase)` - $($phaseNames[$tracker.currentPhase])" -ForegroundColor Magenta
        Write-Host "Run .\run-next-phase.ps1 to see details, or tell the AI 'Implement Phase $($tracker.currentPhase)'" -ForegroundColor Yellow
    }
}
Write-Host ""

from pydantic import BaseModel
from typing import Optional
from enum import Enum

class SentenceLabel(str, Enum):
    RED    = "red"
    ORANGE = "orange"
    GREEN  = "green"
    PURPLE = "purple"

class SentenceResult(BaseModel):
    text: str
    label: SentenceLabel
    derivability: float
    epistemic_acts: list[str]
    score_contribution: float
    counterfactual: Optional[str] = None

class SignalScores(BaseModel):
    coverage: float = 0.0           # epistemic checklist score
    novelty: float                  # diff novelty
    reasoning: float                # epistemic acts
    anchor: float                   # causal + entity
    mirror_penalty: float           # diff vocabulary overlap penalty
    confidence: float
    reach: float = 0.5              # diff coverage
    lean: float = 0.5               # information density
    specificity: float = 0.0        # technical depth per sentence
    structure: float = 0.0          # organizational clarity

class UncoveredChunk(BaseModel):
    chunk: str      # short diff chunk text
    coverage: float # 0-1, how well description addresses it

class Species(BaseModel):
    type: str
    glyph: str
    name: str
    confidence: float
    evidence: Optional[str]
    counterfactual: str
    fix: str

class WhatsMissing(BaseModel):
    has_why: bool
    has_tradeoff: bool
    has_alternative: bool
    has_risk: bool
    has_evidence: bool
    has_scope: bool = False
    has_rollback: bool = False
    has_migration: bool = False
    has_example: bool = False
    has_prerequisite: bool = False
    has_step: bool = False
    questions: list[str]

class AnalyzeRequest(BaseModel):
    pr_url: Optional[str] = None
    description: Optional[str] = None
    diff: Optional[str] = None
    mode: str = "pr"

class AnalyzeResponse(BaseModel):
    hugo_score: float
    slop_label: str
    sentences: list[SentenceResult]
    signals: SignalScores
    whats_missing: WhatsMissing
    species: list[Species] = []
    uncovered_chunks: list[UncoveredChunk] = []  # NEW: diff areas description misses
    pr_title: Optional[str] = None
    pr_url: Optional[str] = None
    diff_summary: Optional[str] = None
    false_positive_warning: Optional[str] = None
    processing_ms: int = 0

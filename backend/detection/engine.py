"""
Hugo Detection Engine
=======================
Nine signals, zero LLM calls in detection path.

Hugo = Coverage×0.18 + Novelty×0.20 + Reasoning×0.18 + Anchor×0.10
      + (1−Mirror)×0.10 + Reach×0.08 + Lean×0.03
      + Specificity×0.06 + Structure×0.07
"""
import time
from typing import Optional
from core.config import get_settings
from core.models import (
    AnalyzeRequest, AnalyzeResponse,
    SentenceResult, SentenceLabel,
    SignalScores, WhatsMissing, Species, UncoveredChunk,
)
from detection.github_parser import fetch_pr, ParsedPR
from detection.signals.novelty import (
    compute_novelty, compute_novelty_from_text,
    split_sentences, build_diff_chunks_text,
)
from detection.signals.reasoning import compute_reasoning, get_act_type_for_sentence, EpistemicAct
from detection.signals.mirror import compute_mirror_penalty, compute_anchor
from detection.signals.coverage import compute_coverage
from detection.signals.lean import compute_lean
from detection.signals.specificity import compute_specificity
from detection.signals.structure import compute_structure
from detection.signals.species import classify_species, SpeciesResult
from detection.signals.reach import compute_reach, uncovered_reach_chunks


def _slop_label(score: float) -> str:
    if score >= 76: return "Quality"
    elif score >= 51: return "Low Slop"
    elif score >= 26: return "Medium Slop"
    else: return "High Slop"


def _false_positive_warning(description: str, hugo_score: float) -> Optional[str]:
    word_count = len(description.split())
    if hugo_score < 30 and word_count < 40:
        return (
            "⚠ Short description detected. Terse kernel-style PRs may score "
            "lower than their true quality. Review sentence highlights manually."
        )
    return None


def _build_sentence_results(
    novelty_sentence_results: list[tuple[str, float, str, Optional[str]]],
    reasoning_acts: list[EpistemicAct],
) -> list[SentenceResult]:
    results = []
    for sentence, derivability, base_label, counterfactual in novelty_sentence_results:
        act_type = get_act_type_for_sentence(sentence, reasoning_acts)
        epistemic_acts = [act_type] if act_type else []
        final_label = SentenceLabel.PURPLE if act_type else SentenceLabel(base_label)

        if final_label in (SentenceLabel.GREEN, SentenceLabel.PURPLE):
            contribution = (1.0 - derivability) * 10
        elif final_label == SentenceLabel.ORANGE:
            contribution = 0.0
        else:
            contribution = -(derivability - 0.5) * 5

        results.append(SentenceResult(
            text=sentence,
            label=final_label,
            derivability=round(derivability, 3),
            epistemic_acts=epistemic_acts,
            score_contribution=round(contribution, 2),
            counterfactual=counterfactual,
        ))
    return results


async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    start = time.time()
    settings = get_settings()
    pr_data: Optional[ParsedPR] = None
    mode = request.mode or "pr"

    if request.pr_url:
        try:
            pr_data = fetch_pr(request.pr_url)
            description = pr_data.description
            diff_text = pr_data.all_diff_text
            diff_entities = [e for c in pr_data.diff_chunks for e in c.entities]
            pr_title = pr_data.title
            diff_summary = f"{len(pr_data.diff_chunks)} files changed"
            diff_chunks_text = build_diff_chunks_text(pr_data)
        except ValueError as e:
            raise ValueError(str(e))
    else:
        description = request.description or ""
        diff_text = request.diff or ""
        diff_entities = []
        pr_title = None
        diff_summary = None
        diff_chunks_text = [c.strip() for c in diff_text.split('\n\n') if c.strip()][:30]
        if not diff_chunks_text:
            diff_chunks_text = [diff_text[:1000]] if diff_text.strip() else []

    if not description.strip():
        raise ValueError("No description content to analyze.")

    sentences = split_sentences(description)

    if pr_data:
        novelty_score, confidence, novelty_sentence_results = compute_novelty(pr_data)
    else:
        novelty_score, confidence, novelty_sentence_results = compute_novelty_from_text(
            description, diff_text
        )

    reasoning_score, reasoning_acts = compute_reasoning(sentences, diff_entities)
    mirror_score = compute_mirror_penalty(description, diff_text)
    anchor_score = compute_anchor(sentences, diff_entities)
    coverage_check = compute_coverage(description, mode=mode)

    if diff_chunks_text and sentences:
        reach_score, chunk_coverage = compute_reach(sentences, diff_chunks_text)
        threshold = settings.reach_uncovered_threshold
        uncovered = uncovered_reach_chunks(chunk_coverage, threshold=threshold)
    else:
        reach_score = 0.5
        chunk_coverage = []
        uncovered = []

    coverage_score = (
        coverage_check.has_why * 0.22
        + coverage_check.has_tradeoff * 0.15
        + coverage_check.has_alternative * 0.15
        + coverage_check.has_risk * 0.12
        + coverage_check.has_evidence * 0.12
        + coverage_check.has_scope * 0.10
        + coverage_check.has_rollback * 0.08
        + coverage_check.has_migration * 0.06
    )

    lean_score = compute_lean(description)
    specificity_score = compute_specificity(sentences, diff_entities)
    structure_score = compute_structure(description)

    hugo_raw = (
        coverage_score * settings.weight_coverage
        + novelty_score * settings.weight_novelty
        + reasoning_score * settings.weight_reasoning
        + anchor_score * settings.weight_anchor
        + (1.0 - mirror_score) * settings.weight_mirror
        + reach_score * settings.weight_reach
        + lean_score * settings.weight_lean
        + specificity_score * settings.weight_specificity
        + structure_score * settings.weight_structure
    )

    if len(sentences) < 3:
        hugo_raw *= 0.85

    hugo_score = round(hugo_raw * 100, 1)

    sentence_results = _build_sentence_results(novelty_sentence_results, reasoning_acts)
    sentence_labels = [s.label.value for s in sentence_results]
    word_count = len(description.split())

    species_raw = classify_species(
        description=description,
        sentences=sentences,
        sentence_labels=sentence_labels,
        novelty=novelty_score,
        reasoning=reasoning_score,
        anchor=anchor_score,
        mirror=mirror_score,
        has_why=coverage_check.has_why,
        has_tradeoff=coverage_check.has_tradeoff,
        has_alternative=coverage_check.has_alternative,
        has_risk=coverage_check.has_risk,
        has_evidence=coverage_check.has_evidence,
        word_count=word_count,
        lean=lean_score,
        reach=reach_score,
        diff_text=diff_text,
        diff_entities=diff_entities,
    )

    uncovered_models = [
        UncoveredChunk(chunk=chunk[:100], coverage=round(sim, 3))
        for chunk, sim in chunk_coverage[:3]
        if sim < settings.reach_uncovered_threshold
    ]

    elapsed_ms = int((time.time() - start) * 1000)

    return AnalyzeResponse(
        hugo_score=hugo_score,
        slop_label=_slop_label(hugo_score),
        sentences=sentence_results,
        signals=SignalScores(
            coverage=round(coverage_score, 3),
            novelty=round(novelty_score, 3),
            reasoning=round(reasoning_score, 3),
            anchor=round(anchor_score, 3),
            mirror_penalty=round(mirror_score, 3),
            confidence=round(confidence, 3),
            reach=round(reach_score, 3),
            lean=round(lean_score, 3),
            specificity=round(specificity_score, 3),
            structure=round(structure_score, 3),
        ),
        whats_missing=WhatsMissing(
            has_why=coverage_check.has_why,
            has_tradeoff=coverage_check.has_tradeoff,
            has_alternative=coverage_check.has_alternative,
            has_risk=coverage_check.has_risk,
            has_evidence=coverage_check.has_evidence,
            has_scope=coverage_check.has_scope,
            has_rollback=coverage_check.has_rollback,
            has_migration=coverage_check.has_migration,
            has_example=coverage_check.has_example,
            has_prerequisite=coverage_check.has_prerequisite,
            has_step=coverage_check.has_step,
            questions=coverage_check.questions,
        ),
        species=[
            Species(
                type=s.type, glyph=s.glyph, name=s.name,
                confidence=s.confidence, evidence=s.evidence,
                counterfactual=s.counterfactual, fix=s.fix,
            )
            for s in species_raw
        ],
        uncovered_chunks=uncovered_models,
        pr_title=pr_title,
        pr_url=request.pr_url,
        diff_summary=diff_summary,
        false_positive_warning=_false_positive_warning(description, hugo_score),
        processing_ms=elapsed_ms,
    )

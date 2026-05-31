"""
Hugo detection signals — one module per signal.
"""
from detection.signals.coverage import compute_coverage, MissingAnalysis
from detection.signals.novelty import (
    compute_novelty,
    compute_novelty_from_text,
    split_sentences,
    build_diff_chunks_text,
)
from detection.signals.reasoning import (
    compute_reasoning,
    detect_epistemic_acts,
    get_act_type_for_sentence,
    EpistemicAct,
)
from detection.signals.mirror import compute_mirror_penalty, compute_anchor
from detection.signals.reach import compute_reach, uncovered_reach_chunks
from detection.signals.lean import compute_lean
from detection.signals.specificity import compute_specificity
from detection.signals.structure import compute_structure
from detection.signals.species import classify_species, SpeciesResult

__all__ = [
    "compute_coverage",
    "MissingAnalysis",
    "compute_novelty",
    "compute_novelty_from_text",
    "split_sentences",
    "build_diff_chunks_text",
    "compute_reasoning",
    "detect_epistemic_acts",
    "get_act_type_for_sentence",
    "EpistemicAct",
    "compute_mirror_penalty",
    "compute_anchor",
    "compute_reach",
    "uncovered_reach_chunks",
    "compute_lean",
    "compute_specificity",
    "compute_structure",
    "classify_species",
    "SpeciesResult",
]

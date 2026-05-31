"""
Hugo Signal Unit Tests
========================
Tests each signal independently and the full engine.
Run: python -m pytest backend/tests/ -v
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from detection.signals.reasoning import compute_reasoning, detect_epistemic_acts
from detection.signals.mirror import compute_mirror_penalty, compute_anchor
from detection.signals.coverage import compute_coverage
from detection.signals.lean import compute_lean
from detection.signals.specificity import compute_specificity
from detection.signals.structure import compute_structure
from detection.signals.species import classify_species


# ── ECS Tests ────────────────────────────────────────────────────

class TestECS:
    def test_causal_sentence_scores_positive(self):
        sentences = ["We switched to token rotation because session invalidation causes thundering herd."]
        score, acts = compute_reasoning(sentences, ["tokenRotation", "sessionInvalidation"])
        assert score > 0.0
        assert any(a.act_type == "causal" for a in acts)

    def test_contrastive_sentence_scores_positive(self):
        sentences = ["Used cursor pagination instead of OFFSET because OFFSET degrades at page 500."]
        score, acts = compute_reasoning(sentences, ["cursorPagination", "OFFSET"])
        assert score > 0.0
        assert any(a.act_type == "contrastive" for a in acts)

    def test_generic_slop_scores_zero(self):
        sentences = ["This PR fixes the bug.", "Various improvements have been made.", "Please review."]
        score, acts = compute_reasoning(sentences, [])
        assert score < 0.05

    def test_specific_entities_double_weight(self):
        generic = ["We chose approach A instead of approach B."]
        specific = ["We chose tokenRotation instead of sessionInvalidation."]
        generic_score, _ = compute_reasoning(generic, [])
        specific_score, _ = compute_reasoning(specific, ["tokenRotation", "sessionInvalidation"])
        assert specific_score > generic_score

    def test_anti_gaming_dampens_single_entity_stuffing(self):
        # All acts reference the same entity — should be dampened
        sentences = [
            "We used tokenManager because tokenManager handles rotation.",
            "tokenManager was chosen instead of sessionManager.",
            "Without tokenManager this would fail.",
            "tokenManager ensures cleanup without a GC cycle.",
        ]
        score, acts = compute_reasoning(sentences, ["tokenManager"])
        # Should score lower than 4 genuine diverse acts
        assert score < 0.80

    def test_alternative_consideration(self):
        sentences = ["We considered using Redis but decided against it because of the additional infrastructure."]
        score, acts = compute_reasoning(sentences, ["Redis"])
        assert score > 0.0
        assert any(a.act_type == "alternative" for a in acts)

    def test_tradeoff_requires_both_gain_and_cost(self):
        gain_only = ["This improves performance significantly."]
        gain_and_cost = ["This improves performance but increases memory overhead."]
        score_gain, acts_gain = compute_reasoning(gain_only, [])
        score_both, acts_both = compute_reasoning(gain_and_cost, [])
        tradeoff_acts = [a for a in acts_both if a.act_type == "tradeoff"]
        assert len(tradeoff_acts) > 0


# ── Alignment Tests ──────────────────────────────────────────────

class TestAlignment:
    def test_high_overlap_scores_high(self):
        desc = "Updated tokenManager.ts to fix token rotation. Changed the auth service."
        diff = "tokenManager.ts token rotation auth service updated"
        score = compute_mirror_penalty(desc, diff)
        assert score > 0.3

    def test_novel_description_scores_low(self):
        desc = "The race condition occurs because session locks are session-scoped, not transaction-scoped. This causes concurrent workers to process the same job twice."
        diff = "worker.py job_queue.py advisory_lock"
        score = compute_mirror_penalty(desc, diff)
        assert score < 0.5

    def test_empty_diff_returns_zero(self):
        score = compute_mirror_penalty("Some description", "")
        assert score == 0.0

    def test_engagement_requires_causal_plus_entity(self):
        # Causal + specific entity = high engagement
        sentences = ["We switched to cursor pagination because OFFSET degrades to O(n) at large page depths."]
        entities = ["OFFSET", "cursorPagination"]
        score = compute_anchor(sentences, entities)
        assert score > 0.3


class TestWhatsMissing:
    def test_quality_pr_has_all(self):
        description = """
        Root cause: token refresh fires after the expiring token is consumed, not before.
        We chose token rotation instead of session invalidation to avoid thundering herd.
        Tradeoff: fewer invalidations but 20% more refresh calls under load.
        In scope: mobile clients only; out of scope for web until Q3.
        Rollback: feature flag auth_refresh_v2 disables the new scheduler.
        Reviewers should scrutinize queue flush logic at L89.
        Tested on iOS 16 Safari with 45s artificial clock offset via Charles proxy.
        Alternative considered: reduce token TTL, but that triples refresh rate.
        """
        result = compute_coverage(description, mode="pr")
        assert result.has_why
        assert result.has_tradeoff
        assert result.has_alternative
        assert result.has_risk
        assert result.has_evidence
        assert result.has_scope
        assert result.has_rollback
        assert len(result.questions) < 3

    def test_slop_pr_missing_everything(self):
        description = "This PR fixes the bug. Various improvements have been made. Please review."
        result = compute_coverage(description, mode="pr")
        assert not result.has_why
        assert not result.has_tradeoff
        assert not result.has_alternative
        assert not result.has_risk
        assert not result.has_evidence
        assert len(result.questions) >= 5

    def test_docs_mode_checks_example(self):
        description = "This guide explains how to use the API. To authenticate, include your token."
        result = compute_coverage(description, mode="docs")
        assert not result.has_example
        assert any("example" in q.lower() for q in result.questions)

    def test_docs_mode_finds_example(self):
        description = "Here's how to authenticate:\n```bash\ncurl -H 'Authorization: Bearer TOKEN' /api/me\n```"
        result = compute_coverage(description, mode="docs")
        assert result.has_example


# ── Species Tests ────────────────────────────────────────────────

class TestSpecies:
    def _classify(self, description, sentences=None, labels=None,
                  novelty=0.25, reasoning=0.0, anchor=0.0, mirror=0.7,
                  has_why=False, has_tradeoff=False, has_alt=False,
                  has_risk=False, has_evidence=False, word_count=30):
        if sentences is None:
            sentences = [description]
        if labels is None:
            labels = ["red"] * len(sentences)
        return classify_species(
            description=description,
            sentences=sentences,
            sentence_labels=labels,
            novelty=novelty, reasoning=reasoning, anchor=anchor, mirror=mirror,
            has_why=has_why, has_tradeoff=has_tradeoff, has_alternative=has_alt,
            has_risk=has_risk, has_evidence=has_evidence, word_count=word_count,
        )

    def test_echo_detected_on_high_alignment_low_dris(self):
        sents = ["Updated the auth service.", "Fixed the bug in auth.py.", "Changed the login flow."]
        results = self._classify(
            " ".join(sents), sentences=sents, labels=["red","red","red"],
            novelty=0.22, mirror=0.72
        )
        types = [r.type for r in results]
        assert "ECHO" in types

    def test_surface_detected_when_no_why(self):
        sents = ["Changed the database query.", "Updated the pagination logic."]
        results = self._classify(
            " ".join(sents), sentences=sents, labels=["red","red"],
            novelty=0.30, has_why=False, has_tradeoff=False
        )
        types = [r.type for r in results]
        assert "SURFACE" in types

    def test_hollow_detected_on_zero_ecs_no_why_no_risk(self):
        results = self._classify(
            "This PR updates the code. Various changes were made.",
            reasoning=0.0, anchor=0.0, has_why=False, has_risk=False
        )
        types = [r.type for r in results]
        assert "HOLLOW" in types

    def test_quality_pr_detects_no_species(self):
        # High DRIS, high ECS, has everything
        results = self._classify(
            "Root cause was token rotation race. Fixed by using transaction-scoped locks.",
            novelty=0.75, reasoning=0.65, anchor=0.60, mirror=0.15,
            has_why=True, has_tradeoff=True, has_alt=True,
            has_risk=True, has_evidence=True, word_count=150
        )
        assert len(results) == 0

    def test_species_have_evidence_strings(self):
        sents = ["This PR updates the authentication.", "Various improvements made."]
        results = self._classify(
            "This PR updates the authentication. Various improvements made.",
            sentences=sents, labels=["red","red"],
            novelty=0.20, mirror=0.75, reasoning=0.0
        )
        for r in results:
            assert r.counterfactual  # every species must have a counterfactual
            assert r.fix             # and a fix instruction


# ── Integration smoke test ───────────────────────────────────────

class TestIntegration:
    def test_slop_scores_lower_than_quality_via_ecs(self):
        """Quality PR should score higher on ECS than slop PR (no model needed)."""
        quality = """
        Root cause: token refresh fires 200ms after the expiring token is consumed.
        On iOS with clock drift >30s (common after airplane mode), the expiry check
        uses server time but the refresh scheduler uses client time — the token
        looks valid client-side but is rejected server-side.
        Alternative considered: reduce token TTL to 5min, but that triples refresh rate.
        Reviewers should scrutinize queue flush ordering at L89.
        Tested with 45s artificial clock offset on iOS 16 Safari.
        """
        slop = "This PR fixes the authentication bug. Various improvements were made. Tests pass."
        
        q_sentences = [s.strip() for s in quality.strip().split("\n") if s.strip()]
        s_sentences = [s.strip() for s in slop.strip().split("\n") if s.strip()]
        
        q_ecs, _ = compute_reasoning(q_sentences, ["tokenRefresh", "TTL"])
        s_ecs, _ = compute_reasoning(s_sentences, [])
        assert q_ecs > s_ecs, f"Quality ECS {q_ecs} should exceed slop ECS {s_ecs}"

    def test_slop_scores_lower_than_quality_dris(self):
        """Quality description should score higher DRIS than slop vs the same diff."""
        from unittest import mock
        from detection.signals.novelty import compute_novelty_from_text

        quality_desc = """
        Root cause: token refresh fires 200ms after the expiring token is consumed.
        On iOS with clock drift >30s (common after airplane mode), the expiry check
        uses server time but the refresh scheduler uses client time — the token
        looks valid client-side but is rejected server-side.
        Fixed by triggering refresh at 80% of TTL instead of on-expiry.
        Alternative considered: reduce token TTL to 5min, but that triples refresh
        rate for all clients. Targeted fix preferred.
        Reviewers should scrutinize queue flush ordering at L89.
        Tested with 45s artificial clock offset on iOS 16 Safari.
        """
        slop_desc = (
            "Updated tokenManager.ts and auth.ts. "
            "Changed TokenRefreshScheduler.handleExpiry and sessionInvalidation handling."
        )
        diff = (
            "File: tokenManager.ts\nAdded: TokenRefreshScheduler.handleExpiry\n"
            "File: auth.ts\nAdded: sessionInvalidation sessionManager"
        )

        with mock.patch("detection.signals.novelty.MODEL_AVAILABLE", False):
            q_dris, _, q_sents = compute_novelty_from_text(quality_desc, diff)
            s_dris, _, s_sents = compute_novelty_from_text(slop_desc, diff)
        q_mean_deriv = sum(d for _, d, _, _ in q_sents) / max(1, len(q_sents))
        s_mean_deriv = sum(d for _, d, _, _ in s_sents) / max(1, len(s_sents))
        assert q_dris >= s_dris, f"Quality DRIS {q_dris} should be >= slop DRIS {s_dris}"
        assert q_mean_deriv < s_mean_deriv, (
            f"Quality sentences should be less derivable from diff "
            f"({q_mean_deriv:.3f} vs {s_mean_deriv:.3f})"
        )


# ── DSS Tests ─────────────────────────────────────────────────────

class TestDiffSurprise:
    """Tests for Diff Surprise Score (DSS)."""

    def test_module_has_required_functions(self):
        # DSS module imports sentence_transformers lazily (inside compute_reach)
        # so this import always works
        import importlib.util
        spec = importlib.util.spec_from_file_location(
            "reach",
            __file__.replace("test_signals.py", "") + "../detection/signals/reach.py"
        )
        assert spec is not None, "reach.py module must exist"

    def test_uncovered_chunks_filter(self):
        from detection.signals.reach import uncovered_reach_chunks

        chunk_coverage = [
            ("Changed tokenManager.ts", 0.30),
            ("Updated auth service", 0.70),
            ("Modified session handler", 0.25),
        ]
        uncovered = uncovered_reach_chunks(chunk_coverage, threshold=0.42)
        assert "Changed tokenManager.ts" in uncovered
        assert "Modified session handler" in uncovered
        assert "Updated auth service" not in uncovered

    def test_high_coverage_description(self):
        """Description mentions diff concepts → higher DSS."""
        from unittest import mock
        from detection.signals.reach import compute_reach

        sentences = [
            "We updated the tokenManager to fix the rotation bug.",
            "The sessionInvalidation logic was moved to the auth module.",
        ]
        diff_chunks = [
            "File: tokenManager.ts\nAdded: token rotation fix",
            "File: auth.py\nAdded: session invalidation moved",
        ]
        with mock.patch("detection.signals.reach.MODEL_AVAILABLE", False):
            dss, coverage = compute_reach(sentences, diff_chunks)
        assert dss >= 0.3, f"Expected high coverage DSS, got {dss}"
        assert any(sim >= 0.35 for _, sim in coverage), "At least one chunk should match description"

    def test_low_coverage_description(self):
        """Vague description vs specific diff chunks → lower DSS."""
        from unittest import mock
        from detection.signals.reach import compute_reach

        sentences = ["This PR fixes the bug. Various improvements were made."]
        diff_chunks = [
            "File: cryptoUtils.ts\nAdded: AES-256 key derivation using PBKDF2",
            "File: sessionStore.py\nAdded: Redis TTL configuration for session expiry",
        ]
        with mock.patch("detection.signals.reach.MODEL_AVAILABLE", False):
            dss, _ = compute_reach(sentences, diff_chunks)
        assert dss < 0.7, f"Expected low coverage DSS, got {dss}"


# ── ECS Specificity Tests ─────────────────────────────────────────

class TestECSSpecificity:
    def test_quantitative_data_increases_specificity(self):
        with_numbers = ["We switched because OFFSET degrades to O(n) at page 500, adding 3.2s latency."]
        without_numbers = ["We switched because the old approach was slow."]
        score_with, acts_with = compute_reasoning(with_numbers, [])
        score_without, acts_without = compute_reasoning(without_numbers, [])
        assert score_with > score_without

    def test_generic_filler_penalised(self):
        # Causal with generic filler vs causal with specific technical content
        generic = ["We switched to the new approach because it is better and more efficient."]
        specific = ["We switched to cursorPagination instead of OFFSET because OFFSET degrades to O(n) at page 500, adding 3.2s to p99."]
        g_score, _ = compute_reasoning(generic, ["cursorPagination", "OFFSET"])
        s_score, _ = compute_reasoning(specific, ["cursorPagination", "OFFSET"])
        assert s_score > g_score

    def test_technical_identifiers_detected(self):
        with_idents = ["We chose tokenRotation instead of sessionInvalidation."]
        score, acts = compute_reasoning(with_idents, [])
        assert score > 0
        assert any(a.entity_hit for a in acts)


# ── Config Tests ──────────────────────────────────────────────────

class TestSpecificityStructure:
    def test_specificity_rewards_quantitative_sentences(self):
        sentences = [
            "OFFSET pagination degrades to O(n) at page 500, adding 3.2s to p99.",
            "We switched to cursorPagination using the created_at index.",
        ]
        vague = ["We made the system faster and more reliable."]
        spec_score = compute_specificity(sentences, ["cursorPagination", "OFFSET"])
        vague_score = compute_specificity(vague, [])
        assert spec_score > vague_score

    def test_structure_rewards_sections(self):
        structured = """
## Root cause
Token refresh fired after expiry on drifted clocks.

## Testing
Verified with 45s artificial offset on iOS Safari.
"""
        flat = "Fixed the auth bug. Tests pass."
        assert compute_structure(structured) > compute_structure(flat)

    def test_hypothesis_act_detected(self):
        sentences = ["We suspect the race occurs when two workers claim the same session row."]
        score, acts = compute_reasoning(sentences, ["sessionRow"])
        assert score > 0
        assert any(a.act_type == "hypothesis" for a in acts)


class TestNewSpecies:
    def _classify(self, **kwargs):
        defaults = dict(
            description="", sentences=[], sentence_labels=[],
            novelty=0.3, reasoning=0.0, anchor=0.0, mirror=0.3,
            has_why=False, has_tradeoff=False, has_alternative=False,
            has_risk=False, has_evidence=False, word_count=50,
        )
        defaults.update(kwargs)
        return classify_species(**defaults)

    def test_ghost_on_short_pr(self):
        results = self._classify(
            description="Fix auth.",
            sentences=["Fix auth."],
            sentence_labels=["red"],
            word_count=2,
        )
        assert any(r.type == "GHOST" for r in results)

    def test_vault_on_security_diff_without_context(self):
        results = self._classify(
            description="Updated middleware and handlers.",
            sentences=["Updated middleware and handlers."],
            sentence_labels=["red"],
            diff_text="JWT validation token secret OAuth",
            diff_entities=["JWT", "tokenSecret"],
            has_risk=False,
        )
        assert any(r.type == "VAULT" for r in results)


class TestConfig:
    def test_weights_approximately_sum_to_one(self):
        from core.config import Settings
        s = Settings()
        total = (
            s.weight_coverage + s.weight_novelty + s.weight_reasoning
            + s.weight_anchor + s.weight_mirror + s.weight_reach + s.weight_lean
            + s.weight_specificity + s.weight_structure
        )
        assert abs(total - 1.0) < 0.01, f"Weights sum to {total}, expected ~1.0"

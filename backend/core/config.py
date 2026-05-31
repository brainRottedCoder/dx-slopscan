from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    github_token: str = ""
    # Comma-separated origins, or "*" for any (required for Vercel → Render)
    allowed_origins: str = "*"
    port: int = 8000

    # Ensemble weights — must sum to 1.0 (9-signal ensemble)
    weight_coverage: float = 0.18
    weight_novelty:  float = 0.20
    weight_reasoning: float = 0.18
    weight_anchor:   float = 0.10
    weight_mirror:   float = 0.10
    weight_reach:    float = 0.08
    weight_lean:     float = 0.03
    weight_specificity: float = 0.06
    weight_structure: float = 0.07

    # Novelty thresholds (cosine similarity to diff)
    novelty_red_threshold:   float = 0.72  # clearly mirrors diff
    novelty_green_threshold: float = 0.42  # novel content

    # Reach threshold (how well diff chunk is covered by description)
    reach_uncovered_threshold: float = 0.42

    # Sentence transformer model
    st_model: str = "paraphrase-MiniLM-L3-v2"


@lru_cache()
def get_settings() -> Settings:
    return Settings()

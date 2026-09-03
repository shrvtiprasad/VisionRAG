from pathlib import Path
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings with environment variable overrides."""

    # Project metadata
    PROJECT_NAME: str = "VisionRAG"
    VERSION: str = "0.1.0"
    API_V1_PREFIX: str = "/api"

    # Gemini LLM API Key (optional during dev; fallback used if absent)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.6-flash"

    # Qdrant Vector Store configuration
    # If QDRANT_PATH is provided, Qdrant runs in embedded local disk mode (No Docker needed!)
    # If QDRANT_URL is set instead (e.g. http://localhost:6333), it connects over HTTP.
    QDRANT_PATH: Optional[str] = str(Path(__file__).resolve().parent.parent.parent.parent / "qdrant_local_data")
    QDRANT_URL: Optional[str] = None
    QDRANT_COLLECTION: str = "coco_images"

    # CLIP Model Configuration (HuggingFace Transformers)
    CLIP_MODEL_NAME: str = "openai/clip-vit-base-patch32"

    # COCO image serving directory
    IMAGE_DIR: str = str(Path(__file__).resolve().parent.parent.parent.parent / "data" / "coco" / "val2017")

    # Search defaults
    DEFAULT_TOP_K: int = 12
    SCORE_THRESHOLD: float = 0.15

    # CORS Allowed Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

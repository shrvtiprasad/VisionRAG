from functools import lru_cache
from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.services.llm import LLMService


@lru_cache()
def get_embedding_service() -> EmbeddingService:
    service = EmbeddingService()
    service.load()
    return service


@lru_cache()
def get_vector_store_service() -> VectorStoreService:
    service = VectorStoreService()
    service.connect()
    return service


@lru_cache()
def get_llm_service() -> LLMService:
    return LLMService()

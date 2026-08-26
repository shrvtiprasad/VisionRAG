from fastapi import APIRouter, Depends
from app.core.deps import get_embedding_service, get_vector_store_service, get_llm_service
from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService
from app.services.llm import LLMService

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check(
    vector_store: VectorStoreService = Depends(get_vector_store_service),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    llm_service: LLMService = Depends(get_llm_service),
):
    """
    Health check verifying Qdrant storage status, CLIP model availability, and Gemini configuration.
    """
    qdrant_stats = vector_store.get_collection_stats()
    
    return {
        "status": "healthy",
        "clip_model": {
            "name": embedding_service.model_name,
            "device": embedding_service.device,
            "dimension": embedding_service.embedding_dim,
            "ready": embedding_service.model is not None,
        },
        "vector_store": qdrant_stats,
        "gemini_llm": {
            "model": llm_service.model_name,
            "api_key_configured": bool(llm_service.api_key),
        },
    }

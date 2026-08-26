import time
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.deps import get_embedding_service, get_vector_store_service
from app.schemas.search import SearchRequest, SearchResponse
from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService

router = APIRouter(tags=["Search"])


@router.post("/search", response_model=SearchResponse)
async def search_images(
    request: SearchRequest,
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStoreService = Depends(get_vector_store_service),
):
    """
    Search for semantically relevant images using a natural language query.
    1. Query -> CLIP text encoder -> 512d vector
    2. Vector -> Qdrant cosine similarity search -> Top-K COCO images with metadata
    """
    start_time = time.perf_counter()

    query_text = request.query.strip()
    if not query_text:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    top_k = request.top_k or settings.DEFAULT_TOP_K

    try:
        # 1. Encode query to vector
        query_vector = embedding_service.encode_text(query_text)

        # 2. Vector search in Qdrant
        results = vector_store.search_by_vector(
            vector=query_vector,
            top_k=top_k,
            score_threshold=settings.SCORE_THRESHOLD,
        )

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return SearchResponse(
            query=query_text,
            results=results,
            result_count=len(results),
            latency_ms=round(latency_ms, 2),
        )

    except Exception as e:
        print(f"[SearchRoute Error] {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

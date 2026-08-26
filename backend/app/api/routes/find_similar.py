import time
from fastapi import APIRouter, Depends, HTTPException
from app.core.config import settings
from app.core.deps import get_vector_store_service
from app.schemas.find_similar import FindSimilarRequest, FindSimilarResponse
from app.services.vector_store import VectorStoreService

router = APIRouter(tags=["Find Similar"])


@router.post("/find-similar", response_model=FindSimilarResponse)
async def find_similar_images(
    request: FindSimilarRequest,
    vector_store: VectorStoreService = Depends(get_vector_store_service),
):
    """
    Find images similar to an already indexed image ID.
    Uses stored vector ID directly in Qdrant recommend/lookup without re-encoding!
    """
    start_time = time.perf_counter()
    top_k = request.top_k or settings.DEFAULT_TOP_K

    try:
        results = vector_store.find_similar_by_id(
            image_id=request.image_id,
            top_k=top_k,
        )

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return FindSimilarResponse(
            source_image_id=request.image_id,
            results=results,
            result_count=len(results),
            latency_ms=round(latency_ms, 2),
        )

    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Image ID {request.image_id} not found in the indexed database.",
        )
    except Exception as e:
        print(f"[FindSimilarRoute Error] {e}")
        raise HTTPException(status_code=500, detail=f"Find-similar failed: {str(e)}")

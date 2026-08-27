import io
import time
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Path as APIPath, Query, UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.config import settings
from app.core.deps import get_embedding_service, get_vector_store_service
from app.schemas.find_similar import (
    FindSimilarRequest,
    FindSimilarResponse,
    ImageSearchResponse,
)
from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService

router = APIRouter(tags=["Find Similar"])

# Accepted MIME types for uploaded images
_ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
}


@router.post("/find-similar", response_model=ImageSearchResponse)
async def search_by_uploaded_image(
    image: UploadFile = File(..., description="Image file to search against the COCO index"),
    top_k: Optional[int] = Form(12, description="Number of similar images to return"),
    embedding_service: EmbeddingService = Depends(get_embedding_service),
    vector_store: VectorStoreService = Depends(get_vector_store_service),
):
    """
    Upload an arbitrary image and retrieve the most visually/semantically similar COCO images from Qdrant.

    Flow:
      1. Validate uploaded file is an image (content-type + PIL parse).
      2. Decode to RGB PIL image.
      3. Encode via the EXISTING CLIP image encoder → 512D normalized vector.
      4. Search the EXISTING Qdrant `coco_images` collection via cosine similarity.
      5. Return top-K results with image metadata and similarity scores.
    """
    start_time = time.perf_counter()

    num_top_k = top_k or settings.DEFAULT_TOP_K
    if num_top_k < 1 or num_top_k > 50:
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 50.")

    # ── 1. Content-type validation ──────────────────────────────────────────
    content_type = (image.content_type or "").lower()
    if content_type and content_type not in _ALLOWED_CONTENT_TYPES and not content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{content_type}'. "
                f"Please upload a JPEG, PNG, WebP, GIF, BMP, or TIFF image."
            ),
        )

    # ── 2. Read & decode image bytes ────────────────────────────────────────
    try:
        raw_bytes = await image.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {e}")

    if not raw_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image file is empty.")

    try:
        pil_image = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file could not be decoded as an image. Please upload a valid image.",
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decode error: {e}")

    # ── 3. Encode image with EXISTING CLIP model ────────────────────────────
    try:
        query_vector = embedding_service.encode_image(pil_image)
    except Exception as e:
        print(f"[SearchByImage] CLIP encode error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to encode image with CLIP: {e}")

    # ── 4. Cosine similarity search in EXISTING Qdrant collection ───────────
    try:
        results = vector_store.search_by_vector(
            vector=query_vector,
            top_k=num_top_k,
            score_threshold=0.0,  # return raw cosine similarity scores
        )
    except Exception as e:
        print(f"[SearchByImage] Qdrant search error: {e}")
        raise HTTPException(status_code=500, detail=f"Vector search failed: {e}")

    latency_ms = (time.perf_counter() - start_time) * 1000.0

    return ImageSearchResponse(
        results=results,
        result_count=len(results),
        latency_ms=round(latency_ms, 2),
    )

@router.post("/find-similar/{image_id}", response_model=FindSimilarResponse)
async def find_similar_by_id_endpoint(
    image_id: int = APIPath(..., description="COCO image ID of reference image"),
    vector_store: VectorStoreService = Depends(get_vector_store_service),
):
    """
    Find images similar to an already indexed image ID.
    Uses stored vector ID directly in Qdrant recommend/lookup without re-encoding!
    """
    start_time = time.perf_counter()
    ref_id = image_id
    top_k = settings.DEFAULT_TOP_K

    try:
        results = vector_store.find_similar_by_id(
            image_id=ref_id,
            top_k=top_k,
        )

        latency_ms = (time.perf_counter() - start_time) * 1000.0

        return FindSimilarResponse(
            source_image_id=ref_id,
            results=results,
            result_count=len(results),
            latency_ms=round(latency_ms, 2),
        )

    except KeyError:
        raise HTTPException(
            status_code=404,
            detail=f"Image ID {ref_id} not found in the indexed database.",
        )
    except Exception as e:
        print(f"[FindSimilarRoute Error] {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Find-similar failed: {str(e)}"
        )
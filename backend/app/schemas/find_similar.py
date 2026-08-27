from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.search import ImageResultItem


class FindSimilarRequest(BaseModel):
    image_id: int = Field(..., description="COCO image ID of the reference image already indexed")
    top_k: Optional[int] = Field(12, ge=1, le=50, description="Number of similar images to retrieve")


class FindSimilarResponse(BaseModel):
    source_image_id: int
    results: List[ImageResultItem]
    result_count: int
    latency_ms: float


class ImageSearchResponse(BaseModel):
    """Response for POST /api/search-by-image (uploaded image file)."""
    results: List[ImageResultItem]
    result_count: int
    latency_ms: float

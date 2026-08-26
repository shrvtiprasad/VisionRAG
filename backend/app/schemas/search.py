from typing import List, Optional
from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500, description="Natural language search query")
    top_k: Optional[int] = Field(12, ge=1, le=50, description="Number of top results to retrieve")


class ImageResultItem(BaseModel):
    image_id: int = Field(..., description="COCO image ID")
    file_name: str = Field(..., description="Image filename (e.g. 000000012345.jpg)")
    score: float = Field(..., description="Cosine similarity score")
    match_percentage: str = Field(..., description="Formatted similarity percentage for UI badge")
    captions: List[str] = Field(default_factory=list, description="COCO human-annotated captions")
    categories: List[str] = Field(default_factory=list, description="Detected object categories")
    image_url: str = Field(..., description="Relative or absolute URL to view the image")


class SearchResponse(BaseModel):
    query: str
    results: List[ImageResultItem]
    result_count: int
    latency_ms: float

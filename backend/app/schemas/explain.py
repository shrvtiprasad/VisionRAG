from typing import List
from pydantic import BaseModel, Field
from app.schemas.search import ImageResultItem


class ExplainRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Original user query that produced these results")
    results: List[ImageResultItem] = Field(..., min_length=1, max_length=20, description="Top retrieved image items")


class ExplainResponse(BaseModel):
    query: str
    explanation: str = Field(..., description="LLM synthesized explanation grounded strictly on retrieved context")
    model: str = Field(..., description="LLM model name used")
    cached: bool = False

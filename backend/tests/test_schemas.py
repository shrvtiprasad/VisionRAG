# pyrefly: ignore [missing-import]
import pytest
from app.schemas.search import SearchRequest, SearchResponse, ImageResultItem
from app.schemas.find_similar import FindSimilarRequest, FindSimilarResponse
from app.schemas.explain import ExplainRequest, ExplainResponse


def test_search_request_valid():
    req = SearchRequest(query="a dog running on grass", top_k=10)
    assert req.query == "a dog running on grass"
    assert req.top_k == 10


def test_image_result_item_formatting():
    item = ImageResultItem(
        image_id=101,
        file_name="000000000101.jpg",
        score=0.2856,
        match_percentage="28.6%",
        captions=["A brown dog playing outside"],
        categories=["dog"],
        image_url="/images/000000000101.jpg",
    )
    assert item.image_id == 101
    assert item.match_percentage == "28.6%"
    assert item.captions[0] == "A brown dog playing outside"


def test_find_similar_request():
    req = FindSimilarRequest(image_id=12345, top_k=5)
    assert req.image_id == 12345
    assert req.top_k == 5


def test_explain_request():
    item = ImageResultItem(
        image_id=101,
        file_name="000000000101.jpg",
        score=0.28,
        match_percentage="28.0%",
        captions=["A cyclist on the street"],
        categories=["person", "bicycle"],
        image_url="/images/000000000101.jpg",
    )
    req = ExplainRequest(query="bicycle ride", results=[item])
    assert req.query == "bicycle ride"
    assert len(req.results) == 1

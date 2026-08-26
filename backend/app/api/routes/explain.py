from fastapi import APIRouter, Depends, HTTPException
from app.core.deps import get_llm_service
from app.schemas.explain import ExplainRequest, ExplainResponse
from app.services.llm import LLMService

router = APIRouter(tags=["RAG Explanation"])


@router.post("/explain", response_model=ExplainResponse)
async def explain_results(
    request: ExplainRequest,
    llm_service: LLMService = Depends(get_llm_service),
):
    """
    RAG generation step:
    Pass retrieved image metadata/captions as grounded context to Gemini LLM
    to generate an explanation of why the visual results answer the query.
    """
    try:
        explanation = llm_service.explain(
            query=request.query,
            results=request.results,
        )

        return ExplainResponse(
            query=request.query,
            explanation=explanation,
            model=llm_service.model_name,
            cached=False,
        )

    except Exception as e:
        print(f"[ExplainRoute Error] {e}")
        raise HTTPException(status_code=500, detail=f"Explanation generation failed: {str(e)}")

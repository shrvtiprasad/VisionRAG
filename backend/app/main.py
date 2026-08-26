from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.deps import get_embedding_service, get_vector_store_service, get_llm_service
from app.api.routes import health, search, find_similar, explain


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup & shutdown lifespan events.
    Preloads CLIP model into memory and ensures Qdrant collection is ready.
    """
    print(f"==================================================")
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"==================================================")

    # 1. Preload CLIP model
    emb_service = get_embedding_service()
    
    # 2. Connect to Vector Store & ensure collection exists
    vec_service = get_vector_store_service()
    vec_service.ensure_collection(vector_dim=emb_service.embedding_dim)

    # 3. Ensure images directory exists
    img_path = Path(settings.IMAGE_DIR).resolve()
    img_path.mkdir(parents=True, exist_ok=True)
    print(f"[Main] Serving local COCO images from: {img_path}")

    # 4. Check LLM service readiness
    llm_service = get_llm_service()
    if llm_service.api_key:
        print("[Main] Gemini API is configured for AI explanation generation.")
    else:
        print("[Main] Note: GEMINI_API_KEY not provided. Fallback grounded explanation will be used.")

    yield
    print(f"Shutting down {settings.PROJECT_NAME}...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Semantic Image Search & RAG System with CLIP, Qdrant & Gemini",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local COCO images as static files
images_dir = Path(settings.IMAGE_DIR).resolve()
images_dir.mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=str(images_dir)), name="images")

# Register API routes under /api
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(search.router, prefix=settings.API_V1_PREFIX)
app.include_router(find_similar.router, prefix=settings.API_V1_PREFIX)
app.include_router(explain.router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_PREFIX}/health",
    }

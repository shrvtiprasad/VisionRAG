# VisionRAG — Multimodal Semantic Image Search & RAG

VisionRAG is a multimodal semantic image-search and Retrieval-Augmented Generation (RAG) system. It enables users to search an indexed corpus of the **COCO dataset** using natural language queries, retrieves semantically relevant images via **CLIP embeddings** and **Qdrant vector similarity**, and synthesizes grounded visual explanations using **Google Gemini**.

---

## 🌟 Architecture & Pipeline

```
User Query (Natural Language)
       │
       ▼
CLIP Text Encoder (openai/clip-vit-base-patch32)
       │
       ▼ (512-dim normalized vector)
Qdrant Vector Database (Cosine Similarity ANN Search)
       │
       ▼ (Top-K Matches + Metadata + Captions + Categories)
FastAPI Backend
       │
       ▼ (Structured Grounding Context)
Google Gemini LLM (gemini-1.5-flash)
       │
       ▼ (Synthesized Explanation of Relevance)
React 18 UI (Vite + Tailwind CSS)
```

### Why VisionRAG is a true RAG system:
- **Retrieval:** CLIP + Qdrant retrieve relevant images and their human-annotated COCO captions and category tags.
- **Augmentation:** Retrieved evidence is formatted into a structured context prompt.
- **Generation:** Gemini synthesizes a concise, grounded explanation strictly based on the retrieved context (no hallucinations of images not in context).

---

## 🚀 Quick Start (Zero Docker Required!)

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

---

### 2. Backend Setup

```bash
cd backend

# Create and activate Python virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install PyTorch (CPU or CUDA):
# CPU:
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
# GPU (if CUDA available):
# pip install torch torchvision

# Install dependencies
pip install -e .

# Copy environment variables
cp .env.example .env
```

*(Edit `.env` if you want to add your `GEMINI_API_KEY`. If left empty, search still works with intelligent fallback explanations!)*

---

### 3. Download & Ingest COCO Dataset (Quick-Start: 500 images)

From the root directory:

```bash
# 1. Download 500 COCO validation images + captions (takes ~30 seconds)
python scripts/download_coco.py --limit 500

# 2. Ingest & Index into Qdrant (local disk storage, no Docker needed!)
python scripts/ingest.py --limit 500 --batch-size 32
```

---

### 4. Run the Application

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
*Interactive API docs available at: `http://localhost:8000/docs`*

**Terminal 2 — Frontend (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser!*

---

## 📊 Evaluation & Quality Benchmark

Run the retrieval benchmark to verify semantic accuracy and latency across a suite of natural language queries:

```bash
python scripts/eval.py
```

---

## 🛠️ Tech Stack & Key Choices

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, JavaScript, Tailwind CSS, Vite | Clean UI faithfully recreating Lumina Dark Semantic design tokens |
| **Backend** | Python 3.11, FastAPI, Pydantic | High-performance asynchronous API layer with auto-generated OpenAPI docs |
| **Embeddings** | Hugging Face Transformers (`CLIPModel`) | Unified 512-dimensional joint text-image embedding space |
| **Vector DB** | Qdrant (`qdrant-client`) | Local on-disk embedded vector store (no Docker required) |
| **LLM** | Google Gemini API (`gemini-1.5-flash`) | Context-grounded RAG explanation synthesis |
| **Dataset** | COCO 2017 Validation Set | 5,000 diverse images with human captions and category instances |

---

## 📁 Repository Structure

```
VisionRAG/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/routes/       # /search, /find-similar, /explain, /health
│   │   ├── core/             # Configuration & dependency injection
│   │   ├── schemas/          # Pydantic request/response models
│   │   ├── services/         # CLIP embedding, Qdrant store, Gemini LLM
│   │   └── main.py           # Application entrypoint & static image mount
│   ├── tests/                # Unit & integration tests
│   └── pyproject.toml        # Backend dependencies
│
├── frontend/                 # React SPA (Vite + Tailwind)
│   ├── src/
│   │   ├── components/       # NavBar, SearchBar, ResultsGrid, ImageCard, AIExplainPanel
│   │   ├── hooks/            # useSearch custom hook
│   │   └── api/client.js     # Typed fetch client
│   ├── tailwind.config.js    # Lumina design tokens
│   └── package.json
│
├── scripts/                  # Offline Pipelines (Reproducible)
│   ├── download_coco.py      # Automated COCO dataset downloader
│   ├── ingest.py             # Batch CLIP embedding & Qdrant indexing
│   └── eval.py               # Retrieval quality and latency benchmark
│
├── data/                     # Local COCO dataset (Gitignored)
├── qdrant_local_data/        # Local vector index (Gitignored, no Docker needed)
├── docker-compose.yml        # (Optional) Docker setup if preferred
└── README.md
```

---

## 📄 License
MIT

# VisionRAG — Free Deployment Guide

This guide provides step-by-step instructions to deploy **VisionRAG** on **100% FREE** hosting infrastructure without paid servers or complex database setups.

---

## 🚀 Recommended Option: Hugging Face Spaces (Fastest & 100% Free)

[Hugging Face Spaces](https://huggingface.co/spaces) offers **16 GB RAM, 2 vCPUs, and 50 GB storage for FREE** on Docker spaces. This is ideal for PyTorch + CLIP model inference and local Qdrant vector database storage.

### Step 1: Create a Hugging Face Space
1. Sign up / Log in to [Hugging Face](https://huggingface.co/).
2. Click **New Space** (or go to `huggingface.co/new-space`).
3. Set Space Name: `visionrag` (or your choice).
4. Select SDK: **Docker** (Blank).
5. Choose Hardware: **CPU Basic (Free - 16 GB RAM)**.
6. Set Space Visibility: **Public**.

### Step 2: Push VisionRAG Code to Hugging Face
Clone your Space repository locally or push your existing git repo:

```bash
# Add Hugging Face Space as a git remote
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME

# Push code to Hugging Face
git push hf main
```

### Step 3: Configure Environment Variables (Secrets)
In your Hugging Face Space settings:
- Go to **Settings** -> **Variables and secrets**.
- Add a Secret:
  - Key: `GEMINI_API_KEY`
  - Value: `your_gemini_api_key`

Your Space will automatically build the Docker image, bundle the React frontend, start FastAPI, load the CLIP model into memory, and go live!

---

## ⚡ Option 2: Render (Backend) + Vercel (Frontend)

If you prefer separate services for frontend and backend:

### Backend Deployment on Render (Free Web Service)
1. Sign up at [Render.com](https://render.com/).
2. Create a **New Web Service**.
3. Connect your GitHub repository.
4. Settings:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: `your_key`
   - `QDRANT_PATH`: `/opt/render/project/src/qdrant_local_data`
   - `IMAGE_DIR`: `/opt/render/project/src/data/coco/val2017`

### Frontend Deployment on Vercel (Free)
1. Sign up at [Vercel.com](https://vercel.com/).
2. Import your Git repo and select the `frontend` directory.
3. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-render-backend-url.onrender.com/api`
4. Click **Deploy**.

---

## 🛠 Local Verification Command

To verify the unified production build locally before deploying:

```bash
# 1. Build frontend
cd frontend
npm run build
cd ..

# 2. Run backend (will automatically serve static frontend at http://localhost:8000)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000` in your browser to experience the full app served by FastAPI!

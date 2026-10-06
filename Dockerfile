# VisionRAG Production Dockerfile
# Builds React frontend and packages FastAPI backend + PyTorch CLIP + embedded Qdrant

# Stage 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Python Backend Runtime
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy backend dependencies
COPY backend/requirements.txt ./backend/requirements.txt

# Install CPU PyTorch and Python packages
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application files
COPY backend ./backend
COPY data ./data
COPY qdrant_local_data ./qdrant_local_data
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port 7860 (HuggingFace Spaces default) or 8000
EXPOSE 7860

# Environment variables
ENV PYTHONPATH=/app/backend
ENV QDRANT_PATH=/app/qdrant_local_data
ENV IMAGE_DIR=/app/data/coco/val2017
ENV PORT=7860

# Command to run FastAPI server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860}"]

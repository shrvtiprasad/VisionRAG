# VisionRAG

A multimodal RAG system for semantic image search.

## Overview

VisionRAG allows users to search an image dataset using natural-language queries. The system uses image-text embeddings to retrieve relevant images and an LLM to generate context-aware responses.

## Tech Stack

- Python
- FastAPI
- CLIP
- Qdrant
- Gemini
- React

## Pipeline

Ingestion:
Dataset → CLIP Embeddings → Qdrant

Retrieval:
User Query → CLIP → Qdrant → Relevant Images

Generation:
Retrieved Context → Gemini → Final Response

"""
COCO Image Ingestion and Indexing Pipeline.
Reads COCO images, extracts human captions and category annotations,
generates 512-dimensional CLIP visual embeddings, and indexes them into Qdrant.
"""

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Dict, List
from PIL import Image
from tqdm import tqdm
from qdrant_client.http import models as rest_models

# Add backend to sys.path so we can import services cleanly
project_root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(project_root / "backend"))

from app.core.config import settings
from app.services.embedding import EmbeddingService
from app.services.vector_store import VectorStoreService


def load_coco_metadata(data_dir: Path) -> tuple[Dict[int, List[str]], Dict[int, List[str]], Dict[int, str]]:
    """
    Parse COCO captions and instances JSON files.
    Returns:
      captions_by_id: { image_id: [caption1, caption2, ...] }
      categories_by_id: { image_id: [cat1, cat2, ...] }
      filenames_by_id: { image_id: "000000012345.jpg" }
    """
    annotations_dir = data_dir / "annotations"
    captions_file = annotations_dir / "captions_val2017.json"
    instances_file = annotations_dir / "instances_val2017.json"

    captions_by_id: Dict[int, List[str]] = {}
    filenames_by_id: Dict[int, str] = {}
    categories_by_id: Dict[int, List[str]] = {}

    # 1. Parse captions
    if captions_file.exists():
        print(f"[Ingest] Loading captions from {captions_file.name}...")
        with open(captions_file, "r", encoding="utf-8") as f:
            cap_data = json.load(f)

        for img in cap_data.get("images", []):
            filenames_by_id[img["id"]] = img["file_name"]

        for ann in cap_data.get("annotations", []):
            img_id = ann["image_id"]
            if img_id not in captions_by_id:
                captions_by_id[img_id] = []
            captions_by_id[img_id].append(ann["caption"].strip())
    else:
        print(f"[Warning] {captions_file} not found. Captions will be empty.")

    # 2. Parse category names
    if instances_file.exists():
        print(f"[Ingest] Loading category instances from {instances_file.name}...")
        with open(instances_file, "r", encoding="utf-8") as f:
            inst_data = json.load(f)

        cat_id_to_name = {c["id"]: c["name"] for c in inst_data.get("categories", [])}

        for ann in inst_data.get("annotations", []):
            img_id = ann["image_id"]
            cat_name = cat_id_to_name.get(ann["category_id"])
            if cat_name:
                if img_id not in categories_by_id:
                    categories_by_id[img_id] = []
                if cat_name not in categories_by_id[img_id]:
                    categories_by_id[img_id].append(cat_name)

    return captions_by_id, categories_by_id, filenames_by_id


def run_ingestion(data_dir: Path, limit: int = 500, batch_size: int = 32):
    """
    Main ingestion execution:
    1. Initialize CLIP model and Qdrant collection
    2. Read images and generate visual embeddings in batches
    3. Upsert into Qdrant with rich payload metadata
    """
    images_dir = data_dir / "val2017"
    if not images_dir.exists():
        print(f"[Error] Images directory '{images_dir}' not found. Run download_coco.py first.")
        return

    # 1. Initialize services
    print("==================================================")
    print(" VisionRAG — COCO Ingestion & Indexing Pipeline")
    print("==================================================")
    
    embedding_service = EmbeddingService()
    embedding_service.load()

    vector_store = VectorStoreService()
    vector_store.ensure_collection(vector_dim=embedding_service.embedding_dim)

    # 2. Load metadata mappings
    captions_by_id, categories_by_id, filenames_by_id = load_coco_metadata(data_dir)

    # Invert filenames_by_id for easy lookup by filename
    id_by_filename = {v: k for k, v in filenames_by_id.items()}

    # 3. Find image files present on disk
    image_files = sorted(list(images_dir.glob("*.jpg")) + list(images_dir.glob("*.png")))
    if not image_files:
        print(f"[Error] No images found in {images_dir}.")
        return

    # Apply limit
    if limit and limit > 0:
        image_files = image_files[:limit]

    print(f"[Ingest] Preparing to embed and index {len(image_files)} images (batch_size={batch_size})...")

    # 4. Batch processing loop
    total_indexed = 0
    num_batches = (len(image_files) + batch_size - 1) // batch_size

    for b in tqdm(range(num_batches), desc="Indexing batches"):
        batch_paths = image_files[b * batch_size : (b + 1) * batch_size]
        batch_images = []
        batch_metadata = []

        for p in batch_paths:
            try:
                img = Image.open(p).convert("RGB")
                batch_images.append(img)

                # Identify image ID
                img_id = id_by_filename.get(p.name)
                if img_id is None:
                    # Parse image ID from standard COCO filename format: 000000012345.jpg -> 12345
                    stem = p.stem.lstrip("0")
                    img_id = int(stem) if stem else 0

                batch_metadata.append({
                    "id": img_id,
                    "file_name": p.name,
                    "local_path": str(p.relative_to(project_root)),
                    "captions": captions_by_id.get(img_id, []),
                    "categories": categories_by_id.get(img_id, []),
                })
            except Exception as e:
                print(f"\n[Warning] Failed to load image {p.name}: {e}")

        if not batch_images:
            continue

        # Generate embeddings in batch
        vectors = embedding_service.encode_images_batch(batch_images)

        # Prepare Qdrant PointStructs
        points = []
        for i, meta in enumerate(batch_metadata):
            points.append(
                rest_models.PointStruct(
                    id=meta["id"],
                    vector=vectors[i],
                    payload={
                        "image_id": meta["id"],
                        "file_name": meta["file_name"],
                        "captions": meta["captions"],
                        "categories": meta["categories"],
                    },
                )
            )

        # Upsert into Qdrant
        vector_store.client.upsert(
            collection_name=vector_store.collection_name,
            points=points,
        )
        total_indexed += len(points)

    print("\n==================================================")
    print(f" [Success] Indexed {total_indexed} images into Qdrant '{vector_store.collection_name}' collection!")
    stats = vector_store.get_collection_stats()
    print(f" Collection status: {stats}")
    print("==================================================")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest COCO images and index into Qdrant")
    parser.add_argument("--limit", type=int, default=500, help="Max images to index (default: 500)")
    parser.add_argument("--batch-size", type=int, default=32, help="CLIP inference batch size (default: 32)")
    parser.add_argument("--data-dir", type=str, default=None, help="COCO data directory (defaults to ../data/coco)")
    args = parser.parse_args()

    target_data_dir = Path(args.data_dir) if args.data_dir else (project_root / "data" / "coco")
    run_ingestion(data_dir=target_data_dir, limit=args.limit, batch_size=args.batch_size)

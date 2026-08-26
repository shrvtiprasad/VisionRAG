from pathlib import Path
from typing import Any, Dict, List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as rest_models

from app.core.config import settings
from app.schemas.search import ImageResultItem


class VectorStoreService:
    """
    Qdrant Vector Database Service.
    Supports both local embedded storage and remote HTTP Qdrant.
    """

    def __init__(
        self,
        url: Optional[str] = settings.QDRANT_URL,
        path: Optional[str] = settings.QDRANT_PATH,
        collection_name: str = settings.QDRANT_COLLECTION,
    ):
        self.collection_name = collection_name
        self.url = url
        self.path = path
        self.client: Optional[QdrantClient] = None

    def connect(self):
        """Initialize connection to Qdrant (local disk or remote)."""
        if self.client is not None:
            return

        if self.url:
            print(
                f"[VectorStore] Connecting to remote Qdrant at {self.url}..."
            )
            self.client = QdrantClient(url=self.url)
        else:
            local_path = Path(
                self.path or "./qdrant_local_data"
            ).resolve()
            local_path.mkdir(parents=True, exist_ok=True)

            print(
                f"[VectorStore] Initializing local embedded Qdrant "
                f"at '{local_path}' (No Docker required)..."
            )

            self.client = QdrantClient(path=str(local_path))

    def ensure_collection(self, vector_dim: int = 512):
        """Create the collection with Cosine distance if needed."""
        self.connect()

        collections = self.client.get_collections().collections
        exists = any(
            c.name == self.collection_name
            for c in collections
        )

        if not exists:
            print(
                f"[VectorStore] Creating collection "
                f"'{self.collection_name}' "
                f"(dim={vector_dim}, metric=COSINE)..."
            )

            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=rest_models.VectorParams(
                    size=vector_dim,
                    distance=rest_models.Distance.COSINE,
                ),
            )
        else:
            print(
                f"[VectorStore] Collection "
                f"'{self.collection_name}' already exists."
            )

    def search_by_vector(
        self,
        vector: List[float],
        top_k: int = 12,
        score_threshold: float = 0.0,
    ) -> List[ImageResultItem]:
        """
        Perform cosine similarity nearest-neighbor search
        with a query vector.
        """

        self.connect()

        # Qdrant newer versions use query_points()
        search_results = self.client.query_points(
            collection_name=self.collection_name,
            query=vector,
            limit=top_k,
            score_threshold=(
                score_threshold
                if score_threshold > 0
                else None
            ),
            with_payload=True,
        )

        # query_points() returns an object containing points
        hits = search_results.points

        items: List[ImageResultItem] = []

        for hit in hits:
            payload = hit.payload or {}

            file_name = payload.get(
                "file_name",
                f"{hit.id}.jpg"
            )

            raw_score = float(hit.score)

            percentage = min(
                100.0,
                max(0.0, raw_score * 100.0)
            )

            items.append(
                ImageResultItem(
                    image_id=int(hit.id),
                    file_name=file_name,
                    score=round(raw_score, 4),
                    match_percentage=f"{percentage:.1f}%",
                    captions=payload.get("captions", []),
                    categories=payload.get("categories", []),
                    image_url=f"/images/{file_name}",
                )
            )

        return items

    def find_similar_by_id(
        self,
        image_id: int,
        top_k: int = 12,
    ) -> List[ImageResultItem]:
        """
        Find images similar to an already indexed image.
        Uses Qdrant's recommend API.
        """

        self.connect()

        points = self.client.retrieve(
            collection_name=self.collection_name,
            ids=[image_id],
            with_vectors=True,
        )

        if not points:
            raise KeyError(
                f"Image ID {image_id} not found in index."
            )

        results = self.client.recommend(
            collection_name=self.collection_name,
            positive=[image_id],
            limit=top_k,
        )

        items: List[ImageResultItem] = []

        for hit in results:
            if hit.id == image_id:
                continue

            payload = hit.payload or {}

            file_name = payload.get(
                "file_name",
                f"{hit.id}.jpg"
            )

            raw_score = float(hit.score)

            percentage = min(
                100.0,
                max(0.0, raw_score * 100.0)
            )

            items.append(
                ImageResultItem(
                    image_id=int(hit.id),
                    file_name=file_name,
                    score=round(raw_score, 4),
                    match_percentage=f"{percentage:.1f}%",
                    captions=payload.get("captions", []),
                    categories=payload.get("categories", []),
                    image_url=f"/images/{file_name}",
                )
            )

        return items

    def get_collection_stats(
        self
    ) -> Dict[str, Any]:
        """Get collection metrics for health check."""

        self.connect()

        try:
            info = self.client.get_collection(
                self.collection_name
            )

            return {
                "collection_name": self.collection_name,
                "vectors_count": info.points_count,
                "status": info.status,
            }

        except Exception as e:
            return {
                "collection_name": self.collection_name,
                "error": str(e),
                "vectors_count": 0,
            }
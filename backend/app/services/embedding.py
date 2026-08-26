from typing import List
from PIL import Image
import torch
from transformers import CLIPModel, CLIPProcessor
from app.core.config import settings


class EmbeddingService:
    """
    CLIP-based Multimodal Embedding Service.

    Uses Hugging Face CLIP to generate 512-dimensional embeddings
    for both text queries and images.
    """

    def __init__(self, model_name: str = settings.CLIP_MODEL_NAME):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_name = model_name
        self.model = None
        self.processor = None
        self._dim = 512

    def load(self):
        """Load CLIP model and processor."""
        if self.model is None:
            print(
                f"[EmbeddingService] Loading CLIP model "
                f"'{self.model_name}' onto device '{self.device}'..."
            )

            self.processor = CLIPProcessor.from_pretrained(self.model_name)
            self.model = CLIPModel.from_pretrained(self.model_name).to(self.device)
            self.model.eval()

            self._dim = self.model.projection_dim

            print(
                f"[EmbeddingService] CLIP model loaded successfully. "
                f"Embedding dimension: {self._dim}"
            )

    @property
    def embedding_dim(self) -> int:
        return self._dim

    @torch.no_grad()
    def encode_text(self, text: str) -> List[float]:
        """Encode a single text query into a normalized 512D vector."""
        if self.model is None:
            self.load()

        inputs = self.processor(
            text=[text],
            return_tensors="pt",
            padding=True,
            truncation=True
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        text_features = self.model.get_text_features(**inputs)

        if hasattr(text_features, "pooler_output"):
            text_features = text_features.pooler_output

        text_features = text_features / text_features.norm(
            p=2,
            dim=-1,
            keepdim=True
        )

        return text_features[0].cpu().tolist()

    @torch.no_grad()
    def encode_texts_batch(
        self,
        texts: List[str]
    ) -> List[List[float]]:
        """Batch encode text queries."""
        if self.model is None:
            self.load()

        inputs = self.processor(
            text=texts,
            return_tensors="pt",
            padding=True,
            truncation=True
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        text_features = self.model.get_text_features(**inputs)

        if hasattr(text_features, "pooler_output"):
            text_features = text_features.pooler_output

        text_features = text_features / text_features.norm(
            p=2,
            dim=-1,
            keepdim=True
        )

        return text_features.cpu().tolist()

    @torch.no_grad()
    def encode_image(
        self,
        image: Image.Image
    ) -> List[float]:
        """Encode a single PIL image into a normalized 512D vector."""
        if self.model is None:
            self.load()

        inputs = self.processor(
            images=image,
            return_tensors="pt"
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        image_features = self.model.get_image_features(**inputs)

        if hasattr(image_features, "pooler_output"):
            image_features = image_features.pooler_output

        image_features = image_features / image_features.norm(
            p=2,
            dim=-1,
            keepdim=True
        )

        return image_features[0].cpu().tolist()

    @torch.no_grad()
    def encode_images_batch(
        self,
        images: List[Image.Image]
    ) -> List[List[float]]:
        """Batch encode PIL images."""
        if self.model is None:
            self.load()

        inputs = self.processor(
            images=images,
            return_tensors="pt"
        )

        inputs = {k: v.to(self.device) for k, v in inputs.items()}

        image_features = self.model.get_image_features(**inputs)

        if hasattr(image_features, "pooler_output"):
            image_features = image_features.pooler_output

        image_features = image_features / image_features.norm(
            p=2,
            dim=-1,
            keepdim=True
        )

        return image_features.cpu().tolist()
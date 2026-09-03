import os
from typing import List, Optional
from app.core.config import settings
from app.schemas.search import ImageResultItem


class LLMService:
    """
    RAG Generation Service powered by Gemini API using Google's google-genai SDK.
    Synthesizes retrieved visual metadata (COCO captions, objects, similarity scores)
    into a concise, grounded explanation of why the results match the query.
    """

    def __init__(self, api_key: Optional[str] = settings.GEMINI_API_KEY, model_name: str = settings.GEMINI_MODEL):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_name = model_name
        self._client = None
        self._initialized = False

    def _init_gemini(self):
        if self._initialized:
            return
        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
                print(f"[LLMService] Gemini client initialized with model '{self.model_name}'.")
            except Exception as e:
                print(f"[LLMService] Failed to initialize Gemini API client: {e}")
                self._client = None
        else:
            print("[LLMService] No GEMINI_API_KEY provided. Operating in fallback explanation mode.")
        self._initialized = True

    def explain(self, query: str, results: List[ImageResultItem]) -> str:
        """
        Generate a grounded explanation based on retrieved COCO captions and objects.
        Supports both natural language queries and image-to-image similarity queries.
        """
        self._init_gemini()

        if not results:
            return f"No visual matches found for '{query}'. Try broader terms or keywords from other concepts."

        # Format retrieved evidence
        context_lines = []
        for i, item in enumerate(results[:5], 1):
            captions_str = " | ".join(item.captions[:2]) if item.captions else "No caption available"
            cats_str = ", ".join(item.categories[:4]) if item.categories else "general scenery"
            context_lines.append(f"• Image {i} (Match: {item.match_percentage}): Categories [{cats_str}]. Captions: \"{captions_str}\"")

        context_block = "\n".join(context_lines)

        # If Gemini client is active, prompt the model
        if self._client:
            prompt = f"""You are VisionRAG's semantic visual assistant.
A user searched for: "{query}"

The vector search engine retrieved the following top images from the COCO dataset based on CLIP multimodal embeddings:

{context_block}

Task:
In 2 to 3 concise, insightful sentences, explain why these retrieved images are semantically relevant to the search context "{query}".
Highlight the key visual concepts, subjects, or contexts that connect the search context to the retrieved imagery.
Do not invent any facts not present in the captions or categories provided. Be direct, clear, and professional.
"""
            try:
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[LLMService] Gemini API call error: {e}")
                # Fallback to smart template synthesis

        # Deterministic grounded fallback synthesis (used when API key is not set or API error occurs)
        top_categories = set()
        for item in results[:4]:
            top_categories.update(item.categories)

        cats_summary = ", ".join(list(top_categories)[:4]) if top_categories else "matching visual elements"
        top_caption = results[0].captions[0] if results[0].captions else "matching scene composition"

        return (
            f"The retrieved images closely align with '{query}' through shared visual semantics around {cats_summary}. "
            f"The highest-confidence match reflects '{top_caption}', capturing the core subjects and environmental context described in your query."
        )

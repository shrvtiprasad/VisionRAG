/**
 * VisionRAG API Client.
 * Handles HTTP requests to the FastAPI backend.
 */

const API_BASE = '/api';

/**
 * Execute semantic image search using a text query.
 * @param {string} query - Natural language search query
 * @param {number} topK - Max results to retrieve (default: 12)
 * @returns {Promise<{query: string, results: Array, result_count: number, latency_ms: number}>}
 */
export async function searchImages(query, topK = 12) {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, top_k: topK }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Search request failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Find images similar to an existing indexed image ID.
 * @param {number} imageId - Reference COCO image ID
 * @param {number} topK - Max results to retrieve (default: 12)
 * @returns {Promise<{source_image_id: number, results: Array, result_count: number, latency_ms: number}>}
 */
export async function findSimilarImages(imageId, topK = 12) {
  const res = await fetch(`${API_BASE}/find-similar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image_id: imageId, top_k: topK }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Find-similar failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Request an LLM-synthesized RAG explanation for retrieved results.
 * @param {string} query - Original user query
 * @param {Array} results - Top retrieved image result objects
 * @returns {Promise<{query: string, explanation: string, model: string}>}
 */
export async function getExplanation(query, results) {
  const res = await fetch(`${API_BASE}/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, results }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Explanation generation failed with status ${res.status}`);
  }

  return await res.json();
}

/**
 * Search for visually similar images by uploading an arbitrary image file.
 * Uses CLIP image encoder → Qdrant cosine similarity on the coco_images collection.
 * @param {File} file - Image file to search with
 * @param {number} topK - Max results to retrieve (default: 12)
 * @returns {Promise<{results: Array, result_count: number, latency_ms: number}>}
 */
export async function searchByImage(file, topK = 12) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('top_k', topK);

  const res = await fetch(`${API_BASE}/find-similar`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Image search failed with status ${res.status}`
    );
  }

  return await res.json();
}

/**
 * Check backend health status.
 * @returns {Promise<Object>}
 */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return await res.json();
}

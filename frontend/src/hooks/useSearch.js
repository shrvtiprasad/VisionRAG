import { useState, useCallback, useEffect } from 'react';
import { searchImages, findSimilarImages, getExplanation, searchByImage } from '../api/client';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [latencyMs, setLatencyMs] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // RAG Explanation State
  const [explanation, setExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationError, setExplanationError] = useState(null);

  // Active mode indicator: 'text' | 'find-similar' | 'image'
  const [searchMode, setSearchMode] = useState('text');
  const [referenceImageId, setReferenceImageId] = useState(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Revoke previous object URL when imageFile changes to avoid memory leaks
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

  /**
   * Search via natural language query
   */
  const executeSearch = useCallback(async (queryText) => {
    const trimmed = (queryText || query).trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setIsSearching(true);
    setSearchError(null);
    setExplanation('');
    setExplanationError(null);
    setSearchMode('text');
    setReferenceImageId(null);
    setImageFile(null);

    try {
      // 1. Fetch search results from CLIP + Qdrant
      const data = await searchImages(trimmed);
      setResults(data.results || []);
      setLatencyMs(data.latency_ms);
      setIsSearching(false);

      // 2. If results found, trigger Gemini RAG explanation asynchronously
      if (data.results && data.results.length > 0) {
        setIsExplaining(true);
        getExplanation(trimmed, data.results)
          .then((expData) => {
            setExplanation(expData.explanation);
          })
          .catch((err) => {
            console.warn('[RAG Explanation Error]', err);
            setExplanationError(err.message);
          })
          .finally(() => {
            setIsExplaining(false);
          });
      }
    } catch (err) {
      console.error('[Search Error]', err);
      setSearchError(err.message || 'Failed to search images.');
      setIsSearching(false);
      setResults([]);
    }
  }, [query]);

  /**
   * Find similar images using an indexed image's vector ID
   */
  const executeFindSimilar = useCallback(async (imageId) => {
    if (!imageId) return;

    setIsSearching(true);
    setSearchError(null);
    setExplanation('');
    setSearchMode('find-similar');
    setReferenceImageId(imageId);
    setImageFile(null);

    try {
      const data = await findSimilarImages(imageId);
      setResults(data.results || []);
      setLatencyMs(data.latency_ms);
      setIsSearching(false);

      // Trigger explanation for visual similarity
      if (data.results && data.results.length > 0) {
        setIsExplaining(true);
        getExplanation(`Visual similarity to Image #${imageId}`, data.results)
          .then((expData) => {
            setExplanation(expData.explanation);
          })
          .catch((err) => {
            console.warn('[RAG Explanation Error]', err);
          })
          .finally(() => {
            setIsExplaining(false);
          });
      }
    } catch (err) {
      console.error('[Find Similar Error]', err);
      setSearchError(err.message || `Failed to find similar images for #${imageId}`);
      setIsSearching(false);
    }
  }, []);

  /**
   * Search by uploading an arbitrary image file.
   * Encodes via CLIP image encoder → Qdrant cosine similarity.
   * @param {File} file - Image file selected by the user
   */
  const executeImageSearch = useCallback(async (file) => {
    if (!file) return;

    const imageLabel = file.name ? `Uploaded Image (${file.name})` : 'Uploaded Image';
    setImageFile(file);
    setIsSearching(true);
    setSearchError(null);
    setExplanation('');
    setExplanationError(null);
    setSearchMode('image');
    setQuery(imageLabel);
    setReferenceImageId(null);

    try {
      const data = await searchByImage(file);
      setResults(data.results || []);
      setLatencyMs(data.latency_ms);
      setIsSearching(false);

      // Trigger Gemini RAG explanation for uploaded image search
      if (data.results && data.results.length > 0) {
        setIsExplaining(true);
        getExplanation(imageLabel, data.results)
          .then((expData) => {
            setExplanation(expData.explanation);
          })
          .catch((err) => {
            console.warn('[RAG Explanation Error]', err);
            setExplanationError(err.message || 'Failed to generate explanation.');
          })
          .finally(() => {
            setIsExplaining(false);
          });
      }
    } catch (err) {
      console.error('[Image Search Error]', err);
      setSearchError(err.message || 'Failed to search by image.');
      setIsSearching(false);
      setResults([]);
    }
  }, []);

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setExplanation('');
    setSearchError(null);
    setLatencyMs(null);
    setSearchMode('text');
    setReferenceImageId(null);
    setImageFile(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    latencyMs,
    isSearching,
    searchError,
    explanation,
    isExplaining,
    explanationError,
    searchMode,
    referenceImageId,
    imageFile,
    imagePreviewUrl,
    executeSearch,
    executeFindSimilar,
    executeImageSearch,
    resetSearch,
  };
}

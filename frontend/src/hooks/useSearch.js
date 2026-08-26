import { useState, useCallback } from 'react';
import { searchImages, findSimilarImages, getExplanation } from '../api/client';

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

  // Active mode indicator ('text' or 'find-similar')
  const [searchMode, setSearchMode] = useState('text');
  const [referenceImageId, setReferenceImageId] = useState(null);

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

  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setExplanation('');
    setSearchError(null);
    setLatencyMs(null);
    setSearchMode('text');
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
    executeSearch,
    executeFindSimilar,
    resetSearch,
  };
}

import React from 'react';
import ImageCard from '../ImageCard/ImageCard';
import SkeletonCard from '../SkeletonCard/SkeletonCard';
import EmptyState from '../EmptyState/EmptyState';

export default function ResultsGrid({
  results,
  isSearching,
  query,
  latencyMs,
  searchMode,
  referenceImageId,
  onFindSimilar,
  onReset,
}) {
  const hasSearched = Boolean(query || referenceImageId);

  // If loading, render 8 skeleton cards
  if (isSearching) {
    return (
      <section className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 w-36 bg-surface-container rounded animate-pulse"></div>
          <div className="h-5 w-24 bg-surface-container rounded-full animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      </section>
    );
  }

  // If no results after searching
  if (hasSearched && (!results || results.length === 0)) {
    return <EmptyState query={query || `#${referenceImageId}`} onReset={onReset} />;
  }

  // If no search executed yet, show discovery intro
  if (!hasSearched) {
    return (
      <section className="w-full text-center py-12">
        <p className="font-body text-sm text-secondary">
          Enter any natural language description above to perform semantic image retrieval with CLIP & Qdrant.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full animate-fade-in">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-outline-variant/30">
        <div>
          <h2 className="font-headline font-semibold text-lg md:text-xl text-on-background flex items-center gap-2">
            <span>
              {searchMode === 'find-similar'
                ? `Visually Similar to Image #${referenceImageId}`
                : `Results for "${query}"`}
            </span>
          </h2>
          <p className="font-mono text-xs text-secondary mt-0.5">
            Retrieved {results.length} images from COCO index
          </p>
        </div>

        {latencyMs != null && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="font-mono text-xs text-secondary bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/40 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">bolt</span>
              <span>{latencyMs} ms</span>
            </span>
          </div>
        )}
      </div>

      {/* Grid of Image Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
        {results.map((item) => (
          <ImageCard
            key={item.image_id}
            item={item}
            onFindSimilar={onFindSimilar}
          />
        ))}
      </div>
    </section>
  );
}

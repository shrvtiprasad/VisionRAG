import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar/NavBar';
import SearchBar from './components/SearchBar/SearchBar';
import SemanticChips from './components/SemanticChips/SemanticChips';
import AIExplainPanel from './components/AIExplainPanel/AIExplainPanel';
import ResultsGrid from './components/ResultsGrid/ResultsGrid';
import ErrorBanner from './components/ErrorBanner/ErrorBanner';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const [isDark, setIsDark] = useState(true);

  const {
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
  } = useSearch();

  // Sync theme with html root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col transition-colors duration-300">
      {/* Top Navigation Bar */}
      <NavBar
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onReset={resetSearch}
      />

      {/* Main Container */}
      <main className="flex-grow max-w-[1280px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-12 md:pt-16 pb-16 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-2xl mx-auto flex flex-col items-center text-center mb-10">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight text-on-background animate-fade-in">
            Find visual context by meaning
          </h1>
          <p className="font-body text-sm md:text-base text-secondary max-w-lg mb-8">
            Multimodal semantic search powered by CLIP embeddings, Qdrant vector retrieval, and Gemini RAG synthesis on the COCO dataset.
          </p>

          {/* Search Bar */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            onSearch={executeSearch}
            isSearching={isSearching}
          />

          {/* Preset Semantic Chips */}
          <SemanticChips
            activeQuery={query}
            onSelectChip={executeSearch}
            disabled={isSearching}
          />
        </section>

        {/* Global Error Banner */}
        {searchError && (
          <ErrorBanner
            message={searchError}
            onRetry={() => executeSearch(query)}
          />
        )}

        {/* AI RAG Explanation Panel (Hidden until search is performed) */}
        <AIExplainPanel
          query={query || (referenceImageId ? `Similar to #${referenceImageId}` : '')}
          explanation={explanation}
          isExplaining={isExplaining}
          error={explanationError}
        />

        {/* Results Grid */}
        <ResultsGrid
          results={results}
          isSearching={isSearching}
          query={query}
          latencyMs={latencyMs}
          searchMode={searchMode}
          referenceImageId={referenceImageId}
          onFindSimilar={executeFindSimilar}
          onReset={resetSearch}
        />
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-outline-variant/30 mt-auto py-8 transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-secondary">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary-container text-base"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              lens_blur
            </span>
            <span className="font-headline font-medium text-on-background">VisionRAG</span>
            <span>— Multimodal Search & RAG</span>
          </div>

          <div>© 2026 VisionRAG. Built with CLIP, Qdrant, FastAPI, and Gemini.</div>
        </div>
      </footer>
    </div>
  );
}

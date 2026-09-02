import React, { useState, useEffect } from 'react';
import NavBar from './components/NavBar/NavBar';
import SearchBar from './components/SearchBar/SearchBar';
import ImageSearchBar from './components/ImageSearchBar/ImageSearchBar';
import SemanticChips from './components/SemanticChips/SemanticChips';
import AIExplainPanel from './components/AIExplainPanel/AIExplainPanel';
import ResultsGrid from './components/ResultsGrid/ResultsGrid';
import ErrorBanner from './components/ErrorBanner/ErrorBanner';
import { useSearch } from './hooks/useSearch';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  // 'text' | 'image' — controls which search input is shown
  const [inputMode, setInputMode] = useState('text');

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
    imageFile,
    imagePreviewUrl,
    executeSearch,
    executeFindSimilar,
    executeImageSearch,
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

  const handleTabChange = (mode) => {
    setInputMode(mode);
    // Clear results when switching modes so the UI is clean
    if (mode === 'text' && searchMode === 'image') resetSearch();
    if (mode === 'image' && searchMode === 'text') resetSearch();
  };

  const handleClearImage = () => {
    resetSearch();
  };

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

          {/* ── Search Mode Tabs ───────────────────────────────────────── */}
          <div
            className="flex items-center gap-1 bg-surface-container-low border border-outline-variant/40 rounded-full p-1 mb-5 self-center"
            role="tablist"
            aria-label="Search mode"
          >
            <button
              role="tab"
              id="tab-text"
              aria-selected={inputMode === 'text'}
              aria-controls="panel-text"
              onClick={() => handleTabChange('text')}
              disabled={isSearching}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-body text-sm transition-all duration-200 disabled:opacity-50
                ${inputMode === 'text'
                  ? 'bg-surface-container-highest text-on-background shadow-sm'
                  : 'text-secondary hover:text-on-background'
                }`}
            >
              <span className="material-symbols-outlined text-base">search</span>
              Search by Text
            </button>

            <button
              role="tab"
              id="tab-image"
              aria-selected={inputMode === 'image'}
              aria-controls="panel-image"
              onClick={() => handleTabChange('image')}
              disabled={isSearching}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-body text-sm transition-all duration-200 disabled:opacity-50
                ${inputMode === 'image'
                  ? 'bg-surface-container-highest text-on-background shadow-sm'
                  : 'text-secondary hover:text-on-background'
                }`}
            >
              <span className="material-symbols-outlined text-base">add_photo_alternate</span>
              Search by Image
            </button>
          </div>

          {/* ── Text Search Panel ──────────────────────────────────────── */}
          <div
            id="panel-text"
            role="tabpanel"
            aria-labelledby="tab-text"
            className={`w-full ${inputMode === 'text' ? 'block' : 'hidden'}`}
          >
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
          </div>

          {/* ── Image Upload Panel ─────────────────────────────────────── */}
          <div
            id="panel-image"
            role="tabpanel"
            aria-labelledby="tab-image"
            className={`w-full ${inputMode === 'image' ? 'block' : 'hidden'}`}
          >
            <ImageSearchBar
              onSearch={executeImageSearch}
              isSearching={isSearching}
              previewUrl={imagePreviewUrl}
              onClear={handleClearImage}
            />
            <p className="font-mono text-secondary mt-3 text-xs text-center pl-6">
              Upload any image — CLIP encodes it and finds the most visually similar COCO images.
            </p>
          </div>
        </section>

        {/* Global Error Banner */}
        {searchError && (
          <ErrorBanner
            message={searchError}
            onRetry={searchMode === 'image' && imageFile
              ? () => executeImageSearch(imageFile)
              : () => executeSearch(query)}
          />
        )}

        {/* AI RAG Explanation Panel */}
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
          imageFile={imageFile}
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
            <span>— Multimodal Search &amp; RAG</span>
          </div>

          <div>© 2026 VisionRAG. Built with CLIP, Qdrant, FastAPI, and Gemini.</div>
        </div>
      </footer>
    </div>
  );
}

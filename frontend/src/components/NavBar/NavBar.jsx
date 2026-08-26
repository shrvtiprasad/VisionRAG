import React from 'react';

export default function NavBar({ isDark, onToggleTheme, onReset }) {
  return (
    <header className="bg-background docked full-width top-0 sticky z-50 border-b border-outline-variant/40 backdrop-blur-md bg-opacity-95 transition-colors duration-300">
      <div className="max-w-[1280px] mx-auto px-margin-mobile md:px-margin-desktop h-20 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={onReset}
          className="font-headline text-2xl font-semibold text-on-background flex items-center gap-2.5 hover:opacity-90 transition-opacity focus:outline-none"
        >
          <span
            className="material-symbols-outlined text-primary-container text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lens_blur
          </span>
          <span>VisionRAG</span>
          <span className="text-[10px] font-mono tracking-widest uppercase bg-surface-container-high text-primary px-2 py-0.5 rounded-full border border-outline-variant/60 ml-1">
            Multimodal RAG
          </span>
        </button>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-6 font-body text-sm">
          <nav className="hidden md:flex items-center gap-6 text-secondary">
            <a
              href="https://github.com/openai/CLIP"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors duration-200"
            >
              CLIP
            </a>
            <a
              href="https://qdrant.tech/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors duration-200"
            >
              Qdrant
            </a>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors duration-200"
            >
              API Docs
            </a>
          </nav>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-secondary hover:text-on-background hover:bg-surface-container-low transition-all duration-200"
          >
            <span className="material-symbols-outlined text-xl">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

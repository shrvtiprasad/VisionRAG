import React from 'react';

export default function EmptyState({ query, onReset }) {
  return (
    <div className="w-full py-16 px-4 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-16 h-16 rounded-full bg-surface-container-low border border-outline-variant flex items-center justify-center text-secondary mb-4">
        <span className="material-symbols-outlined text-3xl">image_not_supported</span>
      </div>

      <h3 className="font-headline text-lg font-medium text-on-background mb-1">
        No visual matches found
      </h3>

      <p className="font-body text-sm text-secondary max-w-md mb-6">
        We couldn't find indexed COCO images matching <span className="text-primary font-mono font-medium">"{query}"</span>.
        Try exploring broader concepts or synonyms.
      </p>

      {onReset && (
        <button
          onClick={onReset}
          className="px-5 py-2 rounded-full border border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container text-xs font-medium font-body transition-colors"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}

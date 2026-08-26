import React from 'react';

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-start justify-between gap-3 animate-fade-in">
      <div className="flex items-start gap-2.5">
        <span className="material-symbols-outlined text-xl flex-shrink-0 mt-0.5">
          error
        </span>
        <div>
          <h4 className="font-headline font-semibold text-sm">Connection / Search Error</h4>
          <p className="font-body text-xs text-error/90 mt-0.5">{message}</p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs font-mono font-medium underline hover:opacity-80 px-2 py-1 flex-shrink-0"
        >
          Retry
        </button>
      )}
    </div>
  );
}

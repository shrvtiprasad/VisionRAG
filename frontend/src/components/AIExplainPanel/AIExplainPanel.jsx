import React, { useState } from 'react';

export default function AIExplainPanel({
  query,
  explanation,
  isExplaining,
  error,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  // Hidden until an explanation is being generated or present
  if (!isExplaining && !explanation && !error) {
    return null;
  }

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto mb-10 animate-fade-in">
      <div className="bg-surface-container-low border border-primary-container/30 rounded-2xl p-5 md:p-6 shadow-sm relative overflow-hidden">
        {/* Subtle glowing accent line on top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-60"></div>

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className="material-symbols-outlined text-primary-container text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <h3 className="font-headline font-semibold text-base md:text-lg text-on-background">
              AI Semantic Synthesis
            </h3>
            <span className="font-mono text-[10px] tracking-wider uppercase bg-surface-container text-primary-container px-2 py-0.5 rounded border border-outline-variant">
              Gemini RAG
            </span>
          </div>

          <div className="flex items-center gap-2">
            {explanation && !isExplaining && (
              <button
                onClick={handleCopy}
                aria-label="Copy explanation"
                className="text-secondary hover:text-on-background p-1.5 rounded-lg hover:bg-surface-container transition-colors text-xs flex items-center gap-1 font-mono"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label="Toggle explanation collapse"
              className="text-secondary hover:text-on-background p-1 rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-xl">
                {isCollapsed ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isCollapsed && (
          <div className="mt-2">
            {isExplaining ? (
              <div className="space-y-2.5 py-1">
                <div className="flex items-center gap-2 text-primary-container font-body text-xs animate-pulse">
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                  <span>Synthesizing visual context from retrieved COCO annotations...</span>
                </div>
                <div className="h-4 bg-surface-container-high/60 rounded-md w-full animate-pulse"></div>
                <div className="h-4 bg-surface-container-high/60 rounded-md w-4/5 animate-pulse"></div>
              </div>
            ) : error ? (
              <p className="font-body text-xs text-error">
                {error}
              </p>
            ) : (
              <p className="font-body text-sm md:text-base text-on-surface leading-relaxed">
                {explanation}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

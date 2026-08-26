import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/20 aspect-[3/4] animate-pulse">
      {/* Top score pill placeholder */}
      <div className="absolute top-3 right-3 w-16 h-6 rounded-full bg-surface-container-high/70"></div>

      {/* Bottom text placeholder */}
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-3 bg-surface-container-high/80 rounded w-3/4"></div>
        <div className="h-3 bg-surface-container-high/60 rounded w-1/2"></div>
      </div>
    </div>
  );
}

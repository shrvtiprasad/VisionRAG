import React, { useState } from 'react';

export default function ImageCard({
  item,
  onFindSimilar,
  onSelectImage,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mainCaption = item.captions && item.captions.length > 0 ? item.captions[0] : '';
  const categoriesList = item.categories && item.categories.length > 0 ? item.categories : [];

  return (
    <div
      className="image-card relative rounded-2xl overflow-hidden bg-surface-container-low border border-outline-variant/30 aspect-[3/4] group cursor-pointer select-none transition-all duration-300 hover:shadow-xl hover:border-primary-container/40"
      onClick={() => onSelectImage && onSelectImage(item)}
    >
      {/* Skeleton / Blur background while loading */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-surface-container animate-pulse flex items-center justify-center">
          <span className="material-symbols-outlined text-outline text-3xl">image</span>
        </div>
      )}

      {/* Actual Image */}
      {imageError ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-surface-container">
          <span className="material-symbols-outlined text-outline text-4xl mb-2">broken_image</span>
          <span className="font-mono text-xs text-secondary">Image #{item.image_id}</span>
        </div>
      ) : (
        <img
          src={item.image_url}
          alt={mainCaption || `COCO Image ${item.image_id}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Top Match Score Pill (Always visible or visible on hover) */}
      <div className="absolute top-3 right-3 z-10">
        <div className="bg-surface-lowest/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-outline-variant/60 shadow-sm">
          <span className="font-mono text-[11px] font-medium text-primary tracking-wide">
            {item.match_percentage} Match
          </span>
        </div>
      </div>

      {/* Bottom Overlay (Gradient on Hover) */}
      <div className="overlay absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-300 flex flex-col justify-end p-4 z-20">
        {/* Captions / Metadata snippet */}
        {mainCaption && (
          <p className="font-body text-xs text-white/90 line-clamp-2 mb-3 drop-shadow-sm">
            "{mainCaption}"
          </p>
        )}

        {/* Category tags */}
        {categoriesList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {categoriesList.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="bg-white/15 text-white/90 text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-sm"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Actions bar: Find Similar Button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
          <span className="font-mono text-[10px] text-white/60">
            ID: {item.image_id}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindSimilar(item.image_id);
            }}
            className="bg-white/90 hover:bg-white text-black font-body font-medium text-xs px-3.5 py-1.5 rounded-full shadow-md transition-all duration-150 flex items-center gap-1 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">troubleshoot</span>
            <span>Find Similar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

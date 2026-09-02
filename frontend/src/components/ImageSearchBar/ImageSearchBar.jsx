import React, { useRef, useState } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
const MAX_SIZE_MB = 10;

export default function ImageSearchBar({ onSearch, isSearching, previewUrl, onClear }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState(null);

  const validate = (file) => {
    if (!file) return 'No file selected.';
    if (!ACCEPTED_TYPES.includes(file.type)) return `Unsupported type "${file.type}". Use JPEG, PNG, WebP, GIF, BMP, or TIFF.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) return `File is too large (max ${MAX_SIZE_MB} MB).`;
    return null;
  };

  const handleFile = (file) => {
    const err = validate(file);
    if (err) {
      setLocalError(err);
      return;
    }
    setLocalError(null);
    onSearch(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected after clearing
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleClear = () => {
    setLocalError(null);
    onClear();
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {previewUrl ? (
        /* ── Preview & Re-search panel ─────────────────────────────────── */
        <div className="w-full flex flex-row items-center gap-4 bg-surface-container-low/90 backdrop-blur-md border border-outline-variant/60 rounded-2xl p-3.5 sm:p-4 shadow-md animate-fade-in">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-outline-variant/60 bg-surface-container shadow-sm">
            <img
              src={previewUrl}
              alt="Uploaded image preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info + actions */}
          <div className="flex-grow flex flex-col justify-center gap-2 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-emerald-400 text-lg flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              <span className="font-headline font-medium text-xs sm:text-sm text-on-background truncate">
                Image loaded — ready to search
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isSearching}
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-body font-medium bg-surface-container-high hover:bg-surface-container-highest px-3.5 py-1.5 rounded-full border border-outline-variant/60 text-on-background transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                <span>Change image</span>
              </button>

              <button
                type="button"
                disabled={isSearching}
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-body font-medium bg-surface-container-high hover:bg-error/15 px-3.5 py-1.5 rounded-full border border-outline-variant/60 text-secondary hover:text-error hover:border-error/40 transition-all duration-200 disabled:opacity-50 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                <span>Clear</span>
              </button>

              {isSearching && (
                <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 animate-pulse">
                  <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  Searching…
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── Drop zone ──────────────────────────────────────────────────── */
        <button
          type="button"
          disabled={isSearching}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-[64px] flex items-center justify-center gap-3 rounded-full border-2 border-dashed transition-all duration-300 font-body text-sm
            ${dragOver
              ? 'border-primary-container bg-primary-container/10 text-primary'
              : 'border-outline-variant/60 bg-surface-container-lowest text-on-background hover:border-primary-container/60 hover:bg-surface-container-low'
            }
            ${isSearching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className="material-symbols-outlined text-2xl text-primary"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            {dragOver ? 'file_upload' : 'add_photo_alternate'}
          </span>
          <span className="font-medium text-on-background">
            {dragOver ? 'Drop image here' : 'Upload image or drag & drop'}
          </span>
          <span className="hidden sm:inline-flex items-center font-mono text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
            JPEG · PNG · WebP
          </span>
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Select image file for visual search"
      />

      {/* Inline validation error */}
      {localError && (
        <p className="font-mono text-xs text-error text-center px-4">
          <span className="material-symbols-outlined text-sm align-middle mr-1">warning</span>
          {localError}
        </p>
      )}
    </div>
  );
}

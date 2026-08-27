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
        <div className="w-full flex flex-col sm:flex-row items-center gap-4 bg-surface-container-low border border-outline-variant/40 rounded-2xl p-4 animate-fade-in">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-outline-variant/40 bg-surface-container shadow-inner">
            <img
              src={previewUrl}
              alt="Uploaded image preview"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info + actions */}
          <div className="flex-grow flex flex-col gap-2 w-full">
            <p className="font-mono text-xs text-secondary">
              <span className="material-symbols-outlined text-primary text-sm align-middle mr-1"
                style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              Image loaded — ready to search
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isSearching}
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs font-body bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/60 text-secondary hover:text-on-background hover:border-primary-container/60 transition-all duration-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">swap_horiz</span>
                Change image
              </button>

              <button
                type="button"
                disabled={isSearching}
                onClick={handleClear}
                className="flex items-center gap-1.5 text-xs font-body bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/60 text-secondary hover:text-error hover:border-error/40 transition-all duration-200 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear
              </button>

              {isSearching && (
                <span className="flex items-center gap-1.5 font-mono text-xs text-primary-container animate-pulse">
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
              : 'border-outline-variant/50 bg-surface-container-lowest text-secondary hover:border-primary-container/60 hover:text-on-background hover:bg-surface-container-low'
            }
            ${isSearching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            {dragOver ? 'file_upload' : 'add_photo_alternate'}
          </span>
          <span>{dragOver ? 'Drop image here' : 'Upload image or drag & drop'}</span>
          <span className="hidden sm:inline font-mono text-xs text-outline bg-surface-container px-2 py-0.5 rounded-full border border-outline-variant/40">
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

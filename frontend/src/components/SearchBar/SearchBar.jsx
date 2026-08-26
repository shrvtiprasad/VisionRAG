import React from 'react';

export default function SearchBar({
  query,
  setQuery,
  onSearch,
  isSearching,
  placeholder = "Search by image concept, style, or specific content...",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full relative group">
      <div className="search-input-wrapper relative flex items-center bg-surface-container-lowest h-[64px] rounded-full border border-outline-variant transition-all duration-300 px-6">
        {/* Search Icon */}
        <span className="material-symbols-outlined text-secondary mr-3 text-2xl select-none">
          search
        </span>

        {/* Text Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Semantic Image Search Query"
          className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-body text-base text-on-surface placeholder:text-outline h-full"
        />

        {/* Semantic Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-surface-container-low text-secondary font-mono text-[11px] px-3 py-1 rounded-full border border-outline-variant select-none mr-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span>
          Semantic
        </div>

        {/* Submit / Search Button */}
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          aria-label="Submit Search"
          className={`ml-1 flex items-center justify-center p-2.5 rounded-full transition-all duration-200 ${
            query.trim()
              ? 'bg-primary-container text-on-primary-container hover:bg-primary'
              : 'text-secondary hover:bg-surface-container-low'
          } ${isSearching ? 'animate-spin' : ''}`}
        >
          <span className="material-symbols-outlined text-xl">
            {isSearching ? 'progress_activity' : 'arrow_forward'}
          </span>
        </button>
      </div>

      <p className="font-mono text-secondary mt-3 text-xs text-center sm:text-left pl-6">
        Try:{' '}
        <span
          onClick={() => onSearch('a person riding a bicycle on a sunny street')}
          className="text-primary-container cursor-pointer hover:underline"
        >
          "a person riding a bicycle on a sunny street"
        </span>{' '}
        or{' '}
        <span
          onClick={() => onSearch('a cute dog playing outdoors in the grass')}
          className="text-primary-container cursor-pointer hover:underline"
        >
          "a cute dog playing outdoors in the grass"
        </span>
      </p>
    </form>
  );
}

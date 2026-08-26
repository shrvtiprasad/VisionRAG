import React from 'react';

const SUGGESTIONS = [
  'A person riding a bicycle',
  'Food served on a dining table',
  'A dog playing in the grass',
  'An airplane in the sky',
  'A train moving on railroad tracks',
  'People playing tennis with a racket',
];

export default function SemanticChips({ activeQuery, onSelectChip, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5 mt-6">
      {SUGGESTIONS.map((label) => {
        const isSelected = activeQuery.toLowerCase() === label.toLowerCase();
        return (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onSelectChip(label)}
            className={`px-4 py-2 rounded-full border text-xs font-medium font-body transition-all duration-200 ${
              isSelected
                ? 'bg-primary-container text-on-primary-container border-primary-container shadow-sm'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container hover:border-primary-container/40'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

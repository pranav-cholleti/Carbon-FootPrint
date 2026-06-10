'use client';

import React from 'react';

interface OptionButtonProps {
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  sublabel?: string;
}

export default function OptionButton({
  selected,
  onClick,
  emoji,
  label,
  sublabel,
}: OptionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl"
      style={{
        minHeight: '52px',
        background: selected ? 'var(--accent-green-bg)' : 'var(--bg-input)',
        border: selected
          ? '2px solid var(--accent-green)'
          : '2px solid transparent',
        color: selected ? 'var(--accent-green-dark)' : 'var(--text-primary)',
        fontWeight: selected ? 600 : 500,
        fontSize: '15px',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      {emoji && <span className="text-xl flex-shrink-0">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <div>{label}</div>
        {sublabel && (
          <div
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}
          >
            {sublabel}
          </div>
        )}
      </div>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-green)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

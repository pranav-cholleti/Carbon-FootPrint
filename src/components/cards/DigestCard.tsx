'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DigestCardProps {
  content: string;
  weekStart: string;
  weekEnd: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateShort(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DigestCard({ content, weekStart, weekEnd }: DigestCardProps) {
  const start = formatDateShort(weekStart);
  const end = formatDateShort(weekEnd);

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '0',
        overflow: 'hidden',
        borderLeft: '4px solid var(--accent-green)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--accent-green-bg)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: 'var(--accent-green)' }} />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            📋 Your Week in Carbon
          </span>
        </div>
        <span
          className="badge badge-green"
          style={{ fontSize: '11px' }}
        >
          {start} – {end}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 20px' }}>
        <div
          style={{
            fontSize: '14px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-line',
          }}
        >
          {content}
        </div>
      </div>

      {/* Footer CTA */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Link
          href="/insights"
          className="btn btn-sm btn-ghost"
          style={{
            color: 'var(--accent-green)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          Full Insights
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

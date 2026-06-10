'use client';

import React from 'react';

/**
 * Props layout for HistorySummaryCards.
 */
interface HistorySummaryCardsProps {
  /** The aggregated emissions logged during the current week in kg. */
  weekTotal: number;
  /** The aggregated emissions logged during the current month in kg. */
  monthTotal: number;
}

/**
 * HistorySummaryCards renders side-by-side cards representing the user's weekly
 * and monthly carbon logging summaries.
 *
 * @param {HistorySummaryCardsProps} props - Component properties.
 * @returns {React.ReactElement} The rendered cards panel.
 */
export default function HistorySummaryCards({
  weekTotal,
  monthTotal,
}: HistorySummaryCardsProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {/* Weekly Stats */}
      <div
        className="card"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          This week
        </span>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
          }}
        >
          {weekTotal < 100 ? weekTotal.toFixed(1) : Math.round(weekTotal)}
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginLeft: '4px',
            }}
          >
            kg
          </span>
        </span>
      </div>

      {/* Monthly Stats */}
      <div
        className="card"
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          This month
        </span>
        <span
          style={{
            fontSize: '22px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
          }}
        >
          {monthTotal < 100 ? monthTotal.toFixed(1) : Math.round(monthTotal)}
          <span
            style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginLeft: '4px',
            }}
          >
            kg
          </span>
        </span>
      </div>
    </div>
  );
}

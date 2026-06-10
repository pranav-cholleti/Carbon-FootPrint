'use client';

import React from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

/**
 * Props layout for MonthlyHeroCard.
 */
interface MonthlyHeroCardProps {
  /** The aggregated carbon emissions for the current month in kg. */
  currentTotal: number;
  /** Percentage change compared to the previous month. */
  changePct: number;
}

/**
 * MonthlyHeroCard displays the primary aggregated emissions metric for the current month,
 * highlighting positive or negative trends with colorful badges and icons.
 *
 * @param {MonthlyHeroCardProps} props - Component properties.
 * @returns {React.ReactElement} The hero card component.
 */
export default function MonthlyHeroCard({ currentTotal, changePct }: MonthlyHeroCardProps) {
  return (
    <div
      className="card"
      style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
        border: 'none',
        color: 'white',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.8 }}>
          This month&apos;s footprint
        </span>
        {changePct !== 0 && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              background: changePct < 0 ? 'rgba(216,243,220,0.2)' : 'rgba(255,200,200,0.2)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {changePct < 0 ? (
              <TrendingDown style={{ width: '14px', height: '14px' }} />
            ) : (
              <TrendingUp style={{ width: '14px', height: '14px' }} />
            )}
            {Math.abs(changePct)}% vs last month
          </div>
        )}
      </div>
      <div
        style={{
          fontSize: '42px',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.1,
        }}
      >
        {currentTotal < 100 ? currentTotal.toFixed(1) : Math.round(currentTotal).toLocaleString()}
        <span style={{ fontSize: '16px', fontWeight: 500, opacity: 0.7, marginLeft: '6px' }}>
          kg CO₂e
        </span>
      </div>
    </div>
  );
}

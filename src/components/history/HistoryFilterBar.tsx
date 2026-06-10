'use client';

import React from 'react';
import { Filter } from 'lucide-react';
import type { EmissionCategory } from '@/types/domain';

/**
 * Props layout for HistoryFilterBar.
 */
interface HistoryFilterBarProps {
  /** The selected filter category. */
  categoryFilter: EmissionCategory | 'all';
  /** State setter for category filter. */
  setCategoryFilter: (category: EmissionCategory | 'all') => void;
  /** Start date filter value. */
  startDate: string;
  /** State setter for start date. */
  setStartDate: (date: string) => void;
  /** End date filter value. */
  endDate: string;
  /** State setter for end date. */
  setEndDate: (date: string) => void;
}

/**
 * HistoryFilterBar renders the selection controls to filter activity logs by category and date ranges.
 *
 * @param {HistoryFilterBarProps} props - Component properties.
 * @returns {React.ReactElement} The filter bar layout.
 */
export default function HistoryFilterBar({
  categoryFilter,
  setCategoryFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: HistoryFilterBarProps) {
  return (
    <div
      className="card"
      style={{
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Filter style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
        <select
          className="select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as EmissionCategory | 'all')}
          style={{
            width: 'auto',
            minWidth: '140px',
            fontSize: '13px',
            padding: '8px 32px 8px 10px',
          }}
          aria-label="Filter by Category"
        >
          <option value="all">All Categories</option>
          <option value="transport">Transport 🚗</option>
          <option value="food">Food 🥗</option>
          <option value="home">Home Energy 🏠</option>
          <option value="consumption">Purchases 🛍️</option>
        </select>
      </div>

      {/* Date Range Inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <input
          type="date"
          className="input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ width: 'auto', fontSize: '13px', padding: '6px 10px' }}
          aria-label="Filter Start Date"
        />
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>to</span>
        <input
          type="date"
          className="input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ width: 'auto', fontSize: '13px', padding: '6px 10px' }}
          aria-label="Filter End Date"
        />
      </div>
    </div>
  );
}

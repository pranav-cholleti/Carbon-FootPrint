'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCurrentUser,
  getActivityLogs,
  getActivitySummary,
  deleteActivityLog,
  initializeSeedData,
} from '@/lib/store';
import type { ActivityLog, EmissionCategory } from '@/types/domain';

import HistorySummaryCards from '@/components/history/HistorySummaryCards';
import HistoryFilterBar from '@/components/history/HistoryFilterBar';
import HistoryLogList from '@/components/history/HistoryLogList';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<
  EmissionCategory,
  { emoji: string; label: string; color: string; bg: string }
> = {
  transport: { emoji: '🚗', label: 'Transport', color: 'var(--cat-transport)', bg: 'var(--accent-blue-bg)' },
  food: { emoji: '🥗', label: 'Food', color: 'var(--cat-food)', bg: 'var(--accent-amber-bg)' },
  home: { emoji: '🏠', label: 'Home', color: 'var(--cat-home)', bg: 'var(--accent-purple-bg)' },
  consumption: {
    emoji: '🛍️',
    label: 'Purchases',
    color: 'var(--cat-consumption)',
    bg: 'var(--accent-coral-bg)',
  },
};

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Formats an ISO date string into a readable Indian Standard localized date representation.
 *
 * @param {string} iso - The ISO date string.
 * @returns {string} The localized date.
 */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats an ISO date string into a readable localized time representation.
 *
 * @param {string} iso - The ISO date string.
 * @returns {string} The localized time.
 */
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates the ISO start timestamp of the current week (Monday-anchored).
 *
 * @returns {string} The ISO date string representing the start of the week.
 */
function startOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

/**
 * Calculates the ISO start timestamp of the current month.
 *
 * @returns {string} The ISO date string representing the start of the month.
 */
function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/**
 * Calculates the ISO end timestamp of the current day.
 *
 * @returns {string} The ISO date string representing the end of the day.
 */
function endOfToday(): string {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.toISOString();
}

/**
 * HistorySkeleton component displays skeleton loaders while retrieving data.
 *
 * @returns {React.ReactElement} The loading view.
 */
function HistorySkeleton() {
  const skeletonStyle = { borderRadius: 'var(--radius-md)', background: 'var(--border-light)' };
  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <div className="skeleton" style={{ width: '40%', height: '24px', ...skeletonStyle }} />
      <div className="skeleton" style={{ width: '100%', height: '48px', ...skeletonStyle }} />
      <div className="skeleton" style={{ width: '100%', height: '60px', ...skeletonStyle }} />
      <div className="skeleton" style={{ width: '100%', height: '300px', ...skeletonStyle }} />
    </div>
  );
}

/**
 * HistoryPage component coordinates activity log timelines.
 * Handles filter states, deletes logs, and passes computed arrays to modular widgets.
 *
 * @returns {React.ReactElement} History view layout.
 */
export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<EmissionCategory | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [weekTotal, setWeekTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);

  /**
   * Initializes seed data and loads filtered activity timelines.
   */
  const loadData = useCallback(() => {
    initializeSeedData();

    const user = getCurrentUser();
    if (!user) return;

    const filters: {
      category?: EmissionCategory;
      startDate?: string;
      endDate?: string;
    } = {};

    if (categoryFilter !== 'all') {
      filters.category = categoryFilter;
    }
    if (startDate) {
      filters.startDate = new Date(startDate).toISOString();
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.endDate = end.toISOString();
    }

    setLogs(getActivityLogs(filters));

    // Calculate aggregated week/month summary statistics
    const now = endOfToday();
    const weekSummary = getActivitySummary(startOfWeek(), now);
    setWeekTotal(weekSummary.total_co2e_kg);

    const monthSummary = getActivitySummary(startOfMonth(), now);
    setMonthTotal(monthSummary.total_co2e_kg);

    setLoading(false);
    setTimeout(() => setMounted(true), 50);
  }, [categoryFilter, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Group logs by day and sort descending
  const groupedLogs = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    for (const log of logs) {
      const dateKey = log.logged_at.substring(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    }
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [logs]);

  /**
   * Deletes a targeted activity log entry.
   *
   * @param {string} id - The ID of the log to delete.
   */
  const handleDelete = useCallback(
    (id: string) => {
      deleteActivityLog(id);
      setConfirmDelete(null);
      loadData();
    },
    [loadData]
  );

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <div
      className={mounted ? 'animate-fade-in' : 'opacity-0'}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}
      >
        Activity History
      </h1>

      {/* Aggregate Stats Cards */}
      <HistorySummaryCards weekTotal={weekTotal} monthTotal={monthTotal} />

      {/* Filters Bar */}
      <HistoryFilterBar
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
      />

      {/* Grouped Logs Timeline */}
      <HistoryLogList
        groupedLogs={groupedLogs}
        confirmDelete={confirmDelete}
        setConfirmDelete={setConfirmDelete}
        handleDelete={handleDelete}
        formatDate={formatDate}
        formatTime={formatTime}
        categoryMeta={CATEGORY_META}
      />
    </div>
  );
}

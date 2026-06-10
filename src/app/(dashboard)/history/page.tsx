'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Trash2, Filter, Calendar } from 'lucide-react';
import {
  getCurrentUser,
  getActivityLogs,
  getActivitySummary,
  deleteActivityLog,
  initializeSeedData,
} from '@/lib/store';
import type { ActivityLog, EmissionCategory } from '@/types/domain';

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function startOfWeek(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(now.getFullYear(), now.getMonth(), diff);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}

function startOfMonth(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function endOfToday(): string {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.toISOString();
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function HistorySkeleton() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="skeleton" style={{ width: '40%', height: '24px' }} />
      <div className="skeleton" style={{ width: '100%', height: '48px' }} />
      <div className="skeleton" style={{ width: '100%', height: '60px' }} />
      <div className="skeleton" style={{ width: '100%', height: '300px' }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

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

  // Load data
  const loadData = useCallback(() => {
    initializeSeedData();

    const user = getCurrentUser();
    if (!user) return;

    // Fetch all logs (with filter)
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

    // Summaries (always unfiltered for totals)
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

  // Group logs by date
  const groupedLogs = useMemo(() => {
    const groups: Record<string, ActivityLog[]> = {};
    for (const log of logs) {
      const dateKey = log.logged_at.substring(0, 10);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(log);
    }
    // Sort by date descending
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [logs]);

  // Delete handler
  const handleDelete = useCallback(
    (id: string) => {
      deleteActivityLog(id);
      setConfirmDelete(null);
      loadData();
    },
    [loadData],
  );

  if (loading) {
    return <HistorySkeleton />;
  }

  return (
    <div
      className={mounted ? 'animate-fade-in' : 'opacity-0'}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Header */}
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

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

      {/* Filter bar */}
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
          <Filter
            style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }}
          />
          <select
            className="select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as EmissionCategory | 'all')}
            style={{ width: 'auto', minWidth: '140px', fontSize: '13px', padding: '8px 32px 8px 10px' }}
          >
            <option value="all">All Categories</option>
            <option value="transport">🚗 Transport</option>
            <option value="food">🥗 Food</option>
            <option value="home">🏠 Home</option>
            <option value="consumption">🛍️ Purchases</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar
            style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }}
          />
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ width: 'auto', fontSize: '13px', padding: '8px 10px' }}
            placeholder="From"
          />
          <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>—</span>
          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ width: 'auto', fontSize: '13px', padding: '8px 10px' }}
            placeholder="To"
            max={new Date().toISOString().substring(0, 10)}
          />
        </div>

        {(categoryFilter !== 'all' || startDate || endDate) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setCategoryFilter('all');
              setStartDate('');
              setEndDate('');
            }}
            style={{ fontSize: '12px' }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Activity list */}
      {groupedLogs.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '48px' }}>📋</div>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            No activities found
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              maxWidth: '280px',
              margin: 0,
            }}
          >
            {categoryFilter !== 'all' || startDate || endDate
              ? 'Try changing your filters to see more results.'
              : 'Start logging your daily activities to track your carbon footprint over time.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {groupedLogs.map(([dateKey, entries]) => (
            <div key={dateKey}>
              {/* Date header */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '8px',
                  paddingLeft: '4px',
                }}
              >
                {formatDate(dateKey + 'T00:00:00')}
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    marginLeft: '8px',
                    fontSize: '12px',
                  }}
                >
                  {entries.reduce((sum, e) => sum + e.co2e_kg, 0).toFixed(1)} kg
                </span>
              </div>

              {/* Entries */}
              <div
                className="card"
                style={{
                  overflow: 'hidden',
                }}
              >
                {entries.map((log, idx) => {
                  const meta = CATEGORY_META[log.category];
                  const isLast = idx === entries.length - 1;
                  const isDeleting = confirmDelete === log.id;

                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
                        transition: 'background var(--transition-fast)',
                        background: isDeleting ? 'var(--accent-coral-bg)' : 'transparent',
                      }}
                    >
                      {/* Category icon */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          background: meta.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                        }}
                      >
                        {meta.emoji}
                      </div>

                      {/* Description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {log.description || log.subcategory.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {formatTime(log.logged_at)} · {log.quantity} {log.unit}
                        </div>
                      </div>

                      {/* CO₂e */}
                      <div
                        style={{
                          textAlign: 'right',
                          flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: log.co2e_kg === 0 ? 'var(--accent-green)' : 'var(--text-primary)',
                          }}
                        >
                          {log.co2e_kg === 0
                            ? '0'
                            : log.co2e_kg < 1
                            ? log.co2e_kg.toFixed(2)
                            : log.co2e_kg < 10
                            ? log.co2e_kg.toFixed(1)
                            : Math.round(log.co2e_kg)}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>
                          kg CO₂e
                        </div>
                      </div>

                      {/* Delete button */}
                      {isDeleting ? (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'var(--accent-coral)',
                              color: 'white',
                              padding: '4px 10px',
                              fontSize: '11px',
                            }}
                            onClick={() => handleDelete(log.id)}
                          >
                            Delete
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={() => setConfirmDelete(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{
                            width: '32px',
                            height: '32px',
                            flexShrink: 0,
                            opacity: 0.5,
                          }}
                          onClick={() => setConfirmDelete(log.id)}
                          aria-label={`Delete ${log.description}`}
                        >
                          <Trash2
                            style={{
                              width: '14px',
                              height: '14px',
                              color: 'var(--accent-coral)',
                            }}
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {logs.length > 0 && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            margin: '8px 0 24px',
          }}
        >
          Showing {logs.length} activit{logs.length === 1 ? 'y' : 'ies'}
        </p>
      )}
    </div>
  );
}

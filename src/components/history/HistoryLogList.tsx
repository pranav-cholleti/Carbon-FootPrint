'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { ActivityLog, EmissionCategory } from '@/types/domain';

/**
 * Props layout for HistoryLogList.
 */
interface HistoryLogListProps {
  /** Array of logs grouped by day: [dateString, Array of logs]. */
  groupedLogs: [string, ActivityLog[]][];
  /** The log ID that is currently waiting for delete confirmation. */
  confirmDelete: string | null;
  /** State setter for confirming deletions. */
  setConfirmDelete: (id: string | null) => void;
  /** Callback to delete the targeted log. */
  handleDelete: (id: string) => void;
  /** Date formatting helper. */
  formatDate: (iso: string) => string;
  /** Time formatting helper. */
  formatTime: (iso: string) => string;
  /** Mapping constants for category layout details (colors, emojis). */
  categoryMeta: Record<
    EmissionCategory,
    { emoji: string; label: string; color: string; bg: string }
  >;
}

/**
 * HistoryLogList renders the timeline list of grouped activity logs, presenting
 * daily headers, log icons, descriptions, carbon values, and confirmation popups for deletions.
 *
 * @param {HistoryLogListProps} props - Component properties.
 * @returns {React.ReactElement} The log list component.
 */
export default function HistoryLogList({
  groupedLogs,
  confirmDelete,
  setConfirmDelete,
  handleDelete,
  formatDate,
  formatTime,
  categoryMeta,
}: HistoryLogListProps) {
  if (groupedLogs.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
        }}
      >
        No activity logs found matching the filters.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {groupedLogs.map(([dateKey, items]) => (
        <div key={dateKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Day header */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingLeft: '4px',
            }}
          >
            {formatDate(items[0].logged_at)}
          </div>

          {/* Day's logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((log) => {
              const meta = categoryMeta[log.category];
              const isConfirming = confirmDelete === log.id;

              return (
                <div
                  key={log.id}
                  className="card"
                  style={{
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: `3px solid ${meta.color}`,
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <span
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-md)',
                        background: meta.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                      }}
                    >
                      {meta.emoji}
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                        }}
                      >
                        {log.description}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          marginTop: '2px',
                        }}
                      >
                        {formatTime(log.logged_at)} · {log.quantity} {log.unit}
                      </div>
                    </div>
                  </div>

                  {/* Carbon values / actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: log.co2e_kg < 0 ? 'var(--accent-green)' : 'var(--text-primary)',
                      }}
                    >
                      {log.co2e_kg < 0 ? '' : '+'}
                      {log.co2e_kg < 100 ? log.co2e_kg.toFixed(1) : Math.round(log.co2e_kg)} kg
                    </span>

                    {/* Delete logic */}
                    {isConfirming ? (
                      <div
                        className="animate-fade-in"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'var(--bg-elevated)',
                          padding: '4px',
                          borderRadius: 'var(--radius-sm)',
                          zIndex: 10,
                        }}
                      >
                        <button
                          className="btn btn-sm"
                          style={{
                            padding: '3px 8px',
                            background: 'var(--accent-coral)',
                            color: 'white',
                            fontSize: '11px',
                            border: 'none',
                          }}
                          onClick={() => handleDelete(log.id)}
                        >
                          Confirm
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                          onClick={() => setConfirmDelete(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => setConfirmDelete(log.id)}
                        aria-label="Delete log entry"
                        style={{ padding: '4px' }}
                      >
                        <Trash2 style={{ width: '15px', height: '15px', color: 'var(--text-tertiary)' }} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

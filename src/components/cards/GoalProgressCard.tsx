'use client';

import React from 'react';
import { Target, TrendingUp, TrendingDown, Award, Calendar } from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GoalData {
  id: string;
  title: string;
  description?: string;
  target_reduction_pct: number;
  baseline_kg_month: number;
  target_kg_month: number;
  current_kg_month?: number;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  start_date: string;
  end_date: string;
  category?: string;
}

interface GoalProgressCardProps {
  goal: GoalData;
  onStatusChange?: (goalId: string, status: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getProgressData(goal: GoalData) {
  const current = goal.current_kg_month ?? goal.baseline_kg_month;
  const totalReduction = goal.baseline_kg_month - goal.target_kg_month;
  const actualReduction = goal.baseline_kg_month - current;
  const progressPct = totalReduction > 0
    ? Math.min(Math.max((actualReduction / totalReduction) * 100, 0), 100)
    : 0;

  const currentReductionPct = goal.baseline_kg_month > 0
    ? ((actualReduction / goal.baseline_kg_month) * 100)
    : 0;

  // Time progress
  const now = new Date().getTime();
  const start = new Date(goal.start_date).getTime();
  const end = new Date(goal.end_date).getTime();
  const timePct = end > start ? Math.min(((now - start) / (end - start)) * 100, 100) : 0;

  // Status
  let trackStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (timePct > 0) {
    const expectedPct = timePct;
    if (progressPct >= expectedPct + 10) {
      trackStatus = 'ahead';
    } else if (progressPct < expectedPct - 15) {
      trackStatus = 'behind';
    }
  }

  return { progressPct, currentReductionPct, timePct, trackStatus, actualReduction, totalReduction };
}

const TRACK_CONFIG = {
  ahead: { label: 'Ahead of schedule!', color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', icon: TrendingUp },
  on_track: { label: 'On track', color: 'var(--accent-green)', bg: 'var(--accent-green-bg)', icon: Target },
  behind: { label: 'Falling behind', color: 'var(--accent-amber-dark)', bg: 'var(--accent-amber-bg)', icon: TrendingDown },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GoalProgressCard({ goal, onStatusChange }: GoalProgressCardProps) {
  const { progressPct, currentReductionPct, trackStatus } = getProgressData(goal);
  const isCompleted = goal.status === 'completed';
  const isAbandoned = goal.status === 'abandoned';
  const trackCfg = TRACK_CONFIG[trackStatus];
  const TrackIcon = trackCfg.icon;

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        opacity: isAbandoned ? 0.6 : 1,
      }}
    >
      {/* Celebration overlay */}
      {isCompleted && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '8px 16px',
            background: 'var(--accent-green)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '0 0 0 var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Award size={14} />
          Completed!
        </div>
      )}

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: isCompleted ? 'var(--accent-green-bg)' : 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isCompleted ? (
            <span style={{ fontSize: '18px' }}>🎉</span>
          ) : (
            <Target size={18} style={{ color: 'var(--accent-green)' }} />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
            {goal.title}
          </h3>
          {goal.description && (
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '4px 0 0', lineHeight: 1.4 }}>
              {goal.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Progress
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${progressPct}%`,
              background: isCompleted
                ? 'linear-gradient(90deg, var(--accent-green), #40916C)'
                : trackStatus === 'behind'
                ? 'linear-gradient(90deg, var(--accent-amber), var(--accent-amber-dark))'
                : 'linear-gradient(90deg, var(--accent-green), var(--accent-green-light))',
            }}
          />
        </div>
      </div>

      {/* Reduction stats */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
            Current Reduction
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {currentReductionPct.toFixed(1)}%
          </div>
        </div>
        <div style={{ fontSize: '20px', color: 'var(--text-tertiary)' }}>→</div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
            Target
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {goal.target_reduction_pct}%
          </div>
        </div>
      </div>

      {/* Status & Dates */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        {!isCompleted && !isAbandoned && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              background: trackCfg.bg,
              color: trackCfg.color,
            }}
          >
            <TrackIcon size={13} />
            {trackCfg.label}
          </span>
        )}

        {isAbandoned && (
          <span className="badge badge-coral" style={{ fontSize: '12px' }}>
            Abandoned
          </span>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
          }}
        >
          <Calendar size={12} />
          {formatDate(goal.start_date)} — {formatDate(goal.end_date)}
        </div>
      </div>

      {/* Action buttons for active goals */}
      {goal.status === 'active' && onStatusChange && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            borderTop: '1px solid var(--border-light)',
            paddingTop: '12px',
          }}
        >
          <button
            className="btn btn-sm btn-primary"
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => onStatusChange(goal.id, 'completed')}
          >
            Mark Complete
          </button>
          <button
            className="btn btn-sm btn-ghost"
            style={{ cursor: 'pointer' }}
            onClick={() => onStatusChange(goal.id, 'abandoned')}
          >
            Abandon
          </button>
        </div>
      )}
    </div>
  );
}

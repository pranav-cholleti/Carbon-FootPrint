'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { Action } from '@/types/domain';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Representation of the user status for a recommendation action.
 */
export type ActionStatus = 'saved' | 'doing' | 'completed' | 'dismissed' | null;

/**
 * Props expected by the ActionCard component.
 */
interface ActionCardProps {
  /** The action recommendation details. */
  action: Action;
  /** The user's active status for this recommendation. */
  status: ActionStatus;
  /** Callback to trigger when the user changes status. */
  onStatusChange: (actionId: string, newStatus: ActionStatus) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_EMOJIS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  home: '🏠',
  consumption: '🛍️',
};

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#2A9D8F',
  food: '#F4A261',
  home: '#7B68EE',
  consumption: '#E07A5F',
};

const CATEGORY_BG: Record<string, string> = {
  transport: 'var(--accent-blue-bg)',
  food: 'var(--accent-amber-bg)',
  home: 'var(--accent-purple-bg)',
  consumption: 'var(--accent-coral-bg)',
};

const EFFORT_CONFIG: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Easy', color: '#2D6A4F', bg: '#D8F3DC' },
  2: { label: 'Easy', color: '#2D6A4F', bg: '#D8F3DC' },
  3: { label: 'Medium', color: '#E76F51', bg: '#FFF3E0' },
  4: { label: 'Hard', color: '#E07A5F', bg: '#FDEAE4' },
  5: { label: 'Hard', color: '#E07A5F', bg: '#FDEAE4' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActionCard component renders a single recommendation action card with category icons,
 * carbon savings progress bar, status toggle buttons, and expandable tip list.
 *
 * @param {ActionCardProps} props - Component properties.
 * @returns {React.ReactElement} The rendered ActionCard component.
 */
export default function ActionCard({ action, status, onStatusChange }: ActionCardProps) {
  const [showTips, setShowTips] = useState(false);
  const catColor = CATEGORY_COLORS[action.category];
  const catBg = CATEGORY_BG[action.category];
  const effortCfg = EFFORT_CONFIG[action.effort_score];
  const maxImpact = 15;
  const impactPct = Math.min((action.base_impact_kg_month / maxImpact) * 100, 100);

  const getStatusButton = () => {
    switch (status) {
      case 'doing':
        return {
          label: 'In Progress ✓',
          style: {
            background: 'var(--accent-green-bg)',
            color: 'var(--accent-green)',
            border: '1.5px solid var(--accent-green)',
          },
          nextStatus: 'completed' as const,
        };
      case 'completed':
        return {
          label: 'Done! 🌱',
          style: {
            background: 'var(--accent-green)',
            color: 'white',
            border: '1.5px solid var(--accent-green)',
          },
          nextStatus: null,
        };
      default:
        return {
          label: 'Do This ›',
          style: {
            background: catColor,
            color: 'white',
            border: `1.5px solid ${catColor}`,
          },
          nextStatus: 'doing' as const,
        };
    }
  };

  const btn = getStatusButton();

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: '20px',
        borderLeft: `4px solid ${catColor}`,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: catBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
            >
              {action.icon || CATEGORY_EMOJIS[action.category]}
            </span>
            <h3 style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.3, margin: 0 }}>
              {action.title}
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            {action.description}
          </p>
        </div>
      </div>

      {/* Impact & Effort */}
      <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Saves badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)' }}>
            Saves ~{action.base_impact_kg_month} kg CO₂e/month
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '12px',
              fontWeight: 600,
              background: effortCfg.bg,
              color: effortCfg.color,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: effortCfg.color,
              }}
            />
            {effortCfg.label}
          </span>
        </div>

        {/* Impact bar */}
        <div className="progress-bar" style={{ height: '6px' }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${impactPct}%`,
              background: `linear-gradient(90deg, ${catColor}, ${catColor}88)`,
            }}
          />
        </div>
      </div>

      {/* Actions row */}
      <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className="btn btn-sm"
          style={{
            ...btn.style,
            flex: 1,
            cursor: 'pointer',
          }}
          onClick={() => onStatusChange(action.id, btn.nextStatus)}
        >
          {btn.label}
        </button>

        {action.tips && action.tips.length > 0 && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setShowTips(!showTips)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
          >
            <Lightbulb size={14} />
            Tips
            {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Tips section */}
      {showTips && action.tips && action.tips.length > 0 && (
        <div
          className="animate-slide-down"
          style={{
            marginTop: '12px',
            padding: '12px 14px',
            background: 'var(--bg-elevated)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            💡 Tips
          </div>
          <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {action.tips.map((tip, i) => (
              <li
                key={i}
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                }}
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

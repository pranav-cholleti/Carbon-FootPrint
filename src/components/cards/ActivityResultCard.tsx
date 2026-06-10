'use client';

import { X } from 'lucide-react';
import type { ActivityLog, EmissionCategory } from '@/types/domain';

// ---------------------------------------------------------------------------
// Category config
// ---------------------------------------------------------------------------

const CATEGORY_META: Record<EmissionCategory, { emoji: string; color: string; bg: string }> = {
  transport: { emoji: '🚗', color: 'var(--cat-transport)', bg: 'var(--accent-blue-bg)' },
  food: { emoji: '🥗', color: 'var(--cat-food)', bg: 'var(--accent-amber-bg)' },
  home: { emoji: '🏠', color: 'var(--cat-home)', bg: 'var(--accent-purple-bg)' },
  consumption: { emoji: '🛍️', color: 'var(--cat-consumption)', bg: 'var(--accent-coral-bg)' },
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityResultCardProps {
  activity: ActivityLog;
  equivalency: string;
  alternative?: string;
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivityResultCard({
  activity,
  equivalency,
  alternative,
  onClose,
}: ActivityResultCardProps) {
  const meta = CATEGORY_META[activity.category];

  return (
    <div
      className="card animate-scale-in"
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '420px',
        width: '100%',
      }}
    >
      {/* Decorative accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: meta.color,
        }}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="btn btn-ghost btn-icon"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          width: '32px',
          height: '32px',
        }}
        aria-label="Close"
      >
        <X style={{ width: '16px', height: '16px' }} />
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            background: meta.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            flexShrink: 0,
          }}
        >
          {meta.emoji}
        </div>
        <div style={{ flex: 1, paddingRight: '28px' }}>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '2px',
            }}
          >
            {activity.description || activity.subcategory.replace(/_/g, ' ')}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {activity.quantity} {activity.unit} · {activity.category}
          </div>
        </div>
      </div>

      {/* CO₂e Value */}
      <div
        style={{
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'center',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            fontSize: '36px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          {activity.co2e_kg < 10
            ? activity.co2e_kg.toFixed(2)
            : activity.co2e_kg < 100
            ? activity.co2e_kg.toFixed(1)
            : Math.round(activity.co2e_kg)}
        </div>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            marginTop: '4px',
          }}
        >
          kg CO₂e
        </div>
      </div>

      {/* Equivalency */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--accent-green-bg)',
          marginBottom: alternative ? '12px' : '0',
        }}
      >
        <span style={{ fontSize: '16px', flexShrink: 0 }}>≈</span>
        <span
          style={{
            fontSize: '13px',
            color: 'var(--accent-green-dark)',
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {equivalency}
        </span>
      </div>

      {/* Alternative comparison nudge */}
      {alternative && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-amber-bg)',
          }}
        >
          <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--accent-amber-dark)',
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            {alternative}
          </span>
        </div>
      )}
    </div>
  );
}

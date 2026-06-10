'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight } from 'lucide-react';

/**
 * Interface representing a brief recommendation item.
 */
interface QuickActionItem {
  icon: string;
  title: string;
  save: string;
  category: 'transport' | 'food' | 'home' | 'consumption';
}

/**
 * Props layout for QuickActionsList.
 */
interface QuickActionsListProps {
  /** Array of top 3 action recommendations to display. */
  topActions: QuickActionItem[];
}

/**
 * QuickActionsList displays a summarized selection of the user's top recommended reduction actions.
 * Links to the full `/actions` catalog view.
 *
 * @param {QuickActionsListProps} props - Component properties.
 * @returns {React.ReactElement} The actions list component.
 */
export default function QuickActionsList({ topActions }: QuickActionsListProps) {
  return (
    <div className="card" style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
        }}
      >
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          <Leaf
            style={{
              width: '16px',
              height: '16px',
              display: 'inline',
              verticalAlign: 'middle',
              marginRight: '6px',
              color: 'var(--accent-green)',
            }}
          />
          Top Actions for You
        </h2>
        <Link
          href="/actions"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent-green)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          See all <ArrowRight style={{ width: '12px', height: '12px' }} />
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {topActions.map((action, i) => (
          <Link
            key={i}
            href="/actions"
            className="card-interactive"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer',
              border: 'none',
              boxShadow: 'none',
              textDecoration: 'none',
              transition: 'background var(--transition-fast)',
            }}
          >
            <span style={{ fontSize: '20px' }}>{action.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {action.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Saves ~{action.save}
              </div>
            </div>
            <ArrowRight
              style={{ width: '16px', height: '16px', color: 'var(--text-tertiary)' }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

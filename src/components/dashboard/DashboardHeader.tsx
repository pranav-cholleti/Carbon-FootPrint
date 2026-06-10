'use client';

import React from 'react';

/**
 * Props layout for DashboardHeader.
 */
interface DashboardHeaderProps {
  /** The public display name of the user. */
  userName: string;
}

/**
 * DashboardHeader renders the greeting and subtitle on the main dashboard view.
 *
 * @param {DashboardHeaderProps} props - Component properties.
 * @returns {React.ReactElement} The header component.
 */
export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <div>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}
      >
        Hi {userName} 👋
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
        Here&apos;s your carbon footprint this month
      </p>
    </div>
  );
}

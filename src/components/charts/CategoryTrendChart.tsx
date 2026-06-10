'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrendDataPoint {
  date: string;
  transport: number;
  food: number;
  home: number;
  consumption: number;
}

interface CategoryTrendChartProps {
  data: TrendDataPoint[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#2A9D8F',
  food: '#F4A261',
  home: '#7B68EE',
  consumption: '#E07A5F',
};

const CATEGORIES = [
  { key: 'transport', label: 'Transport' },
  { key: 'food', label: 'Food' },
  { key: 'home', label: 'Home' },
  { key: 'consumption', label: 'Consumption' },
] as const;

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const total = payload.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-md)',
        minWidth: '160px',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: '13px',
          marginBottom: '8px',
          color: 'var(--text-primary)',
        }}
      >
        {label}
      </div>
      {payload.map((item, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
            padding: '2px 0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: item.color,
                display: 'inline-block',
              }}
            />
            <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
              {item.dataKey}
            </span>
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: '12px' }}>
            {item.value?.toFixed(1)} kg
          </span>
        </div>
      ))}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          marginTop: '6px',
          paddingTop: '6px',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 700,
        }}
      >
        <span>Total</span>
        <span>{total.toFixed(1)} kg</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Legend
// ---------------------------------------------------------------------------

function CustomLegend() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        paddingTop: '4px',
      }}
    >
      {CATEGORIES.map((cat) => (
        <div
          key={cat.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: CATEGORY_COLORS[cat.key],
              display: 'inline-block',
            }}
          />
          {cat.label}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CategoryTrendChart({ data }: CategoryTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-tertiary)',
          fontSize: '14px',
        }}
      >
        <p>📊 No trend data yet. Start logging activities to see your trends!</p>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <defs>
            {CATEGORIES.map((cat) => (
              <linearGradient key={cat.key} id={`gradient-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CATEGORY_COLORS[cat.key]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CATEGORY_COLORS[cat.key]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-light)"
            strokeOpacity={0.7}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border-light)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
            axisLine={{ stroke: 'var(--border-light)' }}
            tickLine={false}
            label={{
              value: 'kg CO₂e',
              angle: -90,
              position: 'insideLeft',
              offset: 20,
              style: { fontSize: 11, fill: 'var(--text-tertiary)', textAnchor: 'middle' },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {CATEGORIES.map((cat) => (
            <Area
              key={cat.key}
              type="monotone"
              dataKey={cat.key}
              stackId="1"
              stroke={CATEGORY_COLORS[cat.key]}
              fill={`url(#gradient-${cat.key})`}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, type PieLabelRenderProps } from 'recharts';
import type { EmissionBreakdown } from '@/types/domain';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_CONFIG = [
  { key: 'transport' as const, label: 'Transport', color: '#2A9D8F', emoji: '🚗' },
  { key: 'food' as const, label: 'Food', color: '#F4A261', emoji: '🥗' },
  { key: 'home' as const, label: 'Home', color: '#7B68EE', emoji: '🏠' },
  { key: 'consumption' as const, label: 'Purchases', color: '#E07A5F', emoji: '🛍️' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EmissionRingChartProps {
  data: EmissionBreakdown;
}

// ---------------------------------------------------------------------------
// Custom center label renderer
// ---------------------------------------------------------------------------

function CenterLabel({ viewBox, total }: { viewBox?: { cx: number; cy: number }; total: number }) {
  if (!viewBox) return null;
  const { cx, cy } = viewBox;

  return (
    <g>
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '28px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          fill: 'var(--text-primary)',
        }}
      >
        {total < 100 ? total.toFixed(1) : Math.round(total)}
      </text>
      <text
        x={cx}
        y={cy + 18}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: '11px',
          fontWeight: 500,
          fill: 'var(--text-tertiary)',
        }}
      >
        kg CO₂e / month
      </text>
    </g>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EmissionRingChart({ data }: EmissionRingChartProps) {
  const total = data.transport + data.food + data.home + data.consumption;

  // Empty state
  if (total === 0) {
    return (
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          textAlign: 'center',
          minHeight: '300px',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🌿</div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          No emissions logged yet
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
          Start logging your activities to see your carbon footprint breakdown here.
        </p>
      </div>
    );
  }

  const chartData = CATEGORY_CONFIG.map((cat) => ({
    name: cat.label,
    value: Math.round(data[cat.key] * 100) / 100,
    color: cat.color,
    emoji: cat.emoji,
  })).filter((d) => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Chart */}
      <div style={{ width: '100%', maxWidth: '280px', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              animationBegin={0}
              animationDuration={1200}
              animationEasing="ease-out"
              stroke="none"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {/* Center Label */}
            <Pie
              data={[{ value: 1 }]}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={0}
              dataKey="value"
              fill="none"
              stroke="none"
              label={(props: PieLabelRenderProps) => <CenterLabel viewBox={(props as unknown as { viewBox: { cx: number; cy: number } }).viewBox} total={total} />}
              isAnimationActive={false}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        {CATEGORY_CONFIG.map((cat) => {
          const value = data[cat.key];
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;

          return (
            <div
              key={cat.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-elevated)',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: cat.color,
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {cat.emoji} {cat.label}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {value < 10 ? value.toFixed(1) : Math.round(value)}
                  </span>
                  {' '}kg · {pct}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

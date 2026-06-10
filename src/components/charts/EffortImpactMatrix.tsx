'use client';

import React, { useState, useEffect } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceArea,
  ReferenceLine,
  Legend,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatrixAction {
  name: string;
  effort: number;
  impact: number;
  category: string;
}

interface EffortImpactMatrixProps {
  actions: MatrixAction[];
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

const EFFORT_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Simple',
  3: 'Medium',
  4: 'Harder',
  5: 'Hard',
};

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadItem {
  payload: MatrixAction;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;
  const catColor = CATEGORY_COLORS[data.category] || '#888';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-md)',
        maxWidth: '240px',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--text-primary)',
          marginBottom: '6px',
        }}
      >
        {data.name}
      </div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Impact: </span>
          <span style={{ fontWeight: 600 }}>{data.impact} kg/mo</span>
        </div>
        <div>
          <span style={{ color: 'var(--text-tertiary)' }}>Effort: </span>
          <span style={{ fontWeight: 600 }}>
            {EFFORT_LABELS[data.effort] || data.effort}
          </span>
        </div>
      </div>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '6px',
          fontSize: '12px',
          color: catColor,
          fontWeight: 600,
          textTransform: 'capitalize',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: catColor,
            display: 'inline-block',
          }}
        />
        {data.category}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Legend
// ---------------------------------------------------------------------------

function CustomLegend() {
  const categories = [
    { key: 'transport', label: 'Transport' },
    { key: 'food', label: 'Food' },
    { key: 'home', label: 'Home' },
    { key: 'consumption', label: 'Consumption' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        paddingTop: '8px',
      }}
    >
      {categories.map((cat) => (
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

export default function EffortImpactMatrix({ actions }: EffortImpactMatrixProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const maxImpact = Math.max(...actions.map((a) => a.impact), 15);
  const midEffort = 3;
  const midImpact = maxImpact / 2;

  return (
    <div>
      {/* Quadrant Labels */}
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {mounted ? (
          <>
          <ResponsiveContainer width="100%" height={320}>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 10 }}
          >
            {/* Quadrant backgrounds */}
            <ReferenceArea
              x1={0.5}
              x2={midEffort}
              y1={midImpact}
              y2={maxImpact + 2}
              fill="#D8F3DC"
              fillOpacity={0.25}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={midEffort}
              x2={5.5}
              y1={midImpact}
              y2={maxImpact + 2}
              fill="#E0F7FA"
              fillOpacity={0.2}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={0.5}
              x2={midEffort}
              y1={0}
              y2={midImpact}
              fill="#FFF3E0"
              fillOpacity={0.2}
              strokeOpacity={0}
            />
            <ReferenceArea
              x1={midEffort}
              x2={5.5}
              y1={0}
              y2={midImpact}
              fill="#FDEAE4"
              fillOpacity={0.15}
              strokeOpacity={0}
            />

            {/* Divider lines */}
            <ReferenceLine
              x={midEffort}
              stroke="var(--border-medium)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />
            <ReferenceLine
              y={midImpact}
              stroke="var(--border-medium)"
              strokeDasharray="4 4"
              strokeOpacity={0.6}
            />

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border-light)"
              strokeOpacity={0.5}
            />
            <XAxis
              type="number"
              dataKey="effort"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(v: number) => EFFORT_LABELS[v] || String(v)}
              tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={{ stroke: 'var(--border-light)' }}
              label={{
                value: 'Effort →',
                position: 'insideBottomRight',
                offset: -5,
                style: { fontSize: 11, fill: 'var(--text-tertiary)' },
              }}
            />
            <YAxis
              type="number"
              dataKey="impact"
              domain={[0, maxImpact + 2]}
              tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
              axisLine={{ stroke: 'var(--border-light)' }}
              tickLine={{ stroke: 'var(--border-light)' }}
              label={{
                value: 'Impact (kg CO₂e/mo) →',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
                style: { fontSize: 11, fill: 'var(--text-tertiary)', textAnchor: 'middle' },
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend content={<CustomLegend />} />
            <Scatter data={actions} fill="#8884d8">
              {actions.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CATEGORY_COLORS[entry.category] || '#888'}
                  r={14}
                  stroke="white"
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant labels overlay */}
        <div
          style={{
            position: 'absolute',
            top: '28px',
            left: '50px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent-green)',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          ⭐ Quick Wins
        </div>
        <div
          style={{
            position: 'absolute',
            top: '28px',
            right: '24px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent-blue)',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          🏗️ Big Projects
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            left: '50px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent-amber)',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Minor Tweaks
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '24px',
            fontSize: '10px',
            fontWeight: 700,
            color: 'var(--accent-coral)',
            opacity: 0.6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            pointerEvents: 'none',
          }}
        >
          Skip for Now
        </div>
        </>
        ) : (
          <div
            style={{
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-tertiary)',
              border: '1px dashed var(--border-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
            }}
          >
            Loading Matrix...
          </div>
        )}
      </div>
    </div>
  );
}

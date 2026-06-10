'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Lightbulb, TrendingDown, TrendingUp, ArrowRight, Sparkles, Flame, BarChart3 } from 'lucide-react';
import DigestCard from '@/components/cards/DigestCard';
import CategoryTrendChart, { TrendDataPoint } from '@/components/charts/CategoryTrendChart';
import { getActivityLogs, getLatestDigest, getStreakCount, getCurrentUser } from '@/lib/store';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategorySummary {
  transport: number;
  food: number;
  home: number;
  consumption: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#2A9D8F',
  food: '#F4A261',
  home: '#7B68EE',
  consumption: '#E07A5F',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  transport: '🚗',
  food: '🍽️',
  home: '🏠',
  consumption: '🛍️',
};

function getWeekRange(weeksAgo: number): { start: Date; end: Date; label: string } {
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() - weeksAgo * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  const label = `Week ${4 - weeksAgo}`;
  return { start, end, label };
}

function computeCategorySummary(
  logs: { category: string; co2e_kg: number }[],
): CategorySummary {
  const summary: CategorySummary = {
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
    total: 0,
  };

  for (const log of logs) {
    const cat = log.category as keyof Omit<CategorySummary, 'total'>;
    if (cat in summary) {
      summary[cat] += log.co2e_kg;
    }
    summary.total += log.co2e_kg;
  }

  return summary;
}

function generateDigest(
  userName: string,
  thisWeek: CategorySummary,
  lastWeek: CategorySummary,
  streak: number,
): string {
  const changePct =
    lastWeek.total > 0
      ? ((thisWeek.total - lastWeek.total) / lastWeek.total) * 100
      : 0;
  const changeDir = changePct < 0 ? 'down' : changePct > 0 ? 'up' : 'steady';

  const categories: (keyof Omit<CategorySummary, 'total'>)[] = ['transport', 'food', 'home', 'consumption'];
  const topCategory = categories.reduce((top, cat) =>
    thisWeek[cat] > thisWeek[top] ? cat : top,
    categories[0]
  );

  const parts: string[] = [];

  parts.push(`Hey ${userName}! 👋`);

  if (changeDir === 'down') {
    parts.push(
      `Great progress this week — your total footprint was ${thisWeek.total.toFixed(1)} kg CO₂e, which is ${Math.abs(changePct).toFixed(0)}% less than last week. That's real improvement! 🎉`,
    );
  } else if (changeDir === 'up') {
    parts.push(
      `Your footprint this week was ${thisWeek.total.toFixed(1)} kg CO₂e — about ${Math.abs(changePct).toFixed(0)}% more than last week. No worries, every week is a fresh start.`,
    );
  } else {
    parts.push(
      `Your footprint this week was ${thisWeek.total.toFixed(1)} kg CO₂e, holding steady from last week. Consistency matters!`,
    );
  }

  parts.push(
    `Your biggest category was ${topCategory} at ${thisWeek[topCategory].toFixed(1)} kg. ${
      topCategory === 'transport'
        ? 'Consider trying public transit or carpooling for a quick win.'
        : topCategory === 'food'
        ? 'Swapping one meat meal for a veggie option makes a noticeable difference.'
        : topCategory === 'home'
        ? 'Check for standby devices and consider more efficient appliance use.'
        : 'Buying secondhand or extending product life helps reduce this.'
    }`,
  );

  if (streak > 0) {
    parts.push(
      `You're on a ${streak}-day logging streak — keep it going! 🔥`,
    );
  }

  parts.push(
    'Small consistent actions compound into meaningful change. Keep tracking! 🌱',
  );

  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function InsightsPage() {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [thisWeekSummary, setThisWeekSummary] = useState<CategorySummary>({
    transport: 0, food: 0, home: 0, consumption: 0, total: 0,
  });
  const [lastWeekSummary, setLastWeekSummary] = useState<CategorySummary>({
    transport: 0, food: 0, home: 0, consumption: 0, total: 0,
  });
  const [digestContent, setDigestContent] = useState('');
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [streak, setStreak] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const userName = user?.display_name || 'there';

    // Compute 4-week trend data
    const trends: TrendDataPoint[] = [];
    for (let i = 3; i >= 0; i--) {
      const range = getWeekRange(i);
      const logs = getActivityLogs({
        startDate: range.start.toISOString(),
        endDate: range.end.toISOString(),
      });
      const summary = computeCategorySummary(logs);
      trends.push({
        date: range.label,
        transport: Math.round(summary.transport * 10) / 10,
        food: Math.round(summary.food * 10) / 10,
        home: Math.round(summary.home * 10) / 10,
        consumption: Math.round(summary.consumption * 10) / 10,
      });
    }
    setTrendData(trends);

    // This week vs last week
    const tw = getWeekRange(0);
    const lw = getWeekRange(1);

    const thisWeekLogs = getActivityLogs({
      startDate: tw.start.toISOString(),
      endDate: tw.end.toISOString(),
    });
    const lastWeekLogs = getActivityLogs({
      startDate: lw.start.toISOString(),
      endDate: lw.end.toISOString(),
    });

    const tws = computeCategorySummary(thisWeekLogs);
    const lws = computeCategorySummary(lastWeekLogs);
    setThisWeekSummary(tws);
    setLastWeekSummary(lws);

    // Check for existing digest
    const existingDigest = getLatestDigest();
    if (existingDigest) {
      setDigestContent(existingDigest.content);
      setWeekStart(existingDigest.period_start);
      setWeekEnd(existingDigest.period_end);
    } else {
      const digest = generateDigest(userName, tws, lws, getStreakCount());
      setDigestContent(digest);
      setWeekStart(tw.start.toISOString());
      setWeekEnd(tw.end.toISOString());
    }

    setStreak(getStreakCount());
    setLoaded(true);
  }, []);

  // Computed deltas
  const deltas = useMemo(() => {
    const categories: { key: keyof Omit<CategorySummary, 'total'>; label: string; emoji: string }[] = [
      { key: 'transport', label: 'Transport', emoji: '🚗' },
      { key: 'food', label: 'Food', emoji: '🍽️' },
      { key: 'home', label: 'Home', emoji: '🏠' },
      { key: 'consumption', label: 'Consumption', emoji: '🛍️' },
    ];

    return categories.map((cat) => {
      const current = thisWeekSummary[cat.key];
      const previous = lastWeekSummary[cat.key];
      const delta = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      return {
        ...cat,
        current,
        previous,
        delta,
        direction: delta < -1 ? 'down' : delta > 1 ? 'up' : 'steady',
      };
    });
  }, [thisWeekSummary, lastWeekSummary]);

  // Top emission source
  const topSource = useMemo(() => {
    type CatKey = 'transport' | 'food' | 'home' | 'consumption';
    const categories: CatKey[] = ['transport', 'food', 'home', 'consumption'];
    let top: CatKey = categories[0];
    for (const cat of categories) {
      if (thisWeekSummary[cat] > thisWeekSummary[top]) {
        top = cat;
      }
    }
    return {
      category: top,
      value: thisWeekSummary[top],
      color: CATEGORY_COLORS[top],
      emoji: CATEGORY_EMOJIS[top],
    };
  }, [thisWeekSummary]);

  if (!loaded) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '300px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '100px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          <Lightbulb size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--accent-green)' }} />{' '}
          Insights
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Understand your patterns and find opportunities
        </p>
      </div>

      {/* Streak Banner */}
      {streak > 0 && (
        <div
          className="card animate-fade-in"
          style={{
            padding: '12px 16px',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, var(--accent-green-bg), var(--accent-amber-bg))',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <Flame size={20} style={{ color: 'var(--accent-amber-dark)' }} />
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {streak}-day logging streak! Keep it going 🔥
          </span>
        </div>
      )}

      {/* AI Digest Card */}
      <div style={{ marginBottom: '20px' }} className="animate-fade-in">
        <DigestCard
          content={digestContent}
          weekStart={weekStart}
          weekEnd={weekEnd}
        />
      </div>

      {/* Top Emission Source */}
      <div
        className="card animate-fade-in delay-100"
        style={{
          padding: '16px 20px',
          marginBottom: '16px',
          borderLeft: `4px solid ${topSource.color}`,
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '6px' }}>
          <Sparkles size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Top Emission Source This Week
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>{topSource.emoji}</span>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
              {topSource.category}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {topSource.value.toFixed(1)} kg CO₂e this week
            </div>
          </div>
        </div>
      </div>

      {/* Delta Cards */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
          Compared to Last Week
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '10px',
          }}
        >
          {deltas.map((d) => (
            <div
              key={d.key}
              className="card animate-fade-in"
              style={{
                padding: '14px',
                borderTop: `3px solid ${CATEGORY_COLORS[d.key]}`,
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>
                {d.emoji} {d.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {d.current.toFixed(1)}
                <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-tertiary)' }}> kg</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color:
                    d.direction === 'down'
                      ? 'var(--accent-green)'
                      : d.direction === 'up'
                      ? 'var(--accent-amber-dark)'
                      : 'var(--text-tertiary)',
                }}
              >
                {d.direction === 'down' ? (
                  <TrendingDown size={14} />
                ) : d.direction === 'up' ? (
                  <TrendingUp size={14} />
                ) : null}
                {d.direction === 'steady'
                  ? 'Steady'
                  : `${Math.abs(d.delta).toFixed(0)}% ${d.direction === 'down' ? 'less' : 'more'}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Trend Chart */}
      <div className="card animate-fade-in delay-200" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BarChart3 size={16} style={{ color: 'var(--accent-green)' }} />
          <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
            4-Week Category Trends
          </h2>
        </div>
        <CategoryTrendChart data={trendData} />
      </div>

      {/* CTA to Simulate */}
      <Link
        href="/insights/simulate"
        className="card card-interactive animate-fade-in delay-300"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 20px',
          textDecoration: 'none',
          background: 'linear-gradient(135deg, var(--accent-green-bg), var(--bg-card))',
          borderLeft: '4px solid var(--accent-green)',
        }}
      >
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            🔮 What If Simulator
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            See how lifestyle changes would affect your footprint
          </div>
        </div>
        <ArrowRight size={20} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
      </Link>

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

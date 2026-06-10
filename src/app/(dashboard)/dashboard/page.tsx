'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Flame,
  ArrowRight,
  Leaf,
  Users,
} from 'lucide-react';
import EmissionRingChart from '@/components/charts/EmissionRingChart';
import ActivityLogForm from '@/components/forms/ActivityLogForm';
import ActivityResultCard from '@/components/cards/ActivityResultCard';
import {
  getCurrentUser,
  getProfile,
  getActivitySummary,
  getStreakCount,
  initializeSeedData,
} from '@/lib/store';
import type { ActivityLog, EmissionBreakdown } from '@/types/domain';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function getMonthRange(offset: number = 0): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + offset;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Skeleton components
// ---------------------------------------------------------------------------

function SkeletonBlock({ width, height }: { width: string; height: string }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 'var(--radius-md)' }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SkeletonBlock width="60%" height="28px" />
      <SkeletonBlock width="100%" height="320px" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <SkeletonBlock width="100%" height="120px" />
        <SkeletonBlock width="100%" height="120px" />
      </div>
      <SkeletonBlock width="100%" height="200px" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static action recommendations
// ---------------------------------------------------------------------------

const TOP_ACTIONS = [
  {
    icon: '🌱',
    title: 'Try 2 meat-free days per week',
    save: '18 kg/mo',
    category: 'food' as const,
  },
  {
    icon: '🚶',
    title: 'Walk or cycle trips under 3 km',
    save: '8 kg/mo',
    category: 'transport' as const,
  },
  {
    icon: '💡',
    title: 'Switch all lights to LED',
    save: '5 kg/mo',
    category: 'home' as const,
  },
];

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [resultLog, setResultLog] = useState<{
    activity: ActivityLog;
    equivalency: string;
    alternative: string;
  } | null>(null);

  // Data
  const [currentBreakdown, setCurrentBreakdown] = useState<EmissionBreakdown>({
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
  });
  const [currentTotal, setCurrentTotal] = useState(0);
  const [lastMonthTotal, setLastMonthTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const [regionLabel, setRegionLabel] = useState('your region');

  // Load data
  const loadData = useCallback(() => {
    initializeSeedData();

    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const profile = getProfile();
    if (profile && !user.onboarding_completed) {
      router.push('/onboarding');
      return;
    }

    setUserName(user.display_name);

    if (profile) {
      const regionMap: Record<string, string> = {
        'IN': 'India',
        'IN-TG': 'Telangana',
        'IN-KA': 'Karnataka',
        'IN-MH': 'Maharashtra',
        'US': 'the US',
        'UK': 'the UK',
        'EU': 'Europe',
      };
      setRegionLabel(regionMap[profile.region_code] ?? profile.region_code);
    }

    // Current month summary
    const thisMonth = getMonthRange(0);
    const summary = getActivitySummary(thisMonth.start, thisMonth.end);
    setCurrentBreakdown(summary.breakdown);
    setCurrentTotal(summary.total_co2e_kg);

    // Last month summary
    const lastMonth = getMonthRange(-1);
    const lastSummary = getActivitySummary(lastMonth.start, lastMonth.end);
    setLastMonthTotal(lastSummary.total_co2e_kg);

    // Streak
    setStreak(getStreakCount());

    setLoading(false);
    setTimeout(() => setMounted(true), 50);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('log') === 'true') {
        setShowLogForm(true);
        // Clear the query parameter so reloading doesn't keep opening it
        const newUrl = window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      }
    }
  }, []);

  // Computed values
  const changePct = useMemo(() => {
    if (lastMonthTotal === 0) return 0;
    return Math.round(((currentTotal - lastMonthTotal) / lastMonthTotal) * 100);
  }, [currentTotal, lastMonthTotal]);

  const annualProjection = useMemo(() => {
    return (currentTotal * 12) / 1000; // tonnes
  }, [currentTotal]);

  const TARGET_TONNES = 2.3; // 1.5°C pathway

  const handleFormSubmit = useCallback(
    (log: ActivityLog, equivalency: string, alternative: string) => {
      setShowLogForm(false);
      setResultLog({ activity: log, equivalency, alternative });
      // Reload data
      loadData();
    },
    [loadData],
  );

  const closeResult = useCallback(() => {
    setResultLog(null);
  }, []);

  // Loading skeleton
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={mounted ? 'animate-fade-in' : 'opacity-0'}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* ── Greeting & Monthly Total ─────────────────────────────── */}
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

      {/* ── Monthly Total Hero Card ─────────────────────────────── */}
      <div
        className="card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 50%, #40916C 100%)',
          border: 'none',
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.8 }}>
            This month&apos;s footprint
          </span>
          {changePct !== 0 && (
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: changePct < 0 ? 'rgba(216,243,220,0.2)' : 'rgba(255,200,200,0.2)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              {changePct < 0 ? (
                <TrendingDown style={{ width: '14px', height: '14px' }} />
              ) : (
                <TrendingUp style={{ width: '14px', height: '14px' }} />
              )}
              {Math.abs(changePct)}% vs last month
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: '42px',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.1,
          }}
        >
          {currentTotal < 100
            ? currentTotal.toFixed(1)
            : Math.round(currentTotal).toLocaleString()}
          <span style={{ fontSize: '16px', fontWeight: 500, opacity: 0.7, marginLeft: '6px' }}>
            kg CO₂e
          </span>
        </div>
      </div>

      {/* ── Ring Chart ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: '24px' }}>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          Breakdown by category
        </h2>
        <EmissionRingChart data={currentBreakdown} />
      </div>

      {/* ── Stats Row ────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Annual Projection */}
        <div className="card" style={{ padding: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              marginBottom: '8px',
            }}
          >
            Annual Projection
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
              lineHeight: 1.2,
            }}
          >
            {annualProjection < 10 ? annualProjection.toFixed(1) : Math.round(annualProjection)}
            <span
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginLeft: '4px',
              }}
            >
              tonnes
            </span>
          </div>
          {/* Target line */}
          <div style={{ marginTop: '12px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>1.5°C target</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                {TARGET_TONNES}t
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, (TARGET_TONNES / Math.max(annualProjection, 0.1)) * 100)}%`,
                  background:
                    annualProjection <= TARGET_TONNES
                      ? 'var(--accent-green)'
                      : 'linear-gradient(90deg, var(--accent-green), var(--accent-amber))',
                }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="card" style={{ padding: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              marginBottom: '8px',
            }}
          >
            Logging Streak
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Flame
              style={{
                width: '28px',
                height: '28px',
                color: streak > 0 ? 'var(--accent-amber)' : 'var(--text-tertiary)',
              }}
            />
            <span
              style={{
                fontSize: '26px',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
              }}
            >
              {streak}
            </span>
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          {streak > 0 ? (
            <div
              className="badge badge-amber"
              style={{ marginTop: '10px', fontSize: '11px' }}
            >
              🔥 {streak >= 7 ? 'On fire!' : 'Keep it up!'}
            </div>
          ) : (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--text-tertiary)',
                margin: '10px 0 0',
              }}
            >
              Log today to start a streak!
            </p>
          )}
        </div>
      </div>

      {/* ── Top Actions ──────────────────────────────────────────── */}
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
          {TOP_ACTIONS.map((action, i) => (
            <div
              key={i}
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
            </div>
          ))}
        </div>
      </div>

      {/* ── Regional Comparison ────────────────────────────────────── */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Users
            style={{ width: '16px', height: '16px', color: 'var(--accent-purple)' }}
          />
          <h2
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            You vs. similar households in {regionLabel}
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Your bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--accent-green)' }}>You</span>
              <span
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}
              >
                {currentTotal < 100 ? currentTotal.toFixed(1) : Math.round(currentTotal)} kg
              </span>
            </div>
            <div className="progress-bar" style={{ height: '14px' }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${Math.min(100, (currentTotal / 500) * 100)}%`,
                  background: 'var(--accent-green)',
                }}
              />
            </div>
          </div>
          {/* Regional average bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                marginBottom: '4px',
              }}
            >
              <span style={{ color: 'var(--text-tertiary)' }}>Regional average</span>
              <span
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}
              >
                ~380 kg
              </span>
            </div>
            <div className="progress-bar" style={{ height: '14px' }}>
              <div
                style={{
                  width: `${Math.min(100, (380 / 500) * 100)}%`,
                  height: '100%',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--border-medium)',
                }}
              />
            </div>
          </div>
        </div>
        {currentTotal < 380 && (
          <div
            className="badge badge-green"
            style={{ marginTop: '12px', fontSize: '11px' }}
          >
            🎉 {Math.round(((380 - currentTotal) / 380) * 100)}% below average — great job!
          </div>
        )}
      </div>

      {/* ── FAB ──────────────────────────────────────────────────── */}
      <button
        className="fab animate-scale-in"
        onClick={() => setShowLogForm(true)}
        aria-label="Log new activity"
      >
        <Plus style={{ width: '24px', height: '24px' }} />
      </button>

      {/* ── Activity Log Form Modal ──────────────────────────────── */}
      <ActivityLogForm
        isOpen={showLogForm}
        onClose={() => setShowLogForm(false)}
        onSubmit={handleFormSubmit}
      />

      {/* ── Activity Result Overlay ──────────────────────────────── */}
      {resultLog && (
        <div className="modal-overlay" onClick={closeResult}>
          <div onClick={(e) => e.stopPropagation()}>
            <ActivityResultCard
              activity={resultLog.activity}
              equivalency={resultLog.equivalency}
              alternative={resultLog.alternative || undefined}
              onClose={closeResult}
            />
          </div>
        </div>
      )}
    </div>
  );
}

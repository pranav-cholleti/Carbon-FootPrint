'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Plus, Flame, Users } from 'lucide-react';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MonthlyHeroCard from '@/components/dashboard/MonthlyHeroCard';
import QuickActionsList from '@/components/dashboard/QuickActionsList';
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

// Dynamically import the Recharts-based chart with SSR disabled to optimize page loads and prevent hydration errors
const EmissionRingChart = dynamic(() => import('@/components/charts/EmissionRingChart'), {
  ssr: false,
  loading: () => (
    <div
      className="skeleton"
      style={{ width: '100%', height: '260px', borderRadius: 'var(--radius-md)' }}
    />
  ),
});

/**
 * Calculates start and end ISO strings representing a month range relative to the current date.
 *
 * @param {number} [offset=0] - Month offset (e.g. -1 for previous month).
 * @returns {object} An object containing start and end ISO strings.
 */
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

/**
 * Renders a loading block skeleton for the dashboard shell.
 *
 * @returns {React.ReactElement} The loading skeleton.
 */
function DashboardSkeleton() {
  const skeletonStyle = { borderRadius: 'var(--radius-md)', background: 'var(--border-light)' };
  return (
    <div
      className="animate-fade-in"
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      <div className="skeleton" style={{ width: '60%', height: '28px', ...skeletonStyle }} />
      <div className="skeleton" style={{ width: '100%', height: '320px', ...skeletonStyle }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="skeleton" style={{ width: '100%', height: '120px', ...skeletonStyle }} />
        <div className="skeleton" style={{ width: '100%', height: '120px', ...skeletonStyle }} />
      </div>
      <div className="skeleton" style={{ width: '100%', height: '200px', ...skeletonStyle }} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static top recommendations for short summary panel
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

const TARGET_TONNES = 2.3; // 1.5°C pathway target

/**
 * DashboardPage component represents the primary authenticated landing dashboard view.
 * Coordinates data fetching, monthly aggregation summaries, streak counting,
 * and handles opening log modals and displaying log results.
 *
 * @returns {React.ReactElement} The dashboard layout view.
 */
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

  // Aggregated data states
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

  /**
   * Initializes seed data and loads all dashboard storage states.
   */
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

    // Load current month metrics
    const thisMonth = getMonthRange(0);
    const summary = getActivitySummary(thisMonth.start, thisMonth.end);
    setCurrentBreakdown(summary.breakdown);
    setCurrentTotal(summary.total_co2e_kg);

    // Load previous month metrics
    const lastMonth = getMonthRange(-1);
    const lastSummary = getActivitySummary(lastMonth.start, lastMonth.end);
    setLastMonthTotal(lastSummary.total_co2e_kg);

    // Load logging streak
    setStreak(getStreakCount());

    setLoading(false);
    setTimeout(() => setMounted(true), 50);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Read URL query parameters to trigger the Activity Log form modal on redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('log') === 'true') {
        setShowLogForm(true);
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
    return (currentTotal * 12) / 1000;
  }, [currentTotal]);

  /**
   * Callback fired when the ActivityLogForm registers a new entry.
   */
  const handleFormSubmit = useCallback(
    (log: ActivityLog, equivalency: string, alternative: string) => {
      setShowLogForm(false);
      setResultLog({ activity: log, equivalency, alternative });
      loadData();
    },
    [loadData]
  );

  /**
   * Callback fired to close the activity success card.
   */
  const closeResult = useCallback(() => {
    setResultLog(null);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={mounted ? 'animate-fade-in' : 'opacity-0'}
      style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
    >
      {/* Dashboard Greeting Header */}
      <DashboardHeader userName={userName} />

      {/* Monthly Hero Emissions Summary Card */}
      <MonthlyHeroCard currentTotal={currentTotal} changePct={changePct} />

      {/* Category Breakdown Animated Ring Chart */}
      <div className="card" style={{ padding: '24px' }}>
        <h2
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}
        >
          Breakdown by category
        </h2>
        <EmissionRingChart data={currentBreakdown} />
      </div>

      {/* Numerical Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* Annual Projection Comparison */}
        <div className="card" style={{ padding: '16px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Annual Projection
          </span>
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

        {/* Logging Streaks Flame badge */}
        <div className="card" style={{ padding: '16px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              display: 'block',
              marginBottom: '8px',
            }}
          >
            Logging Streak
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          {streak > 0 ? (
            <div className="badge badge-amber" style={{ marginTop: '10px', fontSize: '11px' }}>
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

      {/* Top action list recommendations panel */}
      <QuickActionsList topActions={TOP_ACTIONS} />

      {/* Cohort comparison comparison stats bar */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Users style={{ width: '16px', height: '16px', color: 'var(--accent-purple)' }} />
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
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}
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
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
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
          <div className="badge badge-green" style={{ marginTop: '12px', fontSize: '11px' }}>
            🎉 {Math.round(((380 - currentTotal) / 380) * 100)}% below average — great job!
          </div>
        )}
      </div>

      {/* Floating Action Button for Logging */}
      <button
        className="fab animate-scale-in"
        onClick={() => setShowLogForm(true)}
        aria-label="Log new activity"
      >
        <Plus style={{ width: '24px', height: '24px' }} />
      </button>

      {/* Log Form modal overlay */}
      <ActivityLogForm
        isOpen={showLogForm}
        onClose={() => setShowLogForm(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Result badge popup */}
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

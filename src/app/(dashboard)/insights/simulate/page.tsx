'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TreePine, TrendingDown, Target, Plus } from 'lucide-react';
import { getProfile, getCurrentUser, addGoal } from '@/lib/store';

// ---------------------------------------------------------------------------
// Scenario Types
// ---------------------------------------------------------------------------

interface Scenario {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: 'transport' | 'food' | 'home' | 'consumption';
  calculateSavings: (baseline: number) => {
    saved_kg_month: number;
    saved_kg_year: number;
    equivalent_trees: number;
    pct_reduction: number;
  };
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

const SCENARIOS: Scenario[] = [
  {
    id: 'veg_2_days',
    title: 'Went vegetarian 2 days/week',
    description: 'Replace meat meals with vegetarian options two days a week. Indian cuisine makes this especially easy!',
    emoji: '🥬',
    category: 'food',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.08;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'transit_commute',
    title: 'Switched commute to public transit',
    description: 'Take the bus or train to work instead of driving. Saves money too!',
    emoji: '🚆',
    category: 'transport',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.12;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'reduce_beef',
    title: 'Reduced beef to once a week',
    description: 'Beef has the highest carbon footprint of any food. Cutting it to once weekly makes a huge impact.',
    emoji: '🥩',
    category: 'food',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.06;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'led_lighting',
    title: 'Switched to LED lighting',
    description: 'Replace all incandescent and CFL bulbs with LEDs. One-time effort, permanent savings.',
    emoji: '💡',
    category: 'home',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.03;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'secondhand_shopping',
    title: 'Started buying secondhand',
    description: 'Buy clothing and electronics secondhand instead of new. Great for your wallet and the planet.',
    emoji: '♻️',
    category: 'consumption',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.04;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'carpool_work',
    title: 'Carpooled to work 3 days/week',
    description: 'Share your ride with a colleague. Cuts your per-person driving emissions in half those days.',
    emoji: '🚗',
    category: 'transport',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.07;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
  {
    id: 'reduce_ac',
    title: 'Set AC 4°C higher',
    description: 'Raising your AC from 20°C to 24°C can cut cooling energy by 24%. Use a ceiling fan to stay comfortable.',
    emoji: '❄️',
    category: 'home',
    calculateSavings: (baseline) => {
      const saved = baseline * 0.05;
      return {
        saved_kg_month: Math.round(saved * 10) / 10,
        saved_kg_year: Math.round(saved * 12 * 10) / 10,
        equivalent_trees: Math.round((saved * 12) / 22),
        pct_reduction: Math.round((saved / baseline) * 100),
      };
    },
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  transport: '#2A9D8F',
  food: '#F4A261',
  home: '#7B68EE',
  consumption: '#E07A5F',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getFutureDateISO(daysOffset: number): string {
  return new Date(Date.now() + daysOffset * 24 * 60 * 60 * 1000).toISOString();
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function SimulatePage() {
  const router = useRouter();
  const [baseline, setBaseline] = useState(380);
  const [addedGoals, setAddedGoals] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const profile = getProfile();
    if (profile?.estimated_baseline_kg_month) {
      setBaseline(profile.estimated_baseline_kg_month);
    }
  }, []);

  const handleAddGoal = (scenario: Scenario) => {
    const user = getCurrentUser();
    const userId = user?.id || 'user';
    const savings = scenario.calculateSavings(baseline);

    addGoal({
      user_id: userId,
      title: scenario.title,
      description: scenario.description,
      target_reduction_pct: savings.pct_reduction,
      baseline_kg_month: baseline,
      target_kg_month: baseline - savings.saved_kg_month,
      category: scenario.category,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: getFutureDateISO(90),
    });

    setAddedGoals((prev) => new Set(prev).add(scenario.id));
    setToast(`"${scenario.title}" added as a goal!`);
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate total if all are applied
  const totalSavings = SCENARIOS.reduce((sum, s) => {
    return sum + s.calculateSavings(baseline).saved_kg_month;
  }, 0);

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => router.back()}
          className="btn btn-sm btn-ghost"
          style={{ marginBottom: '12px', cursor: 'pointer', padding: '6px 8px' }}
        >
          <ArrowLeft size={16} /> Back to Insights
        </button>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          🔮 What if you...
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          See how small changes could reduce your {baseline} kg CO₂e/month footprint
        </p>
      </div>

      {/* Summary Card */}
      <div
        className="card animate-fade-in"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--accent-green-bg), var(--bg-card))',
          borderLeft: '4px solid var(--accent-green)',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '4px' }}>
          If you did everything below
        </div>
        <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-green)' }}>
          -{totalSavings.toFixed(0)} kg/month
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          That&apos;s {Math.round((totalSavings / baseline) * 100)}% of your current footprint · ~{Math.round(totalSavings * 12 / 22)} trees worth/year
        </div>
      </div>

      {/* Scenario Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {SCENARIOS.map((scenario, i) => {
          const savings = scenario.calculateSavings(baseline);
          const isAdded = addedGoals.has(scenario.id);
          const catColor = CATEGORY_COLORS[scenario.category];

          return (
            <div
              key={scenario.id}
              className="card animate-fade-in"
              style={{
                padding: '20px',
                borderLeft: `4px solid ${catColor}`,
                opacity: 0,
                animation: `fadeIn 0.4s ease-out ${i * 80}ms forwards`,
              }}
            >
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '24px' }}>{scenario.emoji}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                    {scenario.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '2px 0 0', lineHeight: 1.4 }}>
                    {scenario.description}
                  </p>
                </div>
              </div>

              {/* Before/After comparison */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '12px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                    Current
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {baseline}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-tertiary)' }}> kg/mo</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <TrendingDown size={18} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)' }}>
                    -{savings.saved_kg_month} kg
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>
                    After
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {(baseline - savings.saved_kg_month).toFixed(0)}
                    <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-tertiary)' }}> kg/mo</span>
                  </div>
                </div>
              </div>

              {/* Annual savings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}>
                  <Target size={13} />
                  <span><strong>{savings.saved_kg_year} kg</strong> saved/year</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-green)' }}>
                  <TreePine size={13} />
                  <span>≈ <strong>{savings.equivalent_trees}</strong> trees planted</span>
                </div>
              </div>

              {/* CTA */}
              <button
                className={`btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => !isAdded && handleAddGoal(scenario)}
                disabled={isAdded}
                style={{
                  width: '100%',
                  cursor: isAdded ? 'default' : 'pointer',
                  opacity: isAdded ? 0.7 : 1,
                }}
              >
                {isAdded ? (
                  <>✅ Added as Goal</>
                ) : (
                  <>
                    <Plus size={14} />
                    Add This as a Goal
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          🎯 {toast}
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

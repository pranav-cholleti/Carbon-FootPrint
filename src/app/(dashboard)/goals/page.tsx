'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus, X } from 'lucide-react';
import GoalProgressCard, { GoalData } from '@/components/cards/GoalProgressCard';
import { getGoals, addGoal, updateGoal, getCurrentUser, getProfile, getActivitySummary } from '@/lib/store';
import type { Goal } from '@/types/domain';

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formReduction, setFormReduction] = useState(15);
  const [formMonths, setFormMonths] = useState(3);
  const [formCategory, setFormCategory] = useState<'overall' | 'transport' | 'food' | 'home' | 'consumption'>('overall');

  const loadGoals = useCallback(() => {
    const allGoals = getGoals();
    setGoals(allGoals);
    setLoaded(true);
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const handleCreateGoal = () => {
    if (!formTitle.trim()) return;

    const user = getCurrentUser();
    const userId = user?.id || 'user';
    const profile = getProfile();
    const baseline = profile?.estimated_baseline_kg_month || 380;

    const targetKg = baseline * (1 - formReduction / 100);

    addGoal({
      user_id: userId,
      title: formTitle.trim(),
      description: '',
      target_reduction_pct: formReduction,
      baseline_kg_month: baseline,
      target_kg_month: Math.round(targetKg),
      category: formCategory,
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + formMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    setFormTitle('');
    setFormReduction(15);
    setFormMonths(3);
    setFormCategory('overall');
    setShowCreateForm(false);
    loadGoals();
  };

  const handleStatusChange = (goalId: string, status: string) => {
    updateGoal(goalId, { status: status as Goal['status'] });
    loadGoals();
  };

  // Separate active and inactive goals
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const abandonedGoals = goals.filter((g) => g.status === 'abandoned');
  const inactiveGoals = [...completedGoals, ...abandonedGoals];

  // Compute current kg for each goal (from recent activity summary)
  const enrichGoal = (goal: Goal): GoalData => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const summary = getActivitySummary(monthAgo.toISOString(), now.toISOString());

    let currentKg = summary.total_co2e_kg;
    if (goal.category !== 'overall' && goal.category in summary.breakdown) {
      currentKg = summary.breakdown[goal.category as keyof typeof summary.breakdown];
    }

    // Scale to monthly (based on actual days)
    const daysCovered = summary.period_days;
    const monthlyEstimate = daysCovered > 0 ? (currentKg / daysCovered) * 30 : goal.baseline_kg_month;

    return {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target_reduction_pct: goal.target_reduction_pct,
      baseline_kg_month: goal.baseline_kg_month,
      target_kg_month: goal.target_kg_month,
      current_kg_month: Math.round(monthlyEstimate),
      status: goal.status as GoalData['status'],
      start_date: goal.start_date,
      end_date: goal.end_date,
      category: goal.category,
    };
  };

  if (!loaded) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: '60px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '200px', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
            <Target size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--accent-green)' }} />{' '}
            Goals
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            Track your reduction targets
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setShowCreateForm(true)}
          style={{ cursor: 'pointer' }}
        >
          <Plus size={16} />
          New Goal
        </button>
      </div>

      {/* Create Goal Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Create New Goal</h2>
              <button
                className="btn btn-icon btn-ghost"
                onClick={() => setShowCreateForm(false)}
                style={{ cursor: 'pointer', width: '32px', height: '32px' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label className="input-label">Goal Title</label>
                <input
                  className="input"
                  type="text"
                  placeholder="e.g., Reduce food emissions by 20%"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <label className="input-label">Category</label>
                <select
                  className="select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as typeof formCategory)}
                >
                  <option value="overall">🌍 Overall</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="food">🍽️ Food</option>
                  <option value="home">🏠 Home</option>
                  <option value="consumption">🛍️ Consumption</option>
                </select>
              </div>

              {/* Reduction slider */}
              <div>
                <label className="input-label">
                  Target Reduction: <strong style={{ color: 'var(--accent-green)', fontSize: '16px' }}>{formReduction}%</strong>
                </label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={formReduction}
                  onChange={(e) => setFormReduction(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-green)',
                    height: '6px',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>5%</span>
                  <span>25%</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Timeframe */}
              <div>
                <label className="input-label">
                  Timeframe: <strong>{formMonths} month{formMonths > 1 ? 's' : ''}</strong>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  step={1}
                  value={formMonths}
                  onChange={(e) => setFormMonths(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--accent-green)',
                    height: '6px',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>1 mo</span>
                  <span>6 mo</span>
                  <span>12 mo</span>
                </div>
              </div>

              {/* Submit */}
              <button
                className="btn btn-primary btn-lg"
                onClick={handleCreateGoal}
                disabled={!formTitle.trim()}
                style={{
                  cursor: formTitle.trim() ? 'pointer' : 'not-allowed',
                  opacity: formTitle.trim() ? 1 : 0.5,
                  marginTop: '8px',
                }}
              >
                <Target size={18} />
                Create Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-secondary)' }}>
            Active Goals ({activeGoals.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeGoals.map((goal, i) => (
              <div
                key={goal.id}
                style={{
                  opacity: 0,
                  animation: `fadeIn 0.4s ease-out ${i * 80}ms forwards`,
                }}
              >
                <GoalProgressCard
                  goal={enrichGoal(goal)}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <div
          className="card animate-fade-in"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Set a meaningful target
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '320px',
              margin: '0 auto 20px',
            }}
          >
            Even a 10% reduction from your baseline makes a real difference.
            Start with something achievable and build from there.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateForm(true)}
            style={{ cursor: 'pointer' }}
          >
            <Plus size={16} />
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Only "no active goals" but has some goals */}
      {activeGoals.length === 0 && goals.length > 0 && (
        <div
          className="card animate-fade-in"
          style={{
            padding: '32px 24px',
            textAlign: 'center',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏁</div>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            No active goals right now. Ready for a new challenge?
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowCreateForm(true)}
            style={{ cursor: 'pointer' }}
          >
            <Plus size={14} />
            New Goal
          </button>
        </div>
      )}

      {/* Completed / Abandoned Goals */}
      {inactiveGoals.length > 0 && (
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-tertiary)' }}>
            Past Goals ({inactiveGoals.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inactiveGoals.map((goal) => (
              <GoalProgressCard key={goal.id} goal={enrichGoal(goal)} />
            ))}
          </div>
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

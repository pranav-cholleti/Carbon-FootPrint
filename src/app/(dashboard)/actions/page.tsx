'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Filter, Zap, BarChart3 } from 'lucide-react';
import { ACTIONS_LIBRARY } from '@/lib/actions-engine/library';
import ActionCard, { ActionStatus } from '@/components/cards/ActionCard';
import type { Action } from '@/types/domain';

// Dynamically import the heavy chart library to optimize initial bundle size and avoid SSR hydration warnings
const EffortImpactMatrix = dynamic(() => import('@/components/charts/EffortImpactMatrix'), {
  ssr: false,
  loading: () => (
    <div
      className="skeleton"
      style={{ width: '100%', height: '300px', borderRadius: 'var(--radius-md)' }}
    />
  ),
});

/**
 * Representational tab keys for filtering actions.
 */
type TabCategory = 'all' | 'transport' | 'food' | 'home' | 'consumption';

/**
 * Key-value map representing the user's status for each action.
 */
interface UserActionMap {
  [actionId: string]: ActionStatus;
}

/**
 * ActionsPage component rendering the personalized action library and the effort-impact matrix.
 *
 * @returns {React.ReactElement} The rendered Actions view.
 */
export default function ActionsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [userActions, setUserActions] = useState<UserActionMap>({});
  const [showChart, setShowChart] = useState(true);

  // Load saved action statuses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('imprint_user_actions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const map: UserActionMap = {};
          parsed.forEach((ua: { action_id: string; status: ActionStatus }) => {
            map[ua.action_id] = ua.status;
          });
          setUserActions(map);
        } else {
          setUserActions(parsed);
        }
      }
    } catch (e) {
      console.error('[ActionsPage] Failed to parse saved user actions:', e);
    }
  }, []);

  /**
   * Persists action updates back into localStorage matching the unified store format.
   *
   * @param {UserActionMap} actions - The updated map of action statuses.
   */
  const saveActions = useCallback((actions: UserActionMap) => {
    const userId = localStorage.getItem('imprint_current_user_id') || 'user';
    try {
      const existing = JSON.parse(localStorage.getItem('imprint_user_actions') || '[]');
      const existingArray = Array.isArray(existing) ? existing : [];

      Object.entries(actions).forEach(([actionId, status]) => {
        const idx = existingArray.findIndex((ua: { action_id: string }) => ua.action_id === actionId);
        if (idx >= 0) {
          existingArray[idx] = {
            ...existingArray[idx],
            status,
            updated_at: new Date().toISOString(),
          };
        } else if (status) {
          existingArray.push({
            id: `ua_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            user_id: userId,
            action_id: actionId,
            status,
            started_at: status === 'doing' ? new Date().toISOString() : undefined,
            completed_at: status === 'completed' ? new Date().toISOString() : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });

      localStorage.setItem('imprint_user_actions', JSON.stringify(existingArray));
    } catch (e) {
      console.error('[ActionsPage] Failed to save user actions:', e);
      localStorage.setItem('imprint_action_statuses', JSON.stringify(actions));
    }
  }, []);

  /**
   * Callback triggered when the status of an action changes (e.g., clicking "Do This" or "Done").
   *
   * @param {string} actionId - The ID of the modified action.
   * @param {ActionStatus} newStatus - The new state of the action.
   */
  const handleStatusChange = useCallback(
    (actionId: string, newStatus: ActionStatus) => {
      setUserActions((prev) => {
        const updated = { ...prev, [actionId]: newStatus };
        saveActions(updated);
        return updated;
      });
    },
    [saveActions]
  );

  // Filter actions based on the active tab selection
  const filteredActions =
    activeTab === 'all'
      ? ACTIONS_LIBRARY
      : ACTIONS_LIBRARY.filter((a) => a.category === activeTab);

  // Sort filtered actions by impact-to-effort priority ratio
  const sortedActions = [...filteredActions].sort((a, b) => {
    const scoreA = a.base_impact_kg_month / a.effort_score;
    const scoreB = b.base_impact_kg_month / b.effort_score;
    return scoreB - scoreA;
  });

  // Map data to structure required by the EffortImpactMatrix component
  const matrixData = filteredActions.map((a) => ({
    name: a.title,
    effort: a.effort_score,
    impact: a.base_impact_kg_month,
    category: a.category,
  }));

  const tabs: { key: TabCategory; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '🌍' },
    { key: 'transport', label: 'Transport', emoji: '🚗' },
    { key: 'food', label: 'Food', emoji: '🍽️' },
    { key: 'home', label: 'Home', emoji: '🏠' },
    { key: 'consumption', label: 'Stuff', emoji: '🛍️' },
  ];

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          <Zap
            size={22}
            style={{
              display: 'inline',
              verticalAlign: 'text-bottom',
              color: 'var(--accent-green)',
            }}
          />{' '}
          Actions
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Discover high-impact ways to reduce your footprint
        </p>
      </div>

      {/* Tab Filter Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '16px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Matrix Toggle Button */}
      <button
        onClick={() => setShowChart(!showChart)}
        className="btn btn-sm btn-ghost"
        style={{
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          color: 'var(--accent-green)',
          fontSize: '13px',
        }}
      >
        <BarChart3 size={14} />
        {showChart ? 'Hide' : 'Show'} Impact Matrix
      </button>

      {/* Effort/Impact Matrix Graphic */}
      {showChart && (
        <div className="card" style={{ padding: '16px 8px', marginBottom: '20px' }}>
          <h2
            style={{
              fontSize: '14px',
              fontWeight: 700,
              margin: '0 0 4px',
              paddingLeft: '12px',
            }}
          >
            Effort vs Impact
          </h2>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              margin: '0 0 8px',
              paddingLeft: '12px',
            }}
          >
            Look for Quick Wins in the top-left!
          </p>
          <EffortImpactMatrix actions={matrixData} />
        </div>
      )}

      {/* Count Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}
      >
        <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {sortedActions.length} actions · sorted by priority
        </span>
      </div>

      {/* Recommended Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedActions.map((action: Action, i) => (
          <div
            key={action.id}
            style={{
              opacity: 0,
              animation: `fadeIn 0.4s ease-out ${i * 50}ms forwards`,
            }}
          >
            <ActionCard
              action={action}
              status={userActions[action.id] || null}
              onStatusChange={handleStatusChange}
            />
          </div>
        ))}
      </div>

      <div style={{ height: '24px' }} />
    </div>
  );
}

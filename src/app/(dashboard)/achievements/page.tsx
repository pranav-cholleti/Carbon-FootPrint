'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Trophy, Star } from 'lucide-react';
import {
  getAchievements,
  addAchievement,
  getCurrentUser,
  getActivityLogs,
  getStreakCount,
  getGoals,
} from '@/lib/store';
import type { Achievement } from '@/types/domain';

// ---------------------------------------------------------------------------
// Badge Definitions
// ---------------------------------------------------------------------------

interface BadgeDef {
  slug: string;
  emoji: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  checkProgress: (ctx: ProgressContext) => { earned: boolean; progress: number; target: number };
}

interface ProgressContext {
  totalLogs: number;
  streak: number;
  plantBasedMeals: number;
  walkBikeLogs: number;
  completedGoals: number;
  consecutiveDays: Set<string>;
}

const BADGES: BadgeDef[] = [
  {
    slug: 'first_steps',
    emoji: '🌱',
    title: 'First Steps',
    description: 'Log your first activity',
    tier: 'bronze',
    checkProgress: (ctx) => ({
      earned: ctx.totalLogs >= 1,
      progress: Math.min(ctx.totalLogs, 1),
      target: 1,
    }),
  },
  {
    slug: 'on_fire',
    emoji: '🔥',
    title: 'On Fire',
    description: '7-day logging streak',
    tier: 'silver',
    checkProgress: (ctx) => ({
      earned: ctx.streak >= 7,
      progress: Math.min(ctx.streak, 7),
      target: 7,
    }),
  },
  {
    slug: 'data_nerd',
    emoji: '📊',
    title: 'Data Nerd',
    description: 'Log 50 activities',
    tier: 'gold',
    checkProgress: (ctx) => ({
      earned: ctx.totalLogs >= 50,
      progress: Math.min(ctx.totalLogs, 50),
      target: 50,
    }),
  },
  {
    slug: 'green_eater',
    emoji: '🥗',
    title: 'Green Eater',
    description: 'Log 10 plant-based meals',
    tier: 'silver',
    checkProgress: (ctx) => ({
      earned: ctx.plantBasedMeals >= 10,
      progress: Math.min(ctx.plantBasedMeals, 10),
      target: 10,
    }),
  },
  {
    slug: 'active_commuter',
    emoji: '🚶',
    title: 'Active Commuter',
    description: 'Log 20 walks or bike rides',
    tier: 'gold',
    checkProgress: (ctx) => ({
      earned: ctx.walkBikeLogs >= 20,
      progress: Math.min(ctx.walkBikeLogs, 20),
      target: 20,
    }),
  },
  {
    slug: 'ten_pct_down',
    emoji: '📉',
    title: '10% Down',
    description: 'Reduce your footprint by 10%',
    tier: 'gold',
    checkProgress: () => ({
      earned: false,
      progress: 0,
      target: 10,
    }),
  },
  {
    slug: 'goal_getter',
    emoji: '🎯',
    title: 'Goal Getter',
    description: 'Complete a goal',
    tier: 'silver',
    checkProgress: (ctx) => ({
      earned: ctx.completedGoals >= 1,
      progress: Math.min(ctx.completedGoals, 1),
      target: 1,
    }),
  },
  {
    slug: 'week_warrior',
    emoji: '⭐',
    title: 'Week Warrior',
    description: 'Log every day for a week',
    tier: 'silver',
    checkProgress: (ctx) => ({
      earned: ctx.consecutiveDays.size >= 7,
      progress: Math.min(ctx.consecutiveDays.size, 7),
      target: 7,
    }),
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AchievementsPage() {
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  const [celebratingSlug, setCelebratingSlug] = useState<string | null>(null);
  const [progressCtx, setProgressCtx] = useState<ProgressContext | null>(null);
  const [loaded, setLoaded] = useState(false);

  const computeContext = useCallback((): ProgressContext => {
    const logs = getActivityLogs({});
    const streak = getStreakCount();
    const goals = getGoals();

    const plantBasedMeals = logs.filter(
      (l) =>
        l.category === 'food' &&
        (l.subcategory === 'vegetarian_meal' || l.subcategory === 'vegan_meal'),
    ).length;

    const walkBikeLogs = logs.filter(
      (l) => l.category === 'transport' && l.subcategory === 'walk_cycle',
    ).length;

    const completedGoals = goals.filter((g) => g.status === 'completed').length;

    const consecutiveDays = new Set<string>();
    for (const log of logs) {
      consecutiveDays.add(log.logged_at.substring(0, 10));
    }

    return {
      totalLogs: logs.length,
      streak,
      plantBasedMeals,
      walkBikeLogs,
      completedGoals,
      consecutiveDays,
    };
  }, []);

  useEffect(() => {
    const earned = getAchievements();
    setEarnedAchievements(earned);

    const ctx = computeContext();
    setProgressCtx(ctx);

    // Check and award new achievements
    const user = getCurrentUser();
    const userId = user?.id || 'user';

    BADGES.forEach((badge) => {
      const result = badge.checkProgress(ctx);
      const alreadyEarned = earned.some(
        (a) => a.title === badge.title,
      );

      if (result.earned && !alreadyEarned) {
        addAchievement({
          user_id: userId,
          title: badge.title,
          description: badge.description,
          tier: badge.tier,
          icon: badge.emoji,
          earned_at: new Date().toISOString(),
          category: 'overall',
        });
        setCelebratingSlug(badge.slug);
        setTimeout(() => setCelebratingSlug(null), 3000);
      }
    });

    // Reload achievements after potential additions
    setEarnedAchievements(getAchievements());
    setLoaded(true);
  }, [computeContext]);

  const isEarned = (badge: BadgeDef) => {
    return earnedAchievements.some((a) => a.title === badge.title);
  };

  const getEarnedDate = (badge: BadgeDef) => {
    const a = earnedAchievements.find((a) => a.title === badge.title);
    if (!a) return null;
    try {
      return new Date(a.earned_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  if (!loaded || !progressCtx) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <div className="skeleton" style={{ height: '60px', marginBottom: '16px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '180px' }} />
          ))}
        </div>
      </div>
    );
  }

  const earnedCount = BADGES.filter((b) => isEarned(b)).length;

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          <Trophy size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--accent-amber)' }} />{' '}
          Achievements
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          {earnedCount} of {BADGES.length} badges earned
        </p>
      </div>

      {/* Progress bar */}
      <div className="card animate-fade-in" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Collection Progress
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {earnedCount}/{BADGES.length}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{
              width: `${(earnedCount / BADGES.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent-amber), var(--accent-green))',
            }}
          />
        </div>
      </div>

      {/* Badge Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
        }}
      >
        {BADGES.map((badge, i) => {
          const earned = isEarned(badge);
          const earnedDate = getEarnedDate(badge);
          const progress = badge.checkProgress(progressCtx);
          const isCelebrating = celebratingSlug === badge.slug;

          return (
            <div
              key={badge.slug}
              className={`card ${isCelebrating ? 'animate-pulse-glow' : 'animate-fade-in'}`}
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                opacity: earned ? 1 : 0.55,
                position: 'relative',
                overflow: 'hidden',
                animation: isCelebrating
                  ? 'scaleIn 0.5s ease-out, pulse-glow 1.5s ease-in-out infinite'
                  : `fadeIn 0.4s ease-out ${i * 60}ms forwards`,
                ...(isCelebrating
                  ? { border: '2px solid var(--accent-green)' }
                  : {}),
              }}
            >
              {/* Celebration confetti */}
              {isCelebrating && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    fontSize: '20px',
                    animation: 'scaleIn 0.3s ease-out',
                  }}
                >
                  🎉
                </div>
              )}

              {/* Emoji */}
              <div
                style={{
                  fontSize: '40px',
                  marginBottom: '10px',
                  filter: earned ? 'none' : 'grayscale(100%)',
                  transition: 'filter 0.3s ease',
                }}
              >
                {badge.emoji}
              </div>

              {/* Title */}
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: earned ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  marginBottom: '4px',
                }}
              >
                {badge.title}
              </div>

              {/* Description */}
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-tertiary)',
                  lineHeight: 1.4,
                  marginBottom: '10px',
                }}
              >
                {badge.description}
              </div>

              {/* Earned date or progress */}
              {earned ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    color: 'var(--accent-green)',
                    fontWeight: 600,
                  }}
                >
                  <Star size={12} fill="var(--accent-green)" />
                  {earnedDate || 'Earned'}
                </div>
              ) : (
                <div>
                  <div className="progress-bar" style={{ height: '6px', marginBottom: '4px' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(progress.progress / progress.target) * 100}%`,
                        background: 'linear-gradient(90deg, var(--accent-amber-light), var(--accent-amber))',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    {progress.progress}/{progress.target}
                  </div>
                </div>
              )}

              {/* Tier badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color:
                    badge.tier === 'gold'
                      ? '#D4A317'
                      : badge.tier === 'silver'
                      ? '#8A94A6'
                      : badge.tier === 'platinum'
                      ? '#7B68EE'
                      : '#CD7F32',
                  opacity: earned ? 1 : 0.4,
                }}
              >
                {badge.tier}
              </div>
            </div>
          );
        })}
      </div>

      {/* Celebration toast */}
      {celebratingSlug && (
        <div className="toast">
          🏆 New achievement unlocked!
        </div>
      )}

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

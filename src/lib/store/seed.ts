'use client';

import type { User, UserProfile, ActivityLog, Goal, UserAction, Achievement, AIDigest } from '@/types/domain';
import { KEYS, setItem, isBrowser, nowISO } from './core';
import { SEED_LOGS, SEED_GOALS } from './seedData';

/**
 * Computes a Date relative to another date back in time.
 *
 * @param {Date} from - Anchor date.
 * @param {number} days - Number of days back.
 * @returns {Date} The relative date.
 */
function daysAgo(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

/**
 * Computes a Date relative to another date forward in time.
 *
 * @param {Date} from - Anchor date.
 * @param {number} days - Number of days forward.
 * @returns {Date} The relative date.
 */
function daysFromNow(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Checks if the store's demo seed data has already been initialized in the browser.
 *
 * @returns {boolean} True if initialized, false otherwise.
 */
export function isSeedInitialized(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(KEYS.initialized) === 'true';
}

/**
 * Populates local storage with realistic demo records for a user named Maya.
 * Includes user profile, 3 weeks of activity logs, reduction goals, achievements, and weekly digest.
 * Only triggers if the store is not already initialized.
 */
export function initializeSeedData(): void {
  if (!isBrowser()) return;
  if (isSeedInitialized()) return;

  const userId = 'demo_maya_001';
  const now = new Date();

  // 1. Initialize Demo User
  const demoUser: User = {
    id: userId,
    email: 'demo@imprint.app',
    display_name: 'Maya',
    created_at: daysAgo(now, 30).toISOString(),
    updated_at: nowISO(),
    onboarding_completed: true,
  };
  setItem(KEYS.users, [demoUser]);
  localStorage.setItem(KEYS.currentUserId, userId);

  // 2. Initialize Profile
  const profile: UserProfile = {
    user_id: userId,
    region_code: 'IN-TG',
    diet_type: 'omnivore',
    transport_primary: 'mixed',
    car_fuel_type: 'petrol',
    car_km_per_week: 80,
    public_transit_km_per_week: 30,
    flights_per_year: 4,
    housing_type: 'apartment',
    household_size: 3,
    electricity_kwh_per_month: 250,
    gas_heating: false,
    renewable_energy: false,
    shopping_frequency: 'average',
    estimated_baseline_kg_month: 380,
    updated_at: nowISO(),
  };
  setItem(KEYS.profiles, [profile]);

  // 3. Initialize Activity Logs (relative to current date)
  let logIdx = 0;
  const logs: ActivityLog[] = SEED_LOGS.map((raw) => {
    logIdx++;
    const logDate = daysAgo(now, raw.daysBack);
    logDate.setHours(7 + (logIdx % 14), (logIdx * 17) % 60);
    return {
      id: `seed_log_${String(logIdx).padStart(3, '0')}`,
      user_id: userId,
      category: raw.category,
      subcategory: raw.subcategory,
      description: raw.description,
      quantity: raw.quantity,
      unit: raw.unit,
      co2e_kg: raw.co2e_kg,
      emission_factor: raw.factor,
      factor_source: raw.source,
      metadata: raw.meta ?? {},
      logged_at: logDate.toISOString(),
      created_at: logDate.toISOString(),
    };
  });
  setItem(KEYS.activityLogs, logs);

  // 4. Initialize Goals (relative to current date)
  const goals: Goal[] = SEED_GOALS.map((raw) => ({
    id: raw.id,
    user_id: userId,
    title: raw.title,
    description: raw.description,
    target_reduction_pct: raw.target_reduction_pct,
    baseline_kg_month: raw.baseline_kg_month,
    target_kg_month: raw.target_kg_month,
    category: raw.category,
    status: 'active',
    start_date: daysAgo(now, raw.daysAgoStart).toISOString(),
    end_date: daysFromNow(now, raw.daysFromNowEnd).toISOString(),
    created_at: daysAgo(now, raw.daysAgoStart).toISOString(),
    updated_at: nowISO(),
  }));
  setItem(KEYS.goals, goals);

  // 5. Initialize Action recommendations
  const userActions: UserAction[] = [
    {
      id: 'seed_ua_001',
      user_id: userId,
      action_id: 'action_carpool',
      status: 'doing',
      started_at: daysAgo(now, 10).toISOString(),
      notes: 'Found a colleague who lives nearby',
      created_at: daysAgo(now, 10).toISOString(),
      updated_at: nowISO(),
    },
    {
      id: 'seed_ua_002',
      user_id: userId,
      action_id: 'action_meatfree_monday',
      status: 'doing',
      started_at: daysAgo(now, 14).toISOString(),
      created_at: daysAgo(now, 14).toISOString(),
      updated_at: nowISO(),
    },
    {
      id: 'seed_ua_003',
      user_id: userId,
      action_id: 'action_led_bulbs',
      status: 'completed',
      started_at: daysAgo(now, 20).toISOString(),
      completed_at: daysAgo(now, 15).toISOString(),
      created_at: daysAgo(now, 20).toISOString(),
      updated_at: daysAgo(now, 15).toISOString(),
    },
    {
      id: 'seed_ua_004',
      user_id: userId,
      action_id: 'action_secondhand_clothing',
      status: 'saved',
      created_at: daysAgo(now, 5).toISOString(),
      updated_at: daysAgo(now, 5).toISOString(),
    },
  ];
  setItem(KEYS.actions, userActions);

  // 6. Initialize Achievements / Badges
  const achievements: Achievement[] = [
    {
      id: 'seed_ach_001',
      user_id: userId,
      title: 'First Log',
      description: 'Logged your very first activity — the journey begins!',
      tier: 'bronze',
      icon: '📝',
      earned_at: daysAgo(now, 21).toISOString(),
      category: 'overall',
    },
    {
      id: 'seed_ach_002',
      user_id: userId,
      title: 'Week Warrior',
      description: 'Logged activities for 7 consecutive days',
      tier: 'silver',
      icon: '🔥',
      earned_at: daysAgo(now, 14).toISOString(),
      category: 'overall',
    },
    {
      id: 'seed_ach_003',
      user_id: userId,
      title: 'Green Commuter',
      description: 'Chose walking or cycling for 3 trips',
      tier: 'bronze',
      icon: '🚴',
      earned_at: daysAgo(now, 9).toISOString(),
      category: 'transport',
    },
    {
      id: 'seed_ach_004',
      user_id: userId,
      title: 'Veggie Explorer',
      description: 'Logged 5 vegetarian or vegan meals',
      tier: 'bronze',
      icon: '🥗',
      earned_at: daysAgo(now, 7).toISOString(),
      category: 'food',
    },
  ];
  setItem(KEYS.achievements, achievements);

  // 7. Initialize AI digests
  const digests: AIDigest[] = [
    {
      id: 'seed_digest_001',
      user_id: userId,
      period_start: daysAgo(now, 14).toISOString(),
      period_end: daysAgo(now, 7).toISOString(),
      content:
        "Hey Maya! 👋 Great work this past week — you logged 17 activities, keeping your tracking streak alive at 7 days! Your total footprint was around 85 kg CO₂e, which is about 8% less than the week before. That's real progress.\n\nYour biggest category was transport at 42 kg, mainly from daily commutes. But here's the bright side: you cycled twice this week! Those rides saved about 8.5 kg of emissions compared to driving.\n\nOn the food front, your mix of veggie and non-veg meals averaged out nicely. The vegan salad bowl you tried was a standout — just 0.25 kg CO₂e per meal.\n\nFor next week, try carpooling to the office even once — splitting your commute emissions in half for just one day would save about 2 kg. Small wins add up! 🌱",
      total_kg: 85,
      change_pct: -8,
      generated_at: daysAgo(now, 7).toISOString(),
    },
  ];
  setItem(KEYS.digests, digests);

  // Set local state flag
  localStorage.setItem(KEYS.initialized, 'true');
}

/**
 * Resets local storage by wiping all Imprint-related keys.
 */
export function clearAllData(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

'use client';

// =============================================================================
// Imprint Carbon Footprint Platform — localStorage Data Store
// =============================================================================

import type {
  User,
  UserProfile,
  ActivityLog,
  Goal,
  UserAction,
  AIDigest,
  Achievement,
  EmissionCategory,
  ActivitySummary,
  EmissionBreakdown,
  Subcategory,
} from '@/types/domain';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PREFIX = 'imprint_';
const KEYS = {
  currentUserId: `${PREFIX}current_user_id`,
  users: `${PREFIX}users`,
  profiles: `${PREFIX}profiles`,
  activityLogs: `${PREFIX}activity_logs`,
  goals: `${PREFIX}goals`,
  actions: `${PREFIX}user_actions`,
  digests: `${PREFIX}ai_digests`,
  achievements: `${PREFIX}achievements`,
  initialized: `${PREFIX}seed_initialized`,
} as const;

// ---------------------------------------------------------------------------
// SSR safety
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Imprint Store] Failed to write key "${key}":`, e);
  }
}

function removeItem(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// User management
// ---------------------------------------------------------------------------

export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  const userId = localStorage.getItem(KEYS.currentUserId);
  if (!userId) return null;
  const users = getItem<User[]>(KEYS.users) ?? [];
  return users.find((u) => u.id === userId) ?? null;
}

export function setCurrentUser(user: User): void {
  if (!isBrowser()) return;
  const users = getItem<User[]>(KEYS.users) ?? [];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = { ...user, updated_at: nowISO() };
  } else {
    users.push(user);
  }
  setItem(KEYS.users, users);
  localStorage.setItem(KEYS.currentUserId, user.id);
}

export function getUserByEmail(email: string): User | null {
  const users = getItem<User[]>(KEYS.users) ?? [];
  return users.find((u) => u.email === email) ?? null;
}

export function createUser(displayName: string, email: string): User {
  const user: User = {
    id: generateId(),
    email,
    display_name: displayName,
    created_at: nowISO(),
    updated_at: nowISO(),
    onboarding_completed: false,
  };
  const users = getItem<User[]>(KEYS.users) ?? [];
  users.push(user);
  setItem(KEYS.users, users);
  localStorage.setItem(KEYS.currentUserId, user.id);
  return user;
}

export function updateUser(updates: Partial<User> & { id: string }): User | null {
  const users = getItem<User[]>(KEYS.users) ?? [];
  const idx = users.findIndex((u) => u.id === updates.id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.users, users);
  return users[idx];
}

export function logout(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.currentUserId);
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export function getProfile(userId?: string): UserProfile | null {
  const uid = userId ?? localStorage.getItem(KEYS.currentUserId);
  if (!uid) return null;
  const profiles = getItem<UserProfile[]>(KEYS.profiles) ?? [];
  return profiles.find((p) => p.user_id === uid) ?? null;
}

export function saveProfile(profile: UserProfile): UserProfile {
  const profiles = getItem<UserProfile[]>(KEYS.profiles) ?? [];
  const idx = profiles.findIndex((p) => p.user_id === profile.user_id);
  const updated = { ...profile, updated_at: nowISO() };
  if (idx >= 0) {
    profiles[idx] = updated;
  } else {
    profiles.push(updated);
  }
  setItem(KEYS.profiles, profiles);
  return updated;
}

// ---------------------------------------------------------------------------
// Activity Logs
// ---------------------------------------------------------------------------

export function addActivityLog(
  log: Omit<ActivityLog, 'id' | 'created_at'>,
): ActivityLog {
  const fullLog: ActivityLog = {
    ...log,
    id: generateId(),
    created_at: nowISO(),
  };
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  logs.push(fullLog);
  setItem(KEYS.activityLogs, logs);
  return fullLog;
}

export interface ActivityLogFilters {
  userId?: string;
  category?: EmissionCategory;
  subcategory?: Subcategory;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function getActivityLogs(filters: ActivityLogFilters = {}): ActivityLog[] {
  let logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];

  const userId = filters.userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  if (userId) {
    logs = logs.filter((l) => l.user_id === userId);
  }

  if (filters.category) {
    logs = logs.filter((l) => l.category === filters.category);
  }

  if (filters.subcategory) {
    logs = logs.filter((l) => l.subcategory === filters.subcategory);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    logs = logs.filter((l) => new Date(l.logged_at).getTime() >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    logs = logs.filter((l) => new Date(l.logged_at).getTime() <= end);
  }

  // Sort by logged_at descending (newest first)
  logs.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());

  if (filters.limit && filters.limit > 0) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

export function getActivityLogById(id: string): ActivityLog | null {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  return logs.find((l) => l.id === id) ?? null;
}

export function deleteActivityLog(id: string): boolean {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  const idx = logs.findIndex((l) => l.id === id);
  if (idx < 0) return false;
  logs.splice(idx, 1);
  setItem(KEYS.activityLogs, logs);
  return true;
}

export function updateActivityLog(
  id: string,
  updates: Partial<ActivityLog>,
): ActivityLog | null {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  const idx = logs.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  logs[idx] = { ...logs[idx], ...updates };
  setItem(KEYS.activityLogs, logs);
  return logs[idx];
}

// ---------------------------------------------------------------------------
// Activity Summary (aggregation)
// ---------------------------------------------------------------------------

export function getActivitySummary(
  startDate: string,
  endDate: string,
  userId?: string,
): ActivitySummary {
  const logs = getActivityLogs({ userId, startDate, endDate });

  const breakdown: EmissionBreakdown = {
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
  };

  for (const log of logs) {
    breakdown[log.category] += log.co2e_kg;
  }

  // Round
  breakdown.transport = Math.round(breakdown.transport * 1000) / 1000;
  breakdown.food = Math.round(breakdown.food * 1000) / 1000;
  breakdown.home = Math.round(breakdown.home * 1000) / 1000;
  breakdown.consumption = Math.round(breakdown.consumption * 1000) / 1000;

  const total_co2e_kg =
    Math.round(
      (breakdown.transport + breakdown.food + breakdown.home + breakdown.consumption) * 1000,
    ) / 1000;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const period_days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const daily_average_kg = Math.round((total_co2e_kg / period_days) * 1000) / 1000;

  return {
    total_co2e_kg,
    count: logs.length,
    breakdown,
    daily_average_kg,
    period_days,
  };
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function getGoals(userId?: string): Goal[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  return uid ? goals.filter((g) => g.user_id === uid) : goals;
}

export function addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Goal {
  const fullGoal: Goal = {
    ...goal,
    id: generateId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  goals.push(fullGoal);
  setItem(KEYS.goals, goals);
  return fullGoal;
}

export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  const idx = goals.findIndex((g) => g.id === id);
  if (idx < 0) return null;
  goals[idx] = { ...goals[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.goals, goals);
  return goals[idx];
}

export function deleteGoal(id: string): boolean {
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  const idx = goals.findIndex((g) => g.id === id);
  if (idx < 0) return false;
  goals.splice(idx, 1);
  setItem(KEYS.goals, goals);
  return true;
}

// ---------------------------------------------------------------------------
// User Actions
// ---------------------------------------------------------------------------

export function getUserActions(userId?: string): UserAction[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  return uid ? actions.filter((a) => a.user_id === uid) : actions;
}

export function addUserAction(
  action: Omit<UserAction, 'id' | 'created_at' | 'updated_at'>,
): UserAction {
  const fullAction: UserAction = {
    ...action,
    id: generateId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  actions.push(fullAction);
  setItem(KEYS.actions, actions);
  return fullAction;
}

export function updateUserAction(
  id: string,
  updates: Partial<UserAction>,
): UserAction | null {
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  const idx = actions.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  actions[idx] = { ...actions[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.actions, actions);
  return actions[idx];
}

export function getUserActionByActionId(actionId: string, userId?: string): UserAction | null {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  return actions.find((a) => a.action_id === actionId && a.user_id === uid) ?? null;
}

// ---------------------------------------------------------------------------
// AI Digests
// ---------------------------------------------------------------------------

export function getDigests(userId?: string): AIDigest[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const digests = getItem<AIDigest[]>(KEYS.digests) ?? [];
  const filtered = uid ? digests.filter((d) => d.user_id === uid) : digests;
  return filtered.sort(
    (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime(),
  );
}

export function addDigest(digest: Omit<AIDigest, 'id'>): AIDigest {
  const fullDigest: AIDigest = {
    ...digest,
    id: generateId(),
  };
  const digests = getItem<AIDigest[]>(KEYS.digests) ?? [];
  digests.push(fullDigest);
  setItem(KEYS.digests, digests);
  return fullDigest;
}

export function getLatestDigest(userId?: string): AIDigest | null {
  const all = getDigests(userId);
  return all.length > 0 ? all[0] : null;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

export function getAchievements(userId?: string): Achievement[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];
  return uid ? achievements.filter((a) => a.user_id === uid) : achievements;
}

export function addAchievement(
  achievement: Omit<Achievement, 'id'>,
): Achievement {
  const fullAchievement: Achievement = {
    ...achievement,
    id: generateId(),
  };
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];

  // Prevent duplicate achievements
  const exists = achievements.some(
    (a) => a.user_id === achievement.user_id && a.title === achievement.title,
  );
  if (exists) {
    return achievements.find(
      (a) => a.user_id === achievement.user_id && a.title === achievement.title,
    )!;
  }

  achievements.push(fullAchievement);
  setItem(KEYS.achievements, achievements);
  return fullAchievement;
}

export function hasAchievement(title: string, userId?: string): boolean {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];
  return achievements.some((a) => a.user_id === uid && a.title === title);
}

// ---------------------------------------------------------------------------
// Streak calculation
// ---------------------------------------------------------------------------

export function getStreakCount(userId?: string): number {
  const logs = getActivityLogs({ userId });
  if (logs.length === 0) return 0;

  // Collect unique dates (YYYY-MM-DD)
  const dates = new Set<string>();
  for (const log of logs) {
    dates.add(log.logged_at.substring(0, 10));
  }

  const sortedDates = Array.from(dates).sort().reverse(); // newest first
  if (sortedDates.length === 0) return 0;

  // Check if today (or yesterday) is in the set
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  // Streak must include today or yesterday
  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = toDateStr(prevDate);

    if (sortedDates[i] === prevStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

function toDateStr(date: Date): string {
  return date.toISOString().substring(0, 10);
}

// ---------------------------------------------------------------------------
// Clear / Reset
// ---------------------------------------------------------------------------

export function clearAllData(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// ---------------------------------------------------------------------------
// Seed data initialization
// ---------------------------------------------------------------------------

export function isSeedInitialized(): boolean {
  if (!isBrowser()) return false;
  return localStorage.getItem(KEYS.initialized) === 'true';
}

export function initializeSeedData(): void {
  if (!isBrowser()) return;
  if (isSeedInitialized()) return;

  // ── Demo user: Maya ────────────────────────────────────────────────────
  const userId = 'demo_maya_001';
  const now = new Date();

  const demoUser: User = {
    id: userId,
    email: 'demo@imprint.app',
    display_name: 'Maya',
    created_at: daysAgo(now, 30).toISOString(),
    updated_at: nowISO(),
    onboarding_completed: true,
  };

  const users = [demoUser];
  setItem(KEYS.users, users);
  localStorage.setItem(KEYS.currentUserId, userId);

  // ── Profile ────────────────────────────────────────────────────────────
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

  // ── Activity logs (3 weeks of varied data) ─────────────────────────────
  const logs: ActivityLog[] = [];
  let logIdx = 0;

  const makeLog = (
    daysBack: number,
    category: EmissionCategory,
    subcategory: Subcategory,
    description: string,
    quantity: number,
    unit: string,
    co2e_kg: number,
    factor: number,
    source: string,
    meta: Record<string, unknown> = {},
  ): ActivityLog => {
    logIdx++;
    const logDate = daysAgo(now, daysBack);
    // Vary the time of day
    logDate.setHours(7 + (logIdx % 14), (logIdx * 17) % 60);
    return {
      id: `seed_log_${String(logIdx).padStart(3, '0')}`,
      user_id: userId,
      category,
      subcategory,
      description,
      quantity,
      unit,
      co2e_kg,
      emission_factor: factor,
      factor_source: source,
      metadata: meta,
      logged_at: logDate.toISOString(),
      created_at: logDate.toISOString(),
    };
  };

  // Week 3 (oldest, ~15-21 days ago)
  logs.push(makeLog(21, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(21, 'food', 'chicken', 'Chicken biryani for lunch', 1, 'serving', 1.7, 1.7, 'Poore & Nemecek 2018'));
  logs.push(makeLog(20, 'transport', 'bus', 'Bus to market', 12, 'km', 1.07, 0.089, 'UK BEIS 2023'));
  logs.push(makeLog(20, 'food', 'vegetarian_meal', 'Dal & rice dinner', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(19, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(19, 'food', 'beef', 'Beef curry', 1, 'serving', 6.6, 6.6, 'Poore & Nemecek 2018'));
  logs.push(makeLog(19, 'home', 'electricity', 'Daily electricity', 8.3, 'kWh', 5.88, 0.708, 'CEA India 2023'));
  logs.push(makeLog(18, 'transport', 'train', 'Train to Secunderabad', 30, 'km', 1.23, 0.041, 'UK BEIS 2023'));
  logs.push(makeLog(18, 'food', 'pork', 'Pork chops dinner', 1, 'serving', 3.0, 3.0, 'Poore & Nemecek 2018'));
  logs.push(makeLog(17, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(17, 'food', 'vegetarian_meal', 'Veggie thali', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(17, 'consumption', 'clothing_new', 'New kurta', 1, 'item', 25.0, 25.0, 'WRAP UK 2023'));
  logs.push(makeLog(16, 'food', 'dairy', 'Chai + paneer', 2, 'serving', 1.2, 0.6, 'Poore & Nemecek 2018'));
  logs.push(makeLog(16, 'transport', 'walk_cycle', 'Cycled to gym', 5, 'km', 0, 0, 'N/A'));
  logs.push(makeLog(15, 'transport', 'petrol_car', 'Weekend trip', 60, 'km', 10.2, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(15, 'food', 'fish', 'Fish fry dinner', 1, 'serving', 1.5, 1.5, 'Poore & Nemecek 2018'));

  // Week 2 (8-14 days ago)
  logs.push(makeLog(14, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(14, 'food', 'chicken', 'Chicken tikka', 1, 'serving', 1.7, 1.7, 'Poore & Nemecek 2018'));
  logs.push(makeLog(14, 'home', 'electricity', 'Weekly electricity', 58, 'kWh', 41.06, 0.708, 'CEA India 2023'));
  logs.push(makeLog(13, 'transport', 'bus', 'Bus to friends place', 15, 'km', 1.34, 0.089, 'UK BEIS 2023'));
  logs.push(makeLog(13, 'food', 'vegan_meal', 'Vegan salad bowl', 1, 'meal', 0.25, 0.25, 'Scarborough et al. 2014'));
  logs.push(makeLog(12, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(12, 'food', 'vegetarian_meal', 'Chole bhature', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(12, 'food', 'eggs', 'Egg omelette breakfast', 2, 'serving', 0.9, 0.45, 'Poore & Nemecek 2018'));
  logs.push(makeLog(11, 'transport', 'train', 'Train to Hyderabad central', 25, 'km', 1.03, 0.041, 'UK BEIS 2023'));
  logs.push(makeLog(11, 'food', 'lamb', 'Lamb rogan josh', 1, 'serving', 5.6, 5.6, 'Poore & Nemecek 2018'));
  logs.push(makeLog(10, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(10, 'food', 'vegetarian_meal', 'Masala dosa', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(10, 'consumption', 'clothing_secondhand', 'Thrifted jeans', 1, 'item', 4.0, 4.0, 'ThredUp Resale Report 2023'));
  logs.push(makeLog(9, 'food', 'chicken', 'Butter chicken', 1, 'serving', 1.7, 1.7, 'Poore & Nemecek 2018'));
  logs.push(makeLog(9, 'transport', 'walk_cycle', 'Walked to store', 2, 'km', 0, 0, 'N/A'));
  logs.push(makeLog(8, 'transport', 'petrol_car', 'Family outing', 45, 'km', 7.65, 0.170, 'UK BEIS 2023', { passengers: 1 }));
  logs.push(makeLog(8, 'food', 'vegetarian_meal', 'South Indian meals', 2, 'meal', 1.0, 0.5, 'Scarborough et al. 2014'));

  // Week 1 (most recent, 1-7 days ago)
  logs.push(makeLog(7, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(7, 'food', 'vegetarian_meal', 'Rajma chawal', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(7, 'home', 'electricity', 'Weekly electricity', 55, 'kWh', 38.94, 0.708, 'CEA India 2023'));
  logs.push(makeLog(6, 'transport', 'bus', 'Bus to mall', 10, 'km', 0.89, 0.089, 'UK BEIS 2023'));
  logs.push(makeLog(6, 'food', 'chicken', 'Grilled chicken', 1, 'serving', 1.7, 1.7, 'Poore & Nemecek 2018'));
  logs.push(makeLog(5, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(5, 'food', 'vegan_meal', 'Vegan Buddha bowl', 1, 'meal', 0.25, 0.25, 'Scarborough et al. 2014'));
  logs.push(makeLog(5, 'food', 'dairy', 'Curd rice', 1, 'serving', 0.6, 0.6, 'Poore & Nemecek 2018'));
  logs.push(makeLog(4, 'transport', 'train', 'Train to meeting', 20, 'km', 0.82, 0.041, 'UK BEIS 2023'));
  logs.push(makeLog(4, 'food', 'vegetarian_meal', 'Paneer butter masala', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(3, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(3, 'food', 'fish', 'Fish curry', 1, 'serving', 1.5, 1.5, 'Poore & Nemecek 2018'));
  logs.push(makeLog(3, 'consumption', 'clothing_new', 'New formal shirt', 1, 'item', 25.0, 25.0, 'WRAP UK 2023'));
  logs.push(makeLog(2, 'transport', 'walk_cycle', 'Cycled to park', 8, 'km', 0, 0, 'N/A'));
  logs.push(makeLog(2, 'food', 'vegetarian_meal', 'Idli sambar', 1, 'meal', 0.5, 0.5, 'Scarborough et al. 2014'));
  logs.push(makeLog(1, 'transport', 'petrol_car', 'Drive to office', 25, 'km', 4.25, 0.170, 'UK BEIS 2023'));
  logs.push(makeLog(1, 'food', 'eggs', 'Scrambled eggs', 2, 'serving', 0.9, 0.45, 'Poore & Nemecek 2018'));
  logs.push(makeLog(1, 'home', 'electricity', 'Weekly electricity', 60, 'kWh', 42.48, 0.708, 'CEA India 2023'));

  setItem(KEYS.activityLogs, logs);

  // ── Goals ──────────────────────────────────────────────────────────────
  const goals: Goal[] = [
    {
      id: 'seed_goal_001',
      user_id: userId,
      title: 'Reduce transport emissions by 20%',
      description: 'Use public transit at least 3 days a week and carpool when driving',
      target_reduction_pct: 20,
      baseline_kg_month: 120,
      target_kg_month: 96,
      category: 'transport',
      status: 'active',
      start_date: daysAgo(now, 21).toISOString(),
      end_date: daysFromNow(now, 60).toISOString(),
      created_at: daysAgo(now, 21).toISOString(),
      updated_at: nowISO(),
    },
    {
      id: 'seed_goal_002',
      user_id: userId,
      title: 'Try 2 meat-free days per week',
      description: 'Replace at least 2 full days of meals with vegetarian or vegan options',
      target_reduction_pct: 15,
      baseline_kg_month: 140,
      target_kg_month: 119,
      category: 'food',
      status: 'active',
      start_date: daysAgo(now, 14).toISOString(),
      end_date: daysFromNow(now, 45).toISOString(),
      created_at: daysAgo(now, 14).toISOString(),
      updated_at: nowISO(),
    },
  ];
  setItem(KEYS.goals, goals);

  // ── User Actions ───────────────────────────────────────────────────────
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

  // ── Achievements ───────────────────────────────────────────────────────
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

  // ── AI Digests ─────────────────────────────────────────────────────────
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

  // Mark as initialized
  localStorage.setItem(KEYS.initialized, 'true');
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function daysAgo(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(from: Date, days: number): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

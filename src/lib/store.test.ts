import { beforeEach, describe, test, expect } from 'vitest';

// Setup self-contained mock localStorage for Node testing environment
const localStorageStore: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => localStorageStore[key] || null,
  setItem: (key: string, value: string) => { localStorageStore[key] = String(value); },
  removeItem: (key: string) => { delete localStorageStore[key]; },
  clear: () => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  }
};

Object.defineProperty(globalThis, 'window', {
  value: { localStorage: localStorageMock },
  writable: true,
  configurable: true,
});
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Now import store methods
import {
  createUser,
  getCurrentUser,
  getProfile,
  saveProfile,
  addActivityLog,
  getActivityLogs,
  getActivitySummary,
  getStreakCount,
} from './store';
import type { UserProfile } from '@/types/domain';

describe('LocalStorage Store CRUD and Streak tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test('Create user and set current user works correctly', () => {
    const user = createUser('Alice', 'alice@imprint.app');
    expect(user.display_name).toBe('Alice');
    expect(user.email).toBe('alice@imprint.app');

    const current = getCurrentUser();
    expect(current).toBeDefined();
    expect(current?.id).toBe(user.id);
  });

  test('Profile save and retrieval', () => {
    const user = createUser('Bob', 'bob@imprint.app');
    const profile: UserProfile = {
      user_id: user.id,
      region_code: 'UK',
      diet_type: 'vegan',
      transport_primary: 'bike',
      car_fuel_type: 'none',
      car_km_per_week: 0,
      public_transit_km_per_week: 0,
      flights_per_year: 0,
      housing_type: 'apartment',
      household_size: 1,
      electricity_kwh_per_month: 100,
      gas_heating: false,
      renewable_energy: true,
      shopping_frequency: 'minimal',
      estimated_baseline_kg_month: 120,
      updated_at: new Date().toISOString(),
    };

    saveProfile(profile);
    const retrieved = getProfile(user.id);
    expect(retrieved).toBeDefined();
    expect(retrieved?.region_code).toBe('UK');
    expect(retrieved?.diet_type).toBe('vegan');
  });

  test('Add and filter activity logs', () => {
    const user = createUser('Charlie', 'charlie@imprint.app');
    
    // Log transport activity
    addActivityLog({
      user_id: user.id,
      category: 'transport',
      subcategory: 'train',
      description: 'Train ride',
      quantity: 15,
      unit: 'km',
      co2e_kg: 0.615,
      emission_factor: 0.041,
      factor_source: 'DEFRA',
      metadata: {},
      logged_at: new Date().toISOString(),
    });

    // Log food activity
    addActivityLog({
      user_id: user.id,
      category: 'food',
      subcategory: 'beef',
      description: 'Beef steak',
      quantity: 1,
      unit: 'serving',
      co2e_kg: 6.6,
      emission_factor: 6.6,
      factor_source: 'OWID',
      metadata: {},
      logged_at: new Date().toISOString(),
    });

    const allLogs = getActivityLogs({ userId: user.id });
    expect(allLogs.length).toBe(2);

    const transportOnly = getActivityLogs({ userId: user.id, category: 'transport' });
    expect(transportOnly.length).toBe(1);
    expect(transportOnly[0].subcategory).toBe('train');
  });

  test('Calculate activity summary correctly', () => {
    const user = createUser('Dana', 'dana@imprint.app');
    
    // 2 logs today
    const dateToday = new Date().toISOString();
    
    addActivityLog({
      user_id: user.id,
      category: 'transport',
      subcategory: 'petrol_car',
      description: 'Commute',
      quantity: 20,
      unit: 'km',
      co2e_kg: 3.4,
      emission_factor: 0.170,
      factor_source: 'DEFRA',
      metadata: {},
      logged_at: dateToday,
    });

    addActivityLog({
      user_id: user.id,
      category: 'food',
      subcategory: 'vegan_meal',
      description: 'Salad',
      quantity: 1,
      unit: 'meal',
      co2e_kg: 0.25,
      emission_factor: 0.25,
      factor_source: 'OWID',
      metadata: {},
      logged_at: dateToday,
    });

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const summary = getActivitySummary(start.toISOString(), end.toISOString(), user.id);
    expect(summary.count).toBe(2);
    expect(summary.total_co2e_kg).toBe(3.65);
    expect(summary.breakdown.transport).toBe(3.4);
    expect(summary.breakdown.food).toBe(0.25);
  });

  test('Logging streak calculation', () => {
    const user = createUser('Evan', 'evan@imprint.app');
    
    // 3 days streak: today, yesterday, 2 days ago
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const makeLogForDate = (date: Date) => {
      addActivityLog({
        user_id: user.id,
        category: 'food',
        subcategory: 'vegan_meal',
        description: 'Meal',
        quantity: 1,
        unit: 'meal',
        co2e_kg: 0.25,
        emission_factor: 0.25,
        factor_source: 'OWID',
        metadata: {},
        logged_at: date.toISOString(),
      });
    };

    makeLogForDate(today);
    makeLogForDate(yesterday);
    makeLogForDate(twoDaysAgo);

    const streak = getStreakCount(user.id);
    expect(streak).toBe(3);
  });
});

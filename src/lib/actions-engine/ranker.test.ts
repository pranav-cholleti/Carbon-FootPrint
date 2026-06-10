import { describe, test, expect } from 'vitest';
import { rankActions, getTopActions } from './ranker';
import type { UserProfile, UserAction } from '@/types/domain';

describe('Actions Recommendation Ranker tests', () => {
  const mockProfile: UserProfile = {
    user_id: 'user_1',
    diet_type: 'omnivore',
    transport_primary: 'car',
    car_km_per_week: 1500,
    car_fuel_type: 'petrol',
    public_transit_km_per_week: 0,
    flights_per_year: 0,
    housing_type: 'house',
    household_size: 1,
    electricity_kwh_per_month: 200,
    renewable_energy: false,
    gas_heating: true,
    shopping_frequency: 'average',
    region_code: 'IN',
    estimated_baseline_kg_month: 0,
  };

  test('Rank actions filters out completed or dismissed actions', () => {
    const userActions: UserAction[] = [
      {
        id: 'ua_1',
        user_id: 'user_1',
        action_id: 'action_carpool',
        status: 'completed',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'ua_2',
        user_id: 'user_1',
        action_id: 'action_public_transit',
        status: 'dismissed',
        updated_at: new Date().toISOString(),
      },
    ];

    const results = rankActions(mockProfile, userActions);
    const hasCarpool = results.some((r) => r.action.id === 'action_carpool');
    const hasTransit = results.some((r) => r.action.id === 'action_public_transit');

    expect(hasCarpool).toBe(false);
    expect(hasTransit).toBe(false);
  });

  test('Rank actions includes active actions marked as doing but flags them', () => {
    const userActions: UserAction[] = [
      {
        id: 'ua_1',
        user_id: 'user_1',
        action_id: 'action_carpool',
        status: 'doing',
        updated_at: new Date().toISOString(),
      },
    ];

    const results = rankActions(mockProfile, userActions);
    const carpoolRanked = results.find((r) => r.action.id === 'action_carpool');
    
    expect(carpoolRanked).toBeDefined();
    expect(carpoolRanked?.reasons).toContain("You're already working on this!");
  });

  test('Relevance multipliers are applied for top category', () => {
    const results = rankActions(mockProfile, []);
    // Our mock omnivore driving 100km/week makes transport the top emission category
    // Let's see if transport actions have profile_weight of 1.5
    const transportAction = results.find((r) => r.action.category === 'transport');
    const foodAction = results.find((r) => r.action.category === 'food');

    expect(transportAction?.profile_weight).toBe(1.5);
    expect(foodAction?.profile_weight).toBe(1.0);
  });

  test('Get top actions limits output correctly', () => {
    const top3 = getTopActions(mockProfile, [], 3);
    const top5 = getTopActions(mockProfile, [], 5);

    expect(top3.length).toBe(3);
    expect(top5.length).toBe(5);
  });

  test('Filters out non-applicable actions based on user profile', () => {
    // Rooftop solar installation is only for housing_type = 'house'
    // Let's check house vs apartment
    const houseProfile = { ...mockProfile, housing_type: 'house' as const };
    const aptProfile = { ...mockProfile, housing_type: 'apartment' as const };

    const houseResults = rankActions(houseProfile, []);
    const aptResults = rankActions(aptProfile, []);

    const hasSolarHouse = houseResults.some((r) => r.action.id === 'action_solar_panels');
    const hasSolarApt = aptResults.some((r) => r.action.id === 'action_solar_panels');

    expect(hasSolarHouse).toBe(true);
    expect(hasSolarApt).toBe(false);
  });
});

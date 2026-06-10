import { describe, test, expect } from 'vitest';
import { calculateEmission, calculateBaseline } from './calculator';
import type { UserProfile } from '@/types/domain';

describe('Carbon Calculator Engine tests', () => {
  describe('calculateEmission - Transport', () => {
    test('Petrol car solo commute emissions', () => {
      // 10 km petrol car solo
      // Petrol car factor is 0.170 kg/km
      const result = calculateEmission('petrol_car', 10, 'km', {});
      expect(result.co2e_kg).toBeCloseTo(1.70, 2);
      expect(result.emission_factor).toBe(0.170);
    });

    test('Carpooling splitting emissions', () => {
      // 10 km petrol car with 2 passengers (1 driver + 1 passenger)
      const result = calculateEmission('petrol_car', 10, 'km', { passengers: 2 });
      expect(result.co2e_kg).toBeCloseTo(0.85, 2);
    });

    test('Return trip double distance', () => {
      const result = calculateEmission('petrol_car', 10, 'km', { return_trip: true });
      expect(result.co2e_kg).toBeCloseTo(3.40, 2);
    });

    test('EV emission factors', () => {
      // EV factor is 0.053 kg/km
      const result = calculateEmission('ev', 100, 'km');
      expect(result.co2e_kg).toBeCloseTo(5.30, 2);
    });

    test('Short haul flight vs Long haul flight', () => {
      const shortResult = calculateEmission('flight_short', 1000, 'km');
      const longResult = calculateEmission('flight_long', 1000, 'km');
      expect(shortResult.co2e_kg).toBeGreaterThan(longResult.co2e_kg);
    });

    test('Zero emissions for walking/cycling', () => {
      const result = calculateEmission('walk_cycle', 15, 'km');
      expect(result.co2e_kg).toBe(0);
    });
  });

  describe('calculateEmission - Food', () => {
    test('Beef vs Chicken meal impact', () => {
      const beef = calculateEmission('beef', 2, 'meal');
      const chicken = calculateEmission('chicken', 2, 'meal');
      expect(beef.co2e_kg).toBeGreaterThan(chicken.co2e_kg * 3);
    });

    test('Vegan meal emissions', () => {
      const vegan = calculateEmission('vegan_meal', 4, 'meal');
      expect(vegan.co2e_kg).toBeCloseTo(1.0, 1);
    });
  });

  describe('calculateEmission - Home Energy', () => {
    test('Electricity emissions by region grid factors', () => {
      const inResult = calculateEmission('electricity', 100, 'kWh', {}, 'IN');
      const ukResult = calculateEmission('electricity', 100, 'kWh', {}, 'UK');
      // India has higher grid emissions than UK
      expect(inResult.co2e_kg).toBeGreaterThan(ukResult.co2e_kg);
    });

    test('Region fallback maps correctly', () => {
      const inTgResult = calculateEmission('electricity', 100, 'kWh', {}, 'IN-TG');
      const inResult = calculateEmission('electricity', 100, 'kWh', {}, 'IN');
      expect(inTgResult.co2e_kg).toBe(inResult.co2e_kg);
    });

    test('Natural gas heating calculations', () => {
      const result = calculateEmission('gas_heating', 50, 'kWh');
      expect(result.co2e_kg).toBeCloseTo(10.15, 2);
    });
  });

  describe('calculateEmission - Consumption', () => {
    test('Smartphone vs Laptop one-time carbon footprint', () => {
      const phone = calculateEmission('smartphone', 1, 'item');
      const laptop = calculateEmission('laptop', 1, 'item');
      expect(laptop.co2e_kg).toBeGreaterThan(phone.co2e_kg);
    });

    test('New clothing vs Secondhand clothing', () => {
      const newCl = calculateEmission('clothing_new', 3, 'item');
      const usedCl = calculateEmission('clothing_secondhand', 3, 'item');
      expect(newCl.co2e_kg).toBeGreaterThan(usedCl.co2e_kg * 5);
    });
  });

  describe('calculateEmission - Input validation', () => {
    test('Negative quantity throws error', () => {
      expect(() => calculateEmission('petrol_car', -10, 'km')).toThrow();
    });
  });

  describe('calculateBaseline', () => {
    test('Generate consistent baseline metrics from profile', () => {
      const profile: UserProfile = {
        user_id: 'user_1',
        diet_type: 'omnivore',
        car_km_per_week: 150,
        car_fuel_type: 'petrol',
        public_transit_km_per_week: 50,
        flights_per_year: 2,
        housing_type: 'house',
        household_size: 2,
        electricity_kwh_per_month: 300,
        renewable_energy: false,
        gas_heating: true,
        shopping_frequency: 'average',
        region_code: 'IN',
        estimated_baseline_kg_month: 0,
      };

      const result = calculateBaseline(profile);
      expect(result.total_kg_month).toBeGreaterThan(0);
      expect(result.breakdown.transport).toBeGreaterThan(0);
      expect(result.breakdown.food).toBeGreaterThan(0);
      expect(result.breakdown.home).toBeGreaterThan(0);
      expect(result.breakdown.consumption).toBeGreaterThan(0);
    });

    test('Renewable energy and household size reduces electricity impact', () => {
      const baseProfile: UserProfile = {
        user_id: 'user_1',
        diet_type: 'vegan',
        car_km_per_week: 0,
        car_fuel_type: 'none',
        public_transit_km_per_week: 0,
        flights_per_year: 0,
        housing_type: 'apartment',
        household_size: 1,
        electricity_kwh_per_month: 200,
        renewable_energy: false,
        gas_heating: false,
        shopping_frequency: 'minimal',
        region_code: 'UK',
        estimated_baseline_kg_month: 0,
      };

      const soloNonRenewable = calculateBaseline(baseProfile);
      
      const sharedRenewable = calculateBaseline({
        ...baseProfile,
        household_size: 2,
        renewable_energy: true,
      });

      expect(soloNonRenewable.breakdown.home).toBeGreaterThan(sharedRenewable.breakdown.home * 2);
    });
  });
});

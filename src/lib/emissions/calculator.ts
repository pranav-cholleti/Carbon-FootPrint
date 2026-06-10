// =============================================================================
// Imprint Carbon Footprint Platform — Emission Calculator Engine
// =============================================================================

import type {
  Subcategory,
  TransportSubcategory,
  FoodSubcategory,
  HomeSubcategory,
  ConsumptionSubcategory,
  UserProfile,
  EmissionResult,
  BaselineResult,
  EmissionBreakdown,
  RegionCode,
} from '@/types/domain';

import factors from './factors.json';

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

const TRANSPORT_SUBCATEGORIES: TransportSubcategory[] = [
  'petrol_car', 'diesel_car', 'hybrid_car', 'ev', 'bus', 'train',
  'flight_short', 'flight_long', 'walk_cycle',
];

const FOOD_SUBCATEGORIES: FoodSubcategory[] = [
  'beef', 'lamb', 'pork', 'chicken', 'fish', 'eggs', 'dairy',
  'vegetarian_meal', 'vegan_meal',
];

const HOME_SUBCATEGORIES: HomeSubcategory[] = [
  'electricity', 'gas_heating', 'water',
];

const CONSUMPTION_SUBCATEGORIES: ConsumptionSubcategory[] = [
  'smartphone', 'laptop', 'clothing_new', 'clothing_secondhand',
];

function isTransport(sub: string): sub is TransportSubcategory {
  return TRANSPORT_SUBCATEGORIES.includes(sub as TransportSubcategory);
}

function isFood(sub: string): sub is FoodSubcategory {
  return FOOD_SUBCATEGORIES.includes(sub as FoodSubcategory);
}

function isHome(sub: string): sub is HomeSubcategory {
  return HOME_SUBCATEGORIES.includes(sub as HomeSubcategory);
}

function isConsumption(sub: string): sub is ConsumptionSubcategory {
  return CONSUMPTION_SUBCATEGORIES.includes(sub as ConsumptionSubcategory);
}

// ---------------------------------------------------------------------------
// Grid factor lookup
// ---------------------------------------------------------------------------

type GridFactorEntry = {
  factor: number;
  unit: string;
  source: string;
  notes: string;
};

type GridFactors = Record<string, GridFactorEntry>;

const gridFactors: GridFactors = factors.home.grid_factors as unknown as GridFactors;

function getGridFactor(regionCode: RegionCode): { factor: number; source: string } {
  // Try exact match first
  if (gridFactors[regionCode]) {
    return {
      factor: gridFactors[regionCode].factor,
      source: gridFactors[regionCode].source,
    };
  }

  // Try country prefix (e.g., "IN-TG" → "IN")
  const countryCode = regionCode.split('-')[0];
  if (gridFactors[countryCode]) {
    return {
      factor: gridFactors[countryCode].factor,
      source: gridFactors[countryCode].source,
    };
  }

  // Default to India
  const defaultRegion = factors.metadata.default_region;
  return {
    factor: gridFactors[defaultRegion].factor,
    source: gridFactors[defaultRegion].source + ' (default)',
  };
}

// ---------------------------------------------------------------------------
// Core calculation
// ---------------------------------------------------------------------------

export interface CalculationMetadata {
  passengers?: number;           // For carpooling
  return_trip?: boolean;         // Double the distance
  heating_kwh?: number;          // For gas heating
  [key: string]: unknown;
}

/**
 * Calculate CO2e for a single activity entry.
 *
 * @param subcategory - The specific activity type
 * @param quantity    - Amount (km, servings, kWh, items, etc.)
 * @param unit        - Unit of the quantity (for documentation/validation)
 * @param metadata    - Additional context (passengers, return trip, etc.)
 * @param regionCode  - Region for grid-dependent calculations
 * @returns EmissionResult with co2e_kg, factor used, and source
 */
export function calculateEmission(
  subcategory: Subcategory,
  quantity: number,
  unit: string,
  metadata: CalculationMetadata = {},
  regionCode: RegionCode = 'IN',
): EmissionResult {
  if (quantity < 0) {
    throw new Error(`Quantity must be non-negative, got ${quantity}`);
  }

  // ── Transport ──────────────────────────────────────────────────────────
  if (isTransport(subcategory)) {
    return calculateTransport(subcategory, quantity, metadata);
  }

  // ── Food ───────────────────────────────────────────────────────────────
  if (isFood(subcategory)) {
    return calculateFood(subcategory, quantity);
  }

  // ── Home ───────────────────────────────────────────────────────────────
  if (isHome(subcategory)) {
    return calculateHome(subcategory, quantity, regionCode);
  }

  // ── Consumption ────────────────────────────────────────────────────────
  if (isConsumption(subcategory)) {
    return calculateConsumption(subcategory, quantity);
  }

  throw new Error(`Unknown subcategory: ${subcategory}`);
}

// ---------------------------------------------------------------------------
// Category-specific calculators
// ---------------------------------------------------------------------------

function calculateTransport(
  subcategory: TransportSubcategory,
  km: number,
  metadata: CalculationMetadata,
): EmissionResult {
  const entry = factors.transport[subcategory];
  let effectiveKm = km;

  // Double for return trips
  if (metadata.return_trip) {
    effectiveKm *= 2;
  }

  let co2e_kg = entry.factor * effectiveKm;

  // Carpooling: divide emissions among passengers
  const passengers = metadata.passengers ?? 1;
  if (passengers > 1) {
    co2e_kg /= passengers;
  }

  return {
    co2e_kg: round(co2e_kg),
    emission_factor: entry.factor,
    factor_source: entry.source,
  };
}

function calculateFood(
  subcategory: FoodSubcategory,
  servings: number,
): EmissionResult {
  const entry = factors.food[subcategory];
  const co2e_kg = entry.factor * servings;

  return {
    co2e_kg: round(co2e_kg),
    emission_factor: entry.factor,
    factor_source: entry.source,
  };
}

function calculateHome(
  subcategory: HomeSubcategory,
  quantity: number,
  regionCode: RegionCode,
): EmissionResult {
  if (subcategory === 'electricity') {
    const grid = getGridFactor(regionCode);
    const co2e_kg = grid.factor * quantity;
    return {
      co2e_kg: round(co2e_kg),
      emission_factor: grid.factor,
      factor_source: grid.source,
    };
  }

  if (subcategory === 'gas_heating') {
    const entry = factors.home.gas_heating;
    const co2e_kg = entry.factor * quantity;
    return {
      co2e_kg: round(co2e_kg),
      emission_factor: entry.factor,
      factor_source: entry.source,
    };
  }

  if (subcategory === 'water') {
    const entry = factors.home.water;
    const co2e_kg = entry.factor * quantity;
    return {
      co2e_kg: round(co2e_kg),
      emission_factor: entry.factor,
      factor_source: entry.source,
    };
  }

  throw new Error(`Unknown home subcategory: ${subcategory}`);
}

function calculateConsumption(
  subcategory: ConsumptionSubcategory,
  items: number,
): EmissionResult {
  const entry = factors.consumption[subcategory];
  const co2e_kg = entry.factor * items;

  return {
    co2e_kg: round(co2e_kg),
    emission_factor: entry.factor,
    factor_source: entry.source,
  };
}

// ---------------------------------------------------------------------------
// Baseline calculator — estimates monthly emissions from user profile
// ---------------------------------------------------------------------------

/**
 * Estimate a user's monthly CO2e baseline from their profile.
 * This is used for goal-setting and measuring progress.
 */
export function calculateBaseline(profile: UserProfile): BaselineResult {
  const breakdown: EmissionBreakdown = {
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
  };

  // ── Transport ──────────────────────────────────────────────────────────
  const monthlyCarKm = profile.car_km_per_week * 4.33;
  const monthlyTransitKm = profile.public_transit_km_per_week * 4.33;

  // Car emissions
  if (monthlyCarKm > 0) {
    const carSubcategory = mapCarFuelToSubcategory(profile.car_fuel_type);
    if (carSubcategory) {
      const carResult = calculateEmission(carSubcategory, monthlyCarKm, 'km', {}, profile.region_code);
      breakdown.transport += carResult.co2e_kg;
    }
  }

  // Public transit
  if (monthlyTransitKm > 0) {
    // Use a weighted mix: 60% bus, 40% train for "public_transit"
    const busKm = monthlyTransitKm * 0.6;
    const trainKm = monthlyTransitKm * 0.4;
    breakdown.transport += calculateEmission('bus', busKm, 'km').co2e_kg;
    breakdown.transport += calculateEmission('train', trainKm, 'km').co2e_kg;
  }

  // Flights (annualized to monthly)
  if (profile.flights_per_year > 0) {
    // Assume average flight = 2,000 km, 50/50 short/long split
    const flightsPerMonth = profile.flights_per_year / 12;
    const avgFlightKm = 2000;
    const shortHaulKm = avgFlightKm * 0.5 * flightsPerMonth;
    const longHaulKm = avgFlightKm * 0.5 * flightsPerMonth;
    breakdown.transport += calculateEmission('flight_short', shortHaulKm, 'km').co2e_kg;
    breakdown.transport += calculateEmission('flight_long', longHaulKm, 'km').co2e_kg;
  }

  // ── Food ───────────────────────────────────────────────────────────────
  // Estimate ~90 meals per month (3/day × 30)
  const mealsPerMonth = 90;
  switch (profile.diet_type) {
    case 'vegan':
      breakdown.food += mealsPerMonth * factors.food.vegan_meal.factor;
      break;
    case 'vegetarian':
      breakdown.food += mealsPerMonth * factors.food.vegetarian_meal.factor;
      break;
    case 'pescatarian':
      // 60% vegetarian, 30% fish, 10% dairy/eggs
      breakdown.food += mealsPerMonth * 0.6 * factors.food.vegetarian_meal.factor;
      breakdown.food += mealsPerMonth * 0.3 * factors.food.fish.factor;
      breakdown.food += mealsPerMonth * 0.1 * factors.food.eggs.factor;
      break;
    case 'omnivore':
    default:
      // Typical omnivore: 30% veg, 20% chicken, 15% pork, 10% beef,
      // 5% lamb, 10% fish, 5% eggs, 5% dairy
      breakdown.food += mealsPerMonth * 0.30 * factors.food.vegetarian_meal.factor;
      breakdown.food += mealsPerMonth * 0.20 * factors.food.chicken.factor;
      breakdown.food += mealsPerMonth * 0.15 * factors.food.pork.factor;
      breakdown.food += mealsPerMonth * 0.10 * factors.food.beef.factor;
      breakdown.food += mealsPerMonth * 0.05 * factors.food.lamb.factor;
      breakdown.food += mealsPerMonth * 0.10 * factors.food.fish.factor;
      breakdown.food += mealsPerMonth * 0.05 * factors.food.eggs.factor;
      breakdown.food += mealsPerMonth * 0.05 * factors.food.dairy.factor;
      break;
  }

  // ── Home ───────────────────────────────────────────────────────────────
  // Electricity
  let electricityKwh = profile.electricity_kwh_per_month;
  // Adjust per household member
  if (profile.household_size > 1) {
    electricityKwh /= profile.household_size;
  }
  // Renewable energy reduces grid emissions by ~80%
  const renewableReduction = profile.renewable_energy ? 0.2 : 1.0;
  const electricityResult = calculateEmission(
    'electricity',
    electricityKwh * renewableReduction,
    'kWh',
    {},
    profile.region_code,
  );
  breakdown.home += electricityResult.co2e_kg;

  // Gas heating
  if (profile.gas_heating) {
    // Estimate ~300 kWh/month for gas heating (adjustable)
    const gasKwh = profile.housing_type === 'house' ? 400 : 200;
    const perPersonGas = gasKwh / profile.household_size;
    breakdown.home += calculateEmission('gas_heating', perPersonGas, 'kWh').co2e_kg;
  }

  // ── Consumption ────────────────────────────────────────────────────────
  // Baseline device amortization: 1 smartphone + 1 laptop
  const smartphoneMonthly = factors.consumption.smartphone.factor / 24; // 2 years
  const laptopMonthly = factors.consumption.laptop.factor / 36;         // 3 years
  breakdown.consumption += smartphoneMonthly + laptopMonthly;

  // Clothing based on shopping frequency
  const clothingItemsPerMonth: Record<string, number> = {
    minimal: 0.5,
    average: 2,
    frequent: 5,
  };
  const clothingItems = clothingItemsPerMonth[profile.shopping_frequency] ?? 2;
  // Assume 80% new, 20% secondhand for average
  const secondhandRatio = profile.shopping_frequency === 'minimal' ? 0.5 : 0.2;
  const newItems = clothingItems * (1 - secondhandRatio);
  const usedItems = clothingItems * secondhandRatio;
  breakdown.consumption += newItems * factors.consumption.clothing_new.factor;
  breakdown.consumption += usedItems * factors.consumption.clothing_secondhand.factor;

  // Round all values
  breakdown.transport = round(breakdown.transport);
  breakdown.food = round(breakdown.food);
  breakdown.home = round(breakdown.home);
  breakdown.consumption = round(breakdown.consumption);

  const total_kg_month = round(
    breakdown.transport + breakdown.food + breakdown.home + breakdown.consumption,
  );

  return { total_kg_month, breakdown };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mapCarFuelToSubcategory(
  fuelType: UserProfile['car_fuel_type'],
): TransportSubcategory | null {
  switch (fuelType) {
    case 'petrol':  return 'petrol_car';
    case 'diesel':  return 'diesel_car';
    case 'hybrid':  return 'hybrid_car';
    case 'electric': return 'ev';
    case 'none':    return null;
    default:        return null;
  }
}

function round(value: number, decimals: number = 3): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ---------------------------------------------------------------------------
// Exports for testing
// ---------------------------------------------------------------------------

export {
  getGridFactor,
  TRANSPORT_SUBCATEGORIES,
  FOOD_SUBCATEGORIES,
  HOME_SUBCATEGORIES,
  CONSUMPTION_SUBCATEGORIES,
  isTransport,
  isFood,
  isHome,
  isConsumption,
};

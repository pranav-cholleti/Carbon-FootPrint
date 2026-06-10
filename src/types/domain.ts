// =============================================================================
// Imprint Carbon Footprint Platform — Domain Types
// =============================================================================

// ---------------------------------------------------------------------------
// Enums (string literal unions for JSON serialization)
// ---------------------------------------------------------------------------

export type EmissionCategory = 'transport' | 'food' | 'home' | 'consumption';

export type TransportSubcategory =
  | 'petrol_car'
  | 'diesel_car'
  | 'hybrid_car'
  | 'ev'
  | 'bus'
  | 'train'
  | 'flight_short'
  | 'flight_long'
  | 'walk_cycle';

export type FoodSubcategory =
  | 'beef'
  | 'lamb'
  | 'pork'
  | 'chicken'
  | 'fish'
  | 'eggs'
  | 'dairy'
  | 'vegetarian_meal'
  | 'vegan_meal';

export type HomeSubcategory =
  | 'electricity'
  | 'gas_heating'
  | 'water';

export type ConsumptionSubcategory =
  | 'smartphone'
  | 'laptop'
  | 'clothing_new'
  | 'clothing_secondhand';

export type Subcategory =
  | TransportSubcategory
  | FoodSubcategory
  | HomeSubcategory
  | ConsumptionSubcategory;

export type DietType =
  | 'omnivore'
  | 'pescatarian'
  | 'vegetarian'
  | 'vegan';

export type TransportPrimary =
  | 'car'
  | 'public_transit'
  | 'bicycle'
  | 'walk'
  | 'mixed';

export type CarFuelType =
  | 'petrol'
  | 'diesel'
  | 'hybrid'
  | 'electric'
  | 'none';

export type HousingType =
  | 'apartment'
  | 'house'
  | 'shared';

export type GoalStatus =
  | 'active'
  | 'completed'
  | 'paused'
  | 'abandoned';

export type UserActionStatus =
  | 'saved'
  | 'doing'
  | 'completed'
  | 'dismissed';

export type AchievementTier =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum';

export type EffortScore = 1 | 2 | 3 | 4 | 5;

export type RegionCode =
  | 'IN'
  | 'IN-TG'
  | 'IN-KA'
  | 'IN-MH'
  | 'US'
  | 'US-CA'
  | 'US-NY'
  | 'UK'
  | 'EU'
  | 'NO'
  | 'AU'
  | 'CA'
  | string; // allow any region code

// ---------------------------------------------------------------------------
// Core Entities
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  display_name: string;
  created_at: string;   // ISO 8601
  updated_at: string;   // ISO 8601
  onboarding_completed: boolean;
}

export interface UserProfile {
  user_id: string;
  region_code: RegionCode;
  diet_type: DietType;
  transport_primary: TransportPrimary;
  car_fuel_type: CarFuelType;
  car_km_per_week: number;
  public_transit_km_per_week: number;
  flights_per_year: number;
  housing_type: HousingType;
  household_size: number;
  electricity_kwh_per_month: number;
  gas_heating: boolean;
  renewable_energy: boolean;
  shopping_frequency: 'minimal' | 'average' | 'frequent';
  estimated_baseline_kg_month: number;
  updated_at: string;   // ISO 8601
}

export interface ActivityLog {
  id: string;
  user_id: string;
  category: EmissionCategory;
  subcategory: Subcategory;
  description: string;
  quantity: number;
  unit: string;
  co2e_kg: number;
  emission_factor: number;
  factor_source: string;
  metadata: Record<string, unknown>;
  logged_at: string;    // ISO 8601
  created_at: string;   // ISO 8601
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  target_reduction_pct: number;
  baseline_kg_month: number;
  target_kg_month: number;
  category: EmissionCategory | 'overall';
  status: GoalStatus;
  start_date: string;   // ISO 8601
  end_date: string;     // ISO 8601
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  category: EmissionCategory;
  base_impact_kg_month: number;
  effort_score: EffortScore;
  applicable_conditions: ApplicableConditions;
  tips: string[];
  icon: string;
  co_benefits: string[];
}

export interface ApplicableConditions {
  diet_types?: DietType[];
  transport_types?: TransportPrimary[];
  car_fuel_types?: CarFuelType[];
  housing_types?: HousingType[];
  min_car_km_per_week?: number;
  min_flights_per_year?: number;
  has_gas_heating?: boolean;
  no_renewable_energy?: boolean;
  shopping_frequencies?: Array<'minimal' | 'average' | 'frequent'>;
}

export interface UserAction {
  id: string;
  user_id: string;
  action_id: string;
  status: UserActionStatus;
  started_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AIDigest {
  id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  content: string;
  total_kg: number;
  change_pct: number;
  generated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tier: AchievementTier;
  icon: string;
  earned_at: string;
  category?: EmissionCategory | 'overall';
}

// ---------------------------------------------------------------------------
// Derived / Aggregation Types
// ---------------------------------------------------------------------------

export interface EmissionBreakdown {
  transport: number;
  food: number;
  home: number;
  consumption: number;
}

export interface BaselineResult {
  total_kg_month: number;
  breakdown: EmissionBreakdown;
}

export interface EmissionResult {
  co2e_kg: number;
  emission_factor: number;
  factor_source: string;
}

export interface ActivitySummary {
  total_co2e_kg: number;
  count: number;
  breakdown: EmissionBreakdown;
  daily_average_kg: number;
  period_days: number;
}

// ---------------------------------------------------------------------------
// Onboarding / Quiz
// ---------------------------------------------------------------------------

export interface OnboardingData {
  display_name: string;
  email: string;
  region_code: RegionCode;
  diet_type: DietType;
  transport_primary: TransportPrimary;
  car_fuel_type: CarFuelType;
  car_km_per_week: number;
  public_transit_km_per_week: number;
  flights_per_year: number;
  housing_type: HousingType;
  household_size: number;
  electricity_kwh_per_month: number;
  gas_heating: boolean;
  renewable_energy: boolean;
  shopping_frequency: 'minimal' | 'average' | 'frequent';
}

// ---------------------------------------------------------------------------
// Simulation
// ---------------------------------------------------------------------------

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  changes: SimulationChange[];
  estimated_reduction_kg_month: number;
  estimated_reduction_pct: number;
}

export interface SimulationChange {
  field: keyof UserProfile;
  from_value: unknown;
  to_value: unknown;
  label: string;
  impact_kg_month: number;
}

// ---------------------------------------------------------------------------
// Digest Generator Input
// ---------------------------------------------------------------------------

export interface DigestInput {
  user_name: string;
  period: string;
  total_kg_this_week: number;
  change_vs_last_week_pct: number;
  top_category: EmissionCategory;
  top_category_kg: number;
  notable_events: string[];
  streak: number;
  vs_cohort_pct: number;
  recommended_action: string;
}

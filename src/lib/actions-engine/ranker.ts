// =============================================================================
// Imprint Carbon Footprint Platform — Action Recommendation Ranker
// =============================================================================

import type {
  Action,
  UserProfile,
  UserAction,
  EmissionCategory,
  ApplicableConditions,
} from '@/types/domain';

// ---------------------------------------------------------------------------
// Actions Library — 25+ pre-defined sustainable actions
// ---------------------------------------------------------------------------

import { ACTIONS_LIBRARY } from './library';


// ---------------------------------------------------------------------------
// Ranking engine
// ---------------------------------------------------------------------------

interface RankedAction {
  action: Action;
  priority_score: number;
  profile_weight: number;
  reasons: string[];
}

/**
 * Rank all applicable actions for a user based on their profile and existing actions.
 *
 * Priority = (base_impact_kg_month × profile_weight) / effort_score
 *
 * profile_weight = 1.5 if the action's category is the user's top emission category
 * profile_weight = 1.0 otherwise
 */
export function rankActions(
  profile: UserProfile,
  userActions: UserAction[],
): RankedAction[] {
  const topCategory = getTopEmissionCategory(profile);
  const dismissedOrCompleted = new Set(
    userActions
      .filter((ua) => ua.status === 'dismissed' || ua.status === 'completed')
      .map((ua) => ua.action_id),
  );

  const ranked: RankedAction[] = [];

  for (const action of ACTIONS_LIBRARY) {
    // Skip dismissed or completed
    if (dismissedOrCompleted.has(action.id)) continue;

    // Check applicable conditions
    if (!meetsConditions(action.applicable_conditions, profile)) continue;

    // Calculate priority
    const isTopCategory = action.category === topCategory;
    const profile_weight = isTopCategory ? 1.5 : 1.0;
    const priority_score = (action.base_impact_kg_month * profile_weight) / action.effort_score;

    const reasons: string[] = [];
    if (isTopCategory) {
      reasons.push(`Targets your highest emission category: ${topCategory}`);
    }
    if (action.effort_score <= 2) {
      reasons.push('Quick and easy to implement');
    }
    if (action.base_impact_kg_month >= 20) {
      reasons.push('High impact action');
    }

    // Check if already doing
    const existingAction = userActions.find(
      (ua) => ua.action_id === action.id && ua.status === 'doing',
    );
    if (existingAction) {
      reasons.push("You're already working on this!");
    }

    ranked.push({ action, priority_score, profile_weight, reasons });
  }

  // Sort by priority (highest first), then by effort (lowest first) for ties
  ranked.sort((a, b) => {
    if (Math.abs(a.priority_score - b.priority_score) < 0.01) {
      return a.action.effort_score - b.action.effort_score;
    }
    return b.priority_score - a.priority_score;
  });

  return ranked;
}

/**
 * Get the top N recommended actions for a user.
 */
export function getTopActions(
  profile: UserProfile,
  userActions: UserAction[],
  count: number = 3,
): RankedAction[] {
  const ranked = rankActions(profile, userActions);

  // Prefer actions the user is NOT already doing
  const notDoing = ranked.filter(
    (r) => !userActions.some((ua) => ua.action_id === r.action.id && ua.status === 'doing'),
  );

  // If we have enough non-doing actions, use those; otherwise mix in
  if (notDoing.length >= count) {
    return notDoing.slice(0, count);
  }

  return ranked.slice(0, count);
}

/**
 * Get a specific action by ID from the library.
 */
export function getActionById(id: string): Action | undefined {
  return ACTIONS_LIBRARY.find((a) => a.id === id);
}

/**
 * Get all actions in a specific category.
 */
export function getActionsByCategory(category: EmissionCategory): Action[] {
  return ACTIONS_LIBRARY.filter((a) => a.category === category);
}

// ---------------------------------------------------------------------------
// Condition checking
// ---------------------------------------------------------------------------

function meetsConditions(
  conditions: ApplicableConditions,
  profile: UserProfile,
): boolean {
  // Empty conditions = universally applicable
  if (!conditions || Object.keys(conditions).length === 0) return true;

  if (conditions.diet_types && conditions.diet_types.length > 0) {
    if (!conditions.diet_types.includes(profile.diet_type)) return false;
  }

  if (conditions.transport_types && conditions.transport_types.length > 0) {
    if (!conditions.transport_types.includes(profile.transport_primary)) return false;
  }

  if (conditions.car_fuel_types && conditions.car_fuel_types.length > 0) {
    if (!conditions.car_fuel_types.includes(profile.car_fuel_type)) return false;
  }

  if (conditions.housing_types && conditions.housing_types.length > 0) {
    if (!conditions.housing_types.includes(profile.housing_type)) return false;
  }

  if (conditions.min_car_km_per_week !== undefined) {
    if (profile.car_km_per_week < conditions.min_car_km_per_week) return false;
  }

  if (conditions.min_flights_per_year !== undefined) {
    if (profile.flights_per_year < conditions.min_flights_per_year) return false;
  }

  if (conditions.has_gas_heating === true) {
    if (!profile.gas_heating) return false;
  }

  if (conditions.no_renewable_energy === true) {
    if (profile.renewable_energy) return false;
  }

  if (conditions.shopping_frequencies && conditions.shopping_frequencies.length > 0) {
    if (!conditions.shopping_frequencies.includes(profile.shopping_frequency)) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTopEmissionCategory(profile: UserProfile): EmissionCategory {
  // Rough estimation based on profile for ranking purposes
  const scores: Record<EmissionCategory, number> = {
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
  };

  // Transport scoring
  scores.transport += profile.car_km_per_week * 0.170;
  scores.transport += profile.flights_per_year * 50; // rough per-flight
  scores.transport += profile.public_transit_km_per_week * 0.089;

  // Food scoring
  const dietScores: Record<string, number> = {
    omnivore: 120,
    pescatarian: 80,
    vegetarian: 50,
    vegan: 25,
  };
  scores.food = dietScores[profile.diet_type] ?? 80;

  // Home scoring
  scores.home = profile.electricity_kwh_per_month * 0.5; // rough avg grid factor
  if (profile.gas_heating) scores.home += 50;

  // Consumption scoring
  const shoppingScores: Record<string, number> = {
    minimal: 20,
    average: 60,
    frequent: 120,
  };
  scores.consumption = shoppingScores[profile.shopping_frequency] ?? 60;

  // Find max
  let topCategory: EmissionCategory = 'transport';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topCategory = cat as EmissionCategory;
    }
  }

  return topCategory;
}

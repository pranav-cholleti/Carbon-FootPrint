// =============================================================================
// Imprint Carbon Footprint Platform — Action Recommendation Ranker
// =============================================================================

import type {
  Action,
  UserProfile,
  UserAction,
  EmissionCategory,
  ApplicableConditions,
  EffortScore,
} from '@/types/domain';

// ---------------------------------------------------------------------------
// Actions Library — 25+ pre-defined sustainable actions
// ---------------------------------------------------------------------------

export const ACTIONS_LIBRARY: Action[] = [
  // ── Transport ──────────────────────────────────────────────────────────
  {
    id: 'action_carpool',
    title: 'Start carpooling to work',
    description: 'Share your commute with a colleague or neighbor to halve per-person driving emissions.',
    category: 'transport',
    base_impact_kg_month: 35,
    effort_score: 2 as EffortScore,
    applicable_conditions: {
      transport_types: ['car', 'mixed'],
      min_car_km_per_week: 30,
    },
    tips: [
      "Use apps like BlaBlaCar or your company's carpool channel",
      'Start with just 2-3 days per week',
      'Alternate driving duties to share fuel costs',
    ],
    icon: '🚗',
    co_benefits: ['Save on fuel costs', 'Social connection', 'Reduce traffic congestion'],
  },
  {
    id: 'action_public_transit',
    title: 'Switch 2 car trips to public transit per week',
    description: 'Replace two weekly car journeys with bus or train travel to reduce emissions significantly.',
    category: 'transport',
    base_impact_kg_month: 28,
    effort_score: 2 as EffortScore,
    applicable_conditions: {
      transport_types: ['car', 'mixed'],
      min_car_km_per_week: 20,
    },
    tips: [
      'Plan your route in advance using Google Maps transit option',
      'Use the commute time for reading or podcasts',
      'Get a monthly pass for savings',
    ],
    icon: '🚌',
    co_benefits: ['Save on fuel and parking', 'Less driving stress', 'Exercise from walking to stops'],
  },
  {
    id: 'action_cycle_commute',
    title: 'Cycle or walk for short trips',
    description: 'For trips under 5 km, swap the car for a bicycle or walk. Zero emissions and great exercise!',
    category: 'transport',
    base_impact_kg_month: 15,
    effort_score: 3 as EffortScore,
    applicable_conditions: {
      transport_types: ['car', 'mixed'],
      min_car_km_per_week: 10,
    },
    tips: [
      'Start with weekend errands',
      'Invest in a comfortable bike and helmet',
      "Use bike-sharing services if you don't own one",
    ],
    icon: '🚴',
    co_benefits: ['Physical fitness', 'Mental health boost', 'Zero fuel cost'],
  },
  {
    id: 'action_reduce_flights',
    title: 'Replace one flight per year with train travel',
    description: 'Train travel emits up to 85% less CO₂ than flying for domestic routes.',
    category: 'transport',
    base_impact_kg_month: 20,
    effort_score: 3 as EffortScore,
    applicable_conditions: {
      min_flights_per_year: 2,
    },
    tips: [
      'Book sleeper trains for overnight journeys',
      'Consider the journey as part of the experience',
      'Compare total door-to-door time including airport waits',
    ],
    icon: '✈️',
    co_benefits: ['More scenic travel', 'No baggage restrictions', 'City-center to city-center'],
  },
  {
    id: 'action_ev_switch',
    title: 'Consider switching to an EV',
    description: 'Electric vehicles produce 60-70% fewer emissions than petrol cars over their lifetime.',
    category: 'transport',
    base_impact_kg_month: 45,
    effort_score: 5 as EffortScore,
    applicable_conditions: {
      car_fuel_types: ['petrol', 'diesel'],
      min_car_km_per_week: 50,
    },
    tips: [
      'Research government subsidies and tax benefits',
      'Start by test-driving affordable EV models',
      'Check charging infrastructure in your area',
    ],
    icon: '⚡',
    co_benefits: ['Lower maintenance costs', 'Government incentives', 'Quieter drive'],
  },
  {
    id: 'action_efficient_driving',
    title: 'Practice eco-driving techniques',
    description: 'Smooth acceleration, maintaining steady speeds, and proper tire pressure can reduce fuel use by 15-20%.',
    category: 'transport',
    base_impact_kg_month: 12,
    effort_score: 1 as EffortScore,
    applicable_conditions: {
      transport_types: ['car', 'mixed'],
      min_car_km_per_week: 20,
    },
    tips: [
      'Accelerate gently and anticipate stops',
      'Check tire pressure monthly',
      'Remove unnecessary weight from your car',
      'Use cruise control on highways',
    ],
    icon: '🏎️',
    co_benefits: ['Reduced fuel costs', 'Less brake wear', 'Safer driving habits'],
  },

  // ── Food ───────────────────────────────────────────────────────────────
  {
    id: 'action_meatfree_monday',
    title: 'Start Meat-Free Mondays',
    description: 'Going meat-free one day a week can reduce your food footprint by ~15%.',
    category: 'food',
    base_impact_kg_month: 18,
    effort_score: 1 as EffortScore,
    applicable_conditions: {
      diet_types: ['omnivore', 'pescatarian'],
    },
    tips: [
      'Try hearty dishes like dal, pasta, or stir-fry',
      'Explore Indian, Thai, and Mediterranean vegetarian cuisines',
      'Prep meals on Sunday for easy Monday lunches',
    ],
    icon: '🥗',
    co_benefits: ['More fiber and nutrients', 'Often cheaper', 'Culinary exploration'],
  },
  {
    id: 'action_reduce_beef',
    title: 'Swap beef for chicken or fish',
    description: 'Beef has 4x the carbon footprint of chicken. Even partial substitution makes a big difference.',
    category: 'food',
    base_impact_kg_month: 25,
    effort_score: 2 as EffortScore,
    applicable_conditions: {
      diet_types: ['omnivore'],
    },
    tips: [
      'Try chicken or fish versions of your favorite beef dishes',
      'Reserve beef for special occasions',
      'Explore legume-based protein alternatives',
    ],
    icon: '🐄',
    co_benefits: ['Lower saturated fat intake', 'Often more affordable', 'Still enjoy meat'],
  },
  {
    id: 'action_plant_milk',
    title: 'Switch to plant-based milk',
    description: 'Oat, soy, or almond milk produces ~60% less emissions than dairy milk.',
    category: 'food',
    base_impact_kg_month: 8,
    effort_score: 1 as EffortScore,
    applicable_conditions: {
      diet_types: ['omnivore', 'pescatarian', 'vegetarian'],
    },
    tips: [
      'Oat milk froths best for coffee',
      'Soy milk has the most protein',
      'Try different brands to find your favorite',
    ],
    icon: '🥛',
    co_benefits: ['Lactose-free', 'Often fortified with vitamins', 'Longer shelf life'],
  },
  {
    id: 'action_reduce_food_waste',
    title: 'Reduce food waste by 50%',
    description: 'The average household wastes 30% of purchased food. Planning and storage can cut this dramatically.',
    category: 'food',
    base_impact_kg_month: 15,
    effort_score: 2 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Plan meals before shopping',
      'Use the "first in, first out" rule for your fridge',
      'Learn to use vegetable scraps for broth',
      "Compost what you can't eat",
    ],
    icon: '🗑️',
    co_benefits: ['Save money on groceries', 'Less trash', 'Better meal planning habits'],
  },
  {
    id: 'action_eat_seasonal',
    title: 'Eat seasonal and local produce',
    description: 'Seasonal local food travels less and requires less energy-intensive growing methods.',
    category: 'food',
    base_impact_kg_month: 10,
    effort_score: 2 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Visit your local farmers market',
      'Learn which fruits and vegetables are in season',
      'Grow herbs on your windowsill',
    ],
    icon: '🌽',
    co_benefits: ['Fresher and tastier food', 'Support local farmers', 'More nutritious'],
  },
  {
    id: 'action_vegan_days',
    title: 'Go fully vegan 2 days per week',
    description: 'Two plant-only days per week can reduce your food footprint by up to 25%.',
    category: 'food',
    base_impact_kg_month: 22,
    effort_score: 3 as EffortScore,
    applicable_conditions: {
      diet_types: ['omnivore', 'pescatarian', 'vegetarian'],
    },
    tips: [
      "Start with days when you're most at home",
      'Batch-cook lentil curries, stews, and grain bowls',
      'Follow vegan food bloggers for inspiration',
    ],
    icon: '🌱',
    co_benefits: ['Heart health benefits', 'Weight management', 'Discover new recipes'],
  },

  // ── Home ───────────────────────────────────────────────────────────────
  {
    id: 'action_led_bulbs',
    title: 'Switch all lights to LED bulbs',
    description: 'LEDs use 75% less energy than incandescent bulbs and last 25x longer.',
    category: 'home',
    base_impact_kg_month: 8,
    effort_score: 1 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Start with the rooms you use most',
      'Choose warm white (2700K) for living areas',
      'LEDs are now very affordable — often under ₹100 each',
    ],
    icon: '💡',
    co_benefits: ['Lower electricity bills', 'Less heat generation', 'Fewer replacements'],
  },
  {
    id: 'action_unplug_standby',
    title: 'Eliminate standby power usage',
    description: 'Devices on standby can account for 5-10% of your electricity bill. Use power strips.',
    category: 'home',
    base_impact_kg_month: 5,
    effort_score: 1 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Use smart power strips that auto-cut standby',
      'Unplug phone chargers when not in use',
      'Turn off the TV at the switch, not just the remote',
    ],
    icon: '🔌',
    co_benefits: ['Lower electricity bills', 'Reduce fire risk', 'Simple to do'],
  },
  {
    id: 'action_ac_efficiency',
    title: 'Set AC to 24°C instead of 20°C',
    description: 'Each degree warmer reduces AC energy use by 6-8%. 24°C is comfortable and efficient.',
    category: 'home',
    base_impact_kg_month: 12,
    effort_score: 1 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Use a fan alongside the AC to feel cooler',
      'Clean AC filters monthly for efficiency',
      'Close curtains during peak sun hours',
    ],
    icon: '❄️',
    co_benefits: ['Significant electricity savings', 'Less temperature shock', 'Longer AC lifespan'],
  },
  {
    id: 'action_solar_panels',
    title: 'Install rooftop solar panels',
    description: 'Solar panels can reduce your grid electricity consumption by 70-100%, dramatically cutting home emissions.',
    category: 'home',
    base_impact_kg_month: 50,
    effort_score: 5 as EffortScore,
    applicable_conditions: {
      housing_types: ['house'],
      no_renewable_energy: true,
    },
    tips: [
      'Research government subsidies (up to 40% in India)',
      'Get quotes from multiple installers',
      'Start with a 3kW system for a typical household',
    ],
    icon: '☀️',
    co_benefits: ['Electricity bill near zero', 'Energy independence', 'Increases property value'],
  },
  {
    id: 'action_green_energy',
    title: 'Switch to a green energy tariff',
    description: 'Many utilities offer 100% renewable energy plans at minimal extra cost.',
    category: 'home',
    base_impact_kg_month: 40,
    effort_score: 2 as EffortScore,
    applicable_conditions: {
      no_renewable_energy: true,
    },
    tips: [
      "Check your utility's green energy options",
      'Compare prices — green tariffs are often competitive',
      'Look for certified renewable energy suppliers',
    ],
    icon: '🌿',
    co_benefits: ['Support renewable energy growth', 'Stable energy prices', 'Clean conscience'],
  },
  {
    id: 'action_lower_thermostat',
    title: 'Lower heating thermostat by 2°C',
    description: 'Reducing heating by 2°C can save 10-15% on gas/heating emissions.',
    category: 'home',
    base_impact_kg_month: 15,
    effort_score: 1 as EffortScore,
    applicable_conditions: {
      has_gas_heating: true,
    },
    tips: [
      'Wear an extra layer indoors',
      'Use a programmable thermostat',
      "Heat only the rooms you're using",
    ],
    icon: '🌡️',
    co_benefits: ['Lower heating bills', 'Better sleep quality', 'Reduced boiler wear'],
  },
  {
    id: 'action_insulation',
    title: 'Improve home insulation',
    description: 'Proper insulation can reduce heating/cooling energy by 20-40%.',
    category: 'home',
    base_impact_kg_month: 25,
    effort_score: 4 as EffortScore,
    applicable_conditions: {
      housing_types: ['house'],
    },
    tips: [
      'Start with draft-proofing doors and windows',
      'Consider loft/attic insulation first — biggest impact',
      'Check for government grants for insulation upgrades',
    ],
    icon: '🏠',
    co_benefits: ['More comfortable home', 'Lower energy bills', 'Reduced noise'],
  },

  // ── Consumption ────────────────────────────────────────────────────────
  {
    id: 'action_secondhand_clothing',
    title: 'Buy secondhand clothing',
    description: 'Secondhand clothing produces ~84% fewer emissions than new items. Thrifting is trending!',
    category: 'consumption',
    base_impact_kg_month: 12,
    effort_score: 2 as EffortScore,
    applicable_conditions: {
      shopping_frequencies: ['average', 'frequent'],
    },
    tips: [
      'Try online thrift stores like ThredUp, Poshmark',
      'Visit local thrift stores and charity shops',
      'Host clothing swap parties with friends',
    ],
    icon: '👗',
    co_benefits: ['Save money', 'Unique finds', 'Support circular economy'],
  },
  {
    id: 'action_repair_extend',
    title: 'Repair instead of replace',
    description: 'Extending the life of electronics by 1 year reduces their annual carbon footprint by 20-30%.',
    category: 'consumption',
    base_impact_kg_month: 6,
    effort_score: 2 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Learn basic repairs from YouTube tutorials',
      'Visit local repair cafés',
      'Use a protective case for your phone',
      'Keep electronics clean and updated',
    ],
    icon: '🔧',
    co_benefits: ['Save money', 'Learn new skills', 'Reduce e-waste'],
  },
  {
    id: 'action_minimalist_wardrobe',
    title: 'Build a capsule wardrobe',
    description: 'A focused wardrobe of 30-40 versatile pieces reduces clothing purchases and their carbon impact.',
    category: 'consumption',
    base_impact_kg_month: 15,
    effort_score: 3 as EffortScore,
    applicable_conditions: {
      shopping_frequencies: ['average', 'frequent'],
    },
    tips: [
      'Audit your current wardrobe first',
      'Invest in quality basics that mix and match',
      'Follow the "one in, one out" rule',
    ],
    icon: '👔',
    co_benefits: ['Simplified daily decisions', 'Better style', 'Save money long-term'],
  },
  {
    id: 'action_refurbished_tech',
    title: 'Buy refurbished electronics',
    description: 'Refurbished laptops and phones save ~70% of manufacturing emissions compared to new.',
    category: 'consumption',
    base_impact_kg_month: 8,
    effort_score: 1 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Buy certified refurbished for warranty coverage',
      'Check manufacturer refurbished stores first',
      'Apple, Dell, and Lenovo all have refurb programs',
    ],
    icon: '💻',
    co_benefits: ['30-50% cheaper', 'Same performance', 'Warranty included'],
  },
  {
    id: 'action_reduce_packaging',
    title: 'Choose minimal packaging products',
    description: "Packaging accounts for ~5% of a product's carbon footprint. Choose bulk and unpackaged options.",
    category: 'consumption',
    base_impact_kg_month: 4,
    effort_score: 2 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Bring reusable bags and containers',
      'Buy from bulk food stores',
      'Choose products with recyclable packaging',
    ],
    icon: '📦',
    co_benefits: ['Less waste to manage', 'Often fresher products', 'Support sustainable brands'],
  },
  {
    id: 'action_digital_subscriptions',
    title: 'Go digital: cancel paper subscriptions',
    description: 'Switch to digital newspapers, bills, and documents to save paper and delivery emissions.',
    category: 'consumption',
    base_impact_kg_month: 3,
    effort_score: 1 as EffortScore,
    applicable_conditions: {},
    tips: [
      'Set up paperless billing for all accounts',
      'Use note-taking apps instead of notebooks',
      'Read news online or via apps',
    ],
    icon: '📱',
    co_benefits: ['Less clutter', 'Easier to search and organize', 'Save trees'],
  },
];

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

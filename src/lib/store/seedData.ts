import type { EmissionCategory, Subcategory } from '@/types/domain';

/**
 * Raw representation of a seed activity log before dynamic date calculation.
 */
export interface RawSeedLog {
  daysBack: number;
  category: EmissionCategory;
  subcategory: Subcategory;
  description: string;
  quantity: number;
  unit: string;
  co2e_kg: number;
  factor: number;
  source: string;
  meta?: Record<string, unknown>;
}

/**
 * Static seed list representing 3 weeks of activity logs for the demo profile.
 */
export const SEED_LOGS: RawSeedLog[] = [
  // Week 3 (oldest, ~15-21 days ago)
  { daysBack: 21, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 21, category: 'food', subcategory: 'chicken', description: 'Chicken biryani for lunch', quantity: 1, unit: 'serving', co2e_kg: 1.7, factor: 1.7, source: 'Poore & Nemecek 2018' },
  { daysBack: 20, category: 'transport', subcategory: 'bus', description: 'Bus to market', quantity: 12, unit: 'km', co2e_kg: 1.07, factor: 0.089, source: 'UK BEIS 2023' },
  { daysBack: 20, category: 'food', subcategory: 'vegetarian_meal', description: 'Dal & rice dinner', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 19, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 19, category: 'food', subcategory: 'beef', description: 'Beef curry', quantity: 1, unit: 'serving', co2e_kg: 6.6, factor: 6.6, source: 'Poore & Nemecek 2018' },
  { daysBack: 19, category: 'home', subcategory: 'electricity', description: 'Daily electricity', quantity: 8.3, unit: 'kWh', co2e_kg: 5.88, factor: 0.708, source: 'CEA India 2023' },
  { daysBack: 18, category: 'transport', subcategory: 'train', description: 'Train to Secunderabad', quantity: 30, unit: 'km', co2e_kg: 1.23, factor: 0.041, source: 'UK BEIS 2023' },
  { daysBack: 18, category: 'food', subcategory: 'pork', description: 'Pork chops dinner', quantity: 1, unit: 'serving', co2e_kg: 3.0, factor: 3.0, source: 'Poore & Nemecek 2018' },
  { daysBack: 17, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 17, category: 'food', subcategory: 'vegetarian_meal', description: 'Veggie thali', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 17, category: 'consumption', subcategory: 'clothing_new', description: 'New kurta', quantity: 1, unit: 'item', co2e_kg: 25.0, factor: 25.0, source: 'WRAP UK 2023' },
  { daysBack: 16, category: 'food', subcategory: 'dairy', description: 'Chai + paneer', quantity: 2, unit: 'serving', co2e_kg: 1.2, factor: 0.6, source: 'Poore & Nemecek 2018' },
  { daysBack: 16, category: 'transport', subcategory: 'walk_cycle', description: 'Cycled to gym', quantity: 5, unit: 'km', co2e_kg: 0, factor: 0, source: 'N/A' },
  { daysBack: 15, category: 'transport', subcategory: 'petrol_car', description: 'Weekend trip', quantity: 60, unit: 'km', co2e_kg: 10.2, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 15, category: 'food', subcategory: 'fish', description: 'Fish fry dinner', quantity: 1, unit: 'serving', co2e_kg: 1.5, factor: 1.5, source: 'Poore & Nemecek 2018' },

  // Week 2 (8-14 days ago)
  { daysBack: 14, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 14, category: 'food', subcategory: 'chicken', description: 'Chicken tikka', quantity: 1, unit: 'serving', co2e_kg: 1.7, factor: 1.7, source: 'Poore & Nemecek 2018' },
  { daysBack: 14, category: 'home', subcategory: 'electricity', description: 'Weekly electricity', quantity: 58, unit: 'kWh', co2e_kg: 41.06, factor: 0.708, source: 'CEA India 2023' },
  { daysBack: 13, category: 'transport', subcategory: 'bus', description: 'Bus to friends place', quantity: 15, unit: 'km', co2e_kg: 1.34, factor: 0.089, source: 'UK BEIS 2023' },
  { daysBack: 13, category: 'food', subcategory: 'vegan_meal', description: 'Vegan salad bowl', quantity: 1, unit: 'meal', co2e_kg: 0.25, factor: 0.25, source: 'Scarborough et al. 2014' },
  { daysBack: 12, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 12, category: 'food', subcategory: 'vegetarian_meal', description: 'Chole bhature', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 12, category: 'food', subcategory: 'eggs', description: 'Egg omelette breakfast', quantity: 2, unit: 'serving', co2e_kg: 0.9, factor: 0.45, source: 'Poore & Nemecek 2018' },
  { daysBack: 11, category: 'transport', subcategory: 'train', description: 'Train to Hyderabad central', quantity: 25, unit: 'km', co2e_kg: 1.03, factor: 0.041, source: 'UK BEIS 2023' },
  { daysBack: 11, category: 'food', subcategory: 'lamb', description: 'Lamb rogan josh', quantity: 1, unit: 'serving', co2e_kg: 5.6, factor: 5.6, source: 'Poore & Nemecek 2018' },
  { daysBack: 10, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 10, category: 'food', subcategory: 'vegetarian_meal', description: 'Masala dosa', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 10, category: 'consumption', subcategory: 'clothing_secondhand', description: 'Thrifted jeans', quantity: 1, unit: 'item', co2e_kg: 4.0, factor: 4.0, source: 'ThredUp Resale Report 2023' },
  { daysBack: 9, category: 'food', subcategory: 'chicken', description: 'Butter chicken', quantity: 1, unit: 'serving', co2e_kg: 1.7, factor: 1.7, source: 'Poore & Nemecek 2018' },
  { daysBack: 9, category: 'transport', subcategory: 'walk_cycle', description: 'Walked to store', quantity: 2, unit: 'km', co2e_kg: 0, factor: 0, source: 'N/A' },
  { daysBack: 8, category: 'transport', subcategory: 'petrol_car', description: 'Family outing', quantity: 45, unit: 'km', co2e_kg: 7.65, factor: 0.170, source: 'UK BEIS 2023', meta: { passengers: 1 } },
  { daysBack: 8, category: 'food', subcategory: 'vegetarian_meal', description: 'South Indian meals', quantity: 2, unit: 'meal', co2e_kg: 1.0, factor: 0.5, source: 'Scarborough et al. 2014' },

  // Week 1 (most recent, 1-7 days ago)
  { daysBack: 7, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 7, category: 'food', subcategory: 'vegetarian_meal', description: 'Rajma chawal', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 7, category: 'home', subcategory: 'electricity', description: 'Weekly electricity', quantity: 55, unit: 'kWh', co2e_kg: 38.94, factor: 0.708, source: 'CEA India 2023' },
  { daysBack: 6, category: 'transport', subcategory: 'bus', description: 'Bus to mall', quantity: 10, unit: 'km', co2e_kg: 0.89, factor: 0.089, source: 'UK BEIS 2023' },
  { daysBack: 6, category: 'food', subcategory: 'chicken', description: 'Grilled chicken', quantity: 1, unit: 'serving', co2e_kg: 1.7, factor: 1.7, source: 'Poore & Nemecek 2018' },
  { daysBack: 5, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 5, category: 'food', subcategory: 'vegan_meal', description: 'Vegan Buddha bowl', quantity: 1, unit: 'meal', co2e_kg: 0.25, factor: 0.25, source: 'Scarborough et al. 2014' },
  { daysBack: 5, category: 'food', subcategory: 'dairy', description: 'Curd rice', quantity: 1, unit: 'serving', co2e_kg: 0.6, factor: 0.6, source: 'Poore & Nemecek 2018' },
  { daysBack: 4, category: 'transport', subcategory: 'train', description: 'Train to meeting', quantity: 20, unit: 'km', co2e_kg: 0.82, factor: 0.041, source: 'UK BEIS 2023' },
  { daysBack: 4, category: 'food', subcategory: 'vegetarian_meal', description: 'Paneer butter masala', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 3, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 3, category: 'food', subcategory: 'fish', description: 'Fish curry', quantity: 1, unit: 'serving', co2e_kg: 1.5, factor: 1.5, source: 'Poore & Nemecek 2018' },
  { daysBack: 3, category: 'consumption', subcategory: 'clothing_new', description: 'New formal shirt', quantity: 1, unit: 'item', co2e_kg: 25.0, factor: 25.0, source: 'WRAP UK 2023' },
  { daysBack: 2, category: 'transport', subcategory: 'walk_cycle', description: 'Cycled to park', quantity: 8, unit: 'km', co2e_kg: 0, factor: 0, source: 'N/A' },
  { daysBack: 2, category: 'food', subcategory: 'vegetarian_meal', description: 'Idli sambar', quantity: 1, unit: 'meal', co2e_kg: 0.5, factor: 0.5, source: 'Scarborough et al. 2014' },
  { daysBack: 1, category: 'transport', subcategory: 'petrol_car', description: 'Drive to office', quantity: 25, unit: 'km', co2e_kg: 4.25, factor: 0.170, source: 'UK BEIS 2023' },
  { daysBack: 1, category: 'food', subcategory: 'eggs', description: 'Scrambled eggs', quantity: 2, unit: 'serving', co2e_kg: 0.9, factor: 0.45, source: 'Poore & Nemecek 2018' },
  { daysBack: 1, category: 'home', subcategory: 'electricity', description: 'Weekly electricity', quantity: 60, unit: 'kWh', co2e_kg: 42.48, factor: 0.708, source: 'CEA India 2023' },
];

/**
 * Raw representation of a seed goal.
 */
export interface RawSeedGoal {
  id: string;
  title: string;
  description: string;
  target_reduction_pct: number;
  baseline_kg_month: number;
  target_kg_month: number;
  category: EmissionCategory | 'overall';
  daysAgoStart: number;
  daysFromNowEnd: number;
}

/**
 * Static seed list representing Maya's default reduction goals.
 */
export const SEED_GOALS: RawSeedGoal[] = [
  {
    id: 'seed_goal_001',
    title: 'Reduce transport emissions by 20%',
    description: 'Use public transit at least 3 days a week and carpool when driving',
    target_reduction_pct: 20,
    baseline_kg_month: 120,
    target_kg_month: 96,
    category: 'transport',
    daysAgoStart: 21,
    daysFromNowEnd: 60,
  },
  {
    id: 'seed_goal_002',
    title: 'Try 2 meat-free days per week',
    description: 'Replace at least 2 full days of meals with vegetarian or vegan options',
    target_reduction_pct: 15,
    baseline_kg_month: 140,
    target_kg_month: 119,
    category: 'food',
    daysAgoStart: 14,
    daysFromNowEnd: 45,
  },
];

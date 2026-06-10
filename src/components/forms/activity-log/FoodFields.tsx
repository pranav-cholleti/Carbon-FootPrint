'use client';

import React from 'react';

/**
 * Type representing supported food classifications.
 */
export type FoodType =
  | 'beef'
  | 'lamb'
  | 'pork'
  | 'chicken'
  | 'fish'
  | 'vegetarian_meal'
  | 'vegan_meal'
  | 'eggs'
  | 'dairy';

const FOOD_TYPES: { key: FoodType; label: string }[] = [
  { key: 'beef', label: 'Beef meal' },
  { key: 'lamb', label: 'Lamb meal' },
  { key: 'pork', label: 'Pork meal' },
  { key: 'chicken', label: 'Chicken meal' },
  { key: 'fish', label: 'Fish meal' },
  { key: 'vegetarian_meal', label: 'Vegetarian meal' },
  { key: 'vegan_meal', label: 'Vegan meal' },
  { key: 'eggs', label: 'Eggs' },
  { key: 'dairy', label: 'Dairy' },
];

/**
 * Props layout for FoodFields.
 */
interface FoodFieldsProps {
  /** The selected type of meal/food. */
  foodType: FoodType;
  /** State setter for food type. */
  setFoodType: (food: FoodType) => void;
  /** Number of portions/servings. */
  servings: number;
  /** State setter for servings. */
  setServings: (servings: number) => void;
}

/**
 * FoodFields renders input controls for logging food consumption.
 * Includes meal selectors and serving stepper buttons.
 *
 * @param {FoodFieldsProps} props - Component properties.
 * @returns {React.ReactElement} The food fields rendering.
 */
export default function FoodFields({
  foodType,
  setFoodType,
  servings,
  setServings,
}: FoodFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label htmlFor="meal-type" className="input-label">Meal Type</label>
        <select
          id="meal-type"
          className="select"
          value={foodType}
          onChange={(e) => setFoodType(e.target.value as FoodType)}
        >
          {FOOD_TYPES.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Servings</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={servings === n}
              onClick={() => setServings(n)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                border:
                  servings === n
                    ? '2px solid var(--accent-green)'
                    : '1.5px solid var(--border-light)',
                background:
                  servings === n ? 'var(--accent-green-bg)' : 'var(--bg-input)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                color:
                  servings === n
                    ? 'var(--accent-green-dark)'
                    : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

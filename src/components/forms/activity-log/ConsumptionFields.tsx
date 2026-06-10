'use client';

import React from 'react';

/**
 * Type representing shopping / purchase items.
 */
export type ConsumptionItem = 'smartphone' | 'laptop' | 'clothing_new' | 'clothing_secondhand';

const CONSUMPTION_ITEMS: { key: ConsumptionItem; label: string }[] = [
  { key: 'smartphone', label: 'New smartphone' },
  { key: 'laptop', label: 'Laptop' },
  { key: 'clothing_new', label: 'Clothing (new)' },
  { key: 'clothing_secondhand', label: 'Clothing (secondhand)' },
];

/**
 * Props layout for ConsumptionFields.
 */
interface ConsumptionFieldsProps {
  /** The type of item purchased. */
  consumptionItem: ConsumptionItem;
  /** State setter for consumption item type. */
  setConsumptionItem: (item: ConsumptionItem) => void;
  /** Numerical item count. */
  itemQuantity: number;
  /** State setter for item quantity. */
  setItemQuantity: (qty: number) => void;
}

/**
 * ConsumptionFields renders input controls for logging apparel/tech purchases.
 * Includes dropdown selectors and item quantity buttons.
 *
 * @param {ConsumptionFieldsProps} props - Component properties.
 * @returns {React.ReactElement} The consumption fields rendering.
 */
export default function ConsumptionFields({
  consumptionItem,
  setConsumptionItem,
  itemQuantity,
  setItemQuantity,
}: ConsumptionFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <label htmlFor="consumption-item" className="input-label">Item</label>
        <select
          id="consumption-item"
          className="select"
          value={consumptionItem}
          onChange={(e) => setConsumptionItem(e.target.value as ConsumptionItem)}
        >
          {CONSUMPTION_ITEMS.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Quantity</span>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={itemQuantity === n}
              onClick={() => setItemQuantity(n)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-sm)',
                border:
                  itemQuantity === n
                    ? '2px solid var(--accent-green)'
                    : '1.5px solid var(--border-light)',
                background:
                  itemQuantity === n
                    ? 'var(--accent-green-bg)'
                    : 'var(--bg-input)',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 700,
                color:
                  itemQuantity === n
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

'use client';

import React from 'react';

/**
 * Props layout for HomeFields.
 */
interface HomeFieldsProps {
  /** The energy resource type. */
  homeType: 'electricity' | 'gas_heating';
  /** State setter for home energy resource. */
  setHomeType: (type: 'electricity' | 'gas_heating') => void;
  /** Numerical energy usage amount in kWh. */
  energyAmount: string;
  /** State setter for energy usage amount. */
  setEnergyAmount: (amount: string) => void;
}

/**
 * HomeFields renders input controls for logging home energy consumption.
 * Includes electricity/gas toggle switches and usage input boxes.
 *
 * @param {HomeFieldsProps} props - Component properties.
 * @returns {React.ReactElement} The home fields rendering.
 */
export default function HomeFields({
  homeType,
  setHomeType,
  energyAmount,
  setEnergyAmount,
}: HomeFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Type</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'electricity' as const, label: '⚡ Electricity' },
            { key: 'gas_heating' as const, label: '🔥 Gas Heating' },
          ].map((h) => (
            <button
              key={h.key}
              type="button"
              aria-pressed={homeType === h.key}
              onClick={() => setHomeType(h.key)}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border:
                  homeType === h.key
                    ? '2px solid var(--cat-home)'
                    : '1.5px solid var(--border-light)',
                background:
                  homeType === h.key
                    ? 'var(--accent-purple-bg)'
                    : 'var(--bg-input)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: homeType === h.key ? 700 : 500,
                color:
                  homeType === h.key
                    ? 'var(--cat-home)'
                    : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {h.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="energy-amount" className="input-label">Amount (kWh)</label>
        <input
          id="energy-amount"
          type="number"
          className="input"
          placeholder="e.g. 50"
          value={energyAmount}
          onChange={(e) => setEnergyAmount(e.target.value)}
          min={0}
          step={0.1}
        />
      </div>
    </div>
  );
}

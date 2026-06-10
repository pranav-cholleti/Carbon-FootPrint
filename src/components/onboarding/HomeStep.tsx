'use client';

import React from 'react';
import OptionButton from './OptionButton';

export interface HomeData {
  homeType: string;
  heatingType: string;
  homeAreaM2: number;
  monthlyEnergyKwh: number;
}

interface HomeStepProps {
  data: HomeData;
  onChange: (d: HomeData) => void;
}

export default function HomeStep({
  data,
  onChange,
}: HomeStepProps) {
  const homeTypes = [
    { value: 'Apartment', emoji: '🏢', label: 'Apartment' },
    { value: 'House', emoji: '🏠', label: 'House' },
    { value: 'Shared', emoji: '🏘️', label: 'Shared housing' },
  ];

  const heatingTypes = [
    { value: 'Gas', emoji: '🔥', label: 'Gas' },
    { value: 'Electric', emoji: '⚡', label: 'Electric' },
    { value: 'Heat Pump', emoji: '♻️', label: 'Heat pump' },
    { value: 'District', emoji: '🏭', label: 'District heating' },
    { value: 'None', emoji: '❄️', label: 'None / tropical' },
  ];

  return (
    <div className="space-y-8">
      {/* Home type */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Home type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {homeTypes.map((h) => (
            <OptionButton
              key={h.value}
              selected={data.homeType === h.value}
              onClick={() => onChange({ ...data, homeType: h.value })}
              emoji={h.emoji}
              label={h.label}
            />
          ))}
        </div>
      </div>

      {/* Heating type */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Heating type
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {heatingTypes.map((h) => (
            <OptionButton
              key={h.value}
              selected={data.heatingType === h.value}
              onClick={() => onChange({ ...data, heatingType: h.value })}
              emoji={h.emoji}
              label={h.label}
            />
          ))}
        </div>
      </div>

      {/* Number inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="home-area" className="input-label">Home area (m²) — optional</label>
          <input
            id="home-area"
            type="number"
            className="input"
            value={data.homeAreaM2 || ''}
            onChange={(e) =>
              onChange({ ...data, homeAreaM2: Number(e.target.value) || 0 })
            }
            placeholder="e.g. 75"
            min={0}
          />
        </div>
        <div>
          <label htmlFor="monthly-energy" className="input-label">Monthly energy usage (kWh)</label>
          <input
            id="monthly-energy"
            type="number"
            className="input"
            value={data.monthlyEnergyKwh || ''}
            onChange={(e) =>
              onChange({
                ...data,
                monthlyEnergyKwh: Number(e.target.value) || 0,
              })
            }
            placeholder="e.g. 200"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}

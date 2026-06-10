'use client';

import React from 'react';
import OptionButton from './OptionButton';

export interface TransportData {
  primaryMode: string;
  fuelType: string;
  weeklyKm: number;
  flightsPerYear: number;
  flightDistance: string;
}

interface TransportStepProps {
  data: TransportData;
  onChange: (d: TransportData) => void;
}

export default function TransportStep({
  data,
  onChange,
}: TransportStepProps) {
  const modes = [
    { value: 'Car', emoji: '🚗', label: 'Car' },
    { value: 'Transit', emoji: '🚌', label: 'Public transit' },
    { value: 'Bike', emoji: '🚲', label: 'Bicycle' },
    { value: 'Walk', emoji: '🚶', label: 'Walking' },
    { value: 'Mixed', emoji: '🔄', label: 'Mixed / varies' },
  ];

  const fuels = ['Petrol', 'Diesel', 'Hybrid', 'EV'];
  const fuelEmoji: Record<string, string> = {
    Petrol: '⛽',
    Diesel: '🛢️',
    Hybrid: '🔋',
    EV: '⚡',
  };

  const distances = [
    { value: 'Short', label: 'Short', sublabel: 'Under 3 hours' },
    { value: 'Medium', label: 'Medium', sublabel: '3–6 hours' },
    { value: 'Long', label: 'Long', sublabel: 'Over 6 hours' },
  ];

  return (
    <div className="space-y-8">
      {/* Primary mode */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Primary transport mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modes.map((m) => (
            <OptionButton
              key={m.value}
              selected={data.primaryMode === m.value}
              onClick={() => onChange({ ...data, primaryMode: m.value })}
              emoji={m.emoji}
              label={m.label}
            />
          ))}
        </div>
      </div>

      {/* Car details */}
      {data.primaryMode === 'Car' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Fuel type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {fuels.map((f) => (
                <OptionButton
                  key={f}
                  selected={data.fuelType === f}
                  onClick={() => onChange({ ...data, fuelType: f })}
                  emoji={fuelEmoji[f]}
                  label={f}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="weekly-km" className="input-label">Weekly driving distance (km)</label>
            <input
              id="weekly-km"
              type="number"
              className="input"
              value={data.weeklyKm || ''}
              onChange={(e) =>
                onChange({ ...data, weeklyKm: Number(e.target.value) || 0 })
              }
              placeholder="e.g. 150"
              min={0}
            />
          </div>
        </div>
      )}

      {/* Flights */}
      <div
        className="card"
        style={{ padding: '20px', background: 'var(--bg-elevated)' }}
      >
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          ✈️ Flights
        </h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="flights-per-year" className="input-label">Flights per year</label>
            <input
              id="flights-per-year"
              type="number"
              className="input"
              value={data.flightsPerYear || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  flightsPerYear: Number(e.target.value) || 0,
                })
              }
              placeholder="e.g. 4"
              min={0}
            />
          </div>

          <div>
            <label className="input-label">Average flight distance</label>
            <div className="grid grid-cols-3 gap-2">
              {distances.map((d) => (
                <OptionButton
                  key={d.value}
                  selected={data.flightDistance === d.value}
                  onClick={() =>
                    onChange({ ...data, flightDistance: d.value })
                  }
                  label={d.label}
                  sublabel={d.sublabel}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

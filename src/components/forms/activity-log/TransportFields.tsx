'use client';

import React from 'react';

/**
 * Configuration options representing the modes of transport.
 */
export type TransportMode = 'car' | 'bus' | 'train' | 'bike' | 'walk' | 'flight';

/**
 * Fuel type classifications for passenger cars.
 */
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'ev';

/**
 * Props layout for TransportFields.
 */
interface TransportFieldsProps {
  /** The currently selected transport mode. */
  transportMode: TransportMode;
  /** State setter for the transport mode. */
  setTransportMode: (mode: TransportMode) => void;
  /** Distance traveled in km. */
  distance: string;
  /** State setter for the distance input. */
  setDistance: (distance: string) => void;
  /** Number of occupants in the car. */
  passengers: number;
  /** State setter for passenger count. */
  setPassengers: (passengers: number) => void;
  /** Fuel type of the vehicle. */
  fuelType: FuelType;
  /** State setter for the fuel type. */
  setFuelType: (fuel: FuelType) => void;
  /** Short or long-haul flight category. */
  flightType: 'short' | 'long';
  /** State setter for flight type. */
  setFlightType: (flight: 'short' | 'long') => void;
}

const TRANSPORT_MODES: { key: TransportMode; label: string; emoji: string }[] = [
  { key: 'car', label: 'Car', emoji: '🚗' },
  { key: 'bus', label: 'Bus', emoji: '🚌' },
  { key: 'train', label: 'Train', emoji: '🚆' },
  { key: 'bike', label: 'Bike', emoji: '🚲' },
  { key: 'walk', label: 'Walk', emoji: '🚶' },
  { key: 'flight', label: 'Flight', emoji: '✈️' },
];

/**
 * TransportFields renders input controls for transport activity logging.
 * Includes distance inputs, vehicle fuel dropdowns, passenger counts, and flight ranges.
 *
 * @param {TransportFieldsProps} props - Component properties.
 * @returns {React.ReactElement} The transport fields rendering.
 */
export default function TransportFields({
  transportMode,
  setTransportMode,
  distance,
  setDistance,
  passengers,
  setPassengers,
  fuelType,
  setFuelType,
  flightType,
  setFlightType,
}: TransportFieldsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Mode selector */}
      <div>
        <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Mode</span>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {TRANSPORT_MODES.map((mode) => (
            <button
              key={mode.key}
              type="button"
              aria-pressed={transportMode === mode.key}
              onClick={() => setTransportMode(mode.key)}
              style={{
                padding: '10px 6px',
                borderRadius: 'var(--radius-sm)',
                border:
                  transportMode === mode.key
                    ? '2px solid var(--cat-transport)'
                    : '1.5px solid var(--border-light)',
                background:
                  transportMode === mode.key
                    ? 'var(--accent-blue-bg)'
                    : 'var(--bg-input)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: transportMode === mode.key ? 700 : 500,
                color:
                  transportMode === mode.key
                    ? 'var(--cat-transport)'
                    : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span>{mode.emoji}</span> {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Distance input (always rendered for active tracking) */}
      <div>
        <label htmlFor="distance" className="input-label">Distance (km)</label>
        <input
          id="distance"
          type="number"
          className="input"
          placeholder="e.g. 25"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          min={0}
          step={0.1}
        />
      </div>

      {/* Car-specific settings */}
      {transportMode === 'car' && (
        <>
          <div>
            <label htmlFor="fuel-type" className="input-label">Fuel Type</label>
            <select
              id="fuel-type"
              className="select"
              value={fuelType}
              onChange={(e) => setFuelType(e.target.value as FuelType)}
            >
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="ev">Electric (EV)</option>
            </select>
          </div>
          <div>
            <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Passengers (including you)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={passengers === n}
                  onClick={() => setPassengers(n)}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    border:
                      passengers === n
                        ? '2px solid var(--accent-green)'
                        : '1.5px solid var(--border-light)',
                    background:
                      passengers === n
                        ? 'var(--accent-green-bg)'
                        : 'var(--bg-input)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 700,
                    color:
                      passengers === n
                        ? 'var(--accent-green-dark)'
                        : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  {n}{n === 4 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Flight-specific settings */}
      {transportMode === 'flight' && (
        <div>
          <span className="input-label" style={{ display: 'block', marginBottom: '6px' }}>Flight Type</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['short', 'long'] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={flightType === t}
                onClick={() => setFlightType(t)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border:
                    flightType === t
                      ? '2px solid var(--accent-green)'
                      : '1.5px solid var(--border-light)',
                  background:
                    flightType === t
                      ? 'var(--accent-green-bg)'
                      : 'var(--bg-input)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: flightType === t ? 700 : 500,
                  color:
                    flightType === t
                      ? 'var(--accent-green-dark)'
                      : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {t === 'short' ? 'Short-haul (<1500km)' : 'Long-haul (>1500km)'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

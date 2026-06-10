'use client';

import React from 'react';
import OptionButton from './OptionButton';

export interface FoodData {
  dietType: string;
  beefFrequency: string;
  localSourcing: string;
}

interface FoodStepProps {
  data: FoodData;
  onChange: (d: FoodData) => void;
}

export default function FoodStep({
  data,
  onChange,
}: FoodStepProps) {
  const dietTypes = [
    { value: 'Omnivore', emoji: '🥩', label: 'Omnivore', sublabel: 'Eat everything' },
    {
      value: 'Flexitarian',
      emoji: '🥗',
      label: 'Flexitarian',
      sublabel: 'Mostly plant-based, some meat',
    },
    { value: 'Vegetarian', emoji: '🥬', label: 'Vegetarian', sublabel: 'No meat or fish' },
    { value: 'Vegan', emoji: '🌱', label: 'Vegan', sublabel: 'No animal products' },
  ];

  const beefOptions = [
    { value: 'Daily', label: 'Daily' },
    { value: 'Several times/week', label: 'Several times/week' },
    { value: 'Weekly', label: 'Weekly' },
    { value: 'Rarely', label: 'Rarely' },
    { value: 'Never', label: 'Never' },
  ];

  const localOptions = [
    { value: 'Rarely', emoji: '🌍', label: 'Rarely' },
    { value: 'Sometimes', emoji: '🛒', label: 'Sometimes' },
    { value: 'Often', emoji: '🌿', label: 'Often' },
  ];

  return (
    <div className="space-y-8">
      {/* Diet type */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Your diet
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {dietTypes.map((d) => (
            <OptionButton
              key={d.value}
              selected={data.dietType === d.value}
              onClick={() => onChange({ ...data, dietType: d.value })}
              emoji={d.emoji}
              label={d.label}
              sublabel={d.sublabel}
            />
          ))}
        </div>
      </div>

      {/* Beef frequency — only for omnivore / flexitarian */}
      {(data.dietType === 'Omnivore' || data.dietType === 'Flexitarian') && (
        <div className="animate-fade-in">
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            🥩 How often do you eat beef?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {beefOptions.map((b) => (
              <OptionButton
                key={b.value}
                selected={data.beefFrequency === b.value}
                onClick={() => onChange({ ...data, beefFrequency: b.value })}
                label={b.label}
              />
            ))}
          </div>
        </div>
      )}

      {/* Local sourcing */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Do you buy local/seasonal produce?
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {localOptions.map((l) => (
            <OptionButton
              key={l.value}
              selected={data.localSourcing === l.value}
              onClick={() => onChange({ ...data, localSourcing: l.value })}
              emoji={l.emoji}
              label={l.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

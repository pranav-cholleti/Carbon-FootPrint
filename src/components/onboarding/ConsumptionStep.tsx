'use client';

import React from 'react';
import OptionButton from './OptionButton';

export interface ConsumptionData {
  shoppingFrequency: string;
  secondhandPreference: string;
  electronicsPurchaseFrequency: string;
}

interface ConsumptionStepProps {
  data: ConsumptionData;
  onChange: (d: ConsumptionData) => void;
}

export default function ConsumptionStep({
  data,
  onChange,
}: ConsumptionStepProps) {
  const shoppingFreqs = [
    { value: 'Monthly', emoji: '🛍️', label: 'Monthly', sublabel: 'Frequent shopper' },
    { value: 'Quarterly', emoji: '📦', label: 'Quarterly', sublabel: 'Every few months' },
    {
      value: 'A few times a year',
      emoji: '🎁',
      label: 'A few times a year',
      sublabel: 'Occasional purchases',
    },
    { value: 'Rarely', emoji: '✨', label: 'Rarely', sublabel: 'Minimalist' },
  ];

  const secondhandOptions = [
    { value: 'Yes', emoji: '♻️', label: 'Yes', sublabel: 'I love thrifting!' },
    { value: 'No', emoji: '🏷️', label: 'No', sublabel: 'Prefer new items' },
  ];

  const electronicsOptions = [
    { value: 'Yearly', emoji: '📱', label: 'Yearly', sublabel: 'Latest tech' },
    {
      value: 'Every 2-3 years',
      emoji: '💻',
      label: 'Every 2–3 years',
      sublabel: 'When needed',
    },
    { value: 'Rarely', emoji: '🔧', label: 'Rarely', sublabel: 'Use until they break' },
  ];

  return (
    <div className="space-y-8">
      {/* Shopping frequency */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          How often do you shop for clothes/goods?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {shoppingFreqs.map((s) => (
            <OptionButton
              key={s.value}
              selected={data.shoppingFrequency === s.value}
              onClick={() =>
                onChange({ ...data, shoppingFrequency: s.value })
              }
              emoji={s.emoji}
              label={s.label}
              sublabel={s.sublabel}
            />
          ))}
        </div>
      </div>

      {/* Secondhand */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          Do you prefer secondhand/pre-owned items?
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {secondhandOptions.map((s) => (
            <OptionButton
              key={s.value}
              selected={data.secondhandPreference === s.value}
              onClick={() =>
                onChange({ ...data, secondhandPreference: s.value })
              }
              emoji={s.emoji}
              label={s.label}
              sublabel={s.sublabel}
            />
          ))}
        </div>
      </div>

      {/* Electronics */}
      <div>
        <h3
          className="text-sm font-semibold uppercase tracking-wide mb-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          How often do you buy new electronics?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {electronicsOptions.map((e) => (
            <OptionButton
              key={e.value}
              selected={data.electronicsPurchaseFrequency === e.value}
              onClick={() =>
                onChange({
                  ...data,
                  electronicsPurchaseFrequency: e.value,
                })
              }
              emoji={e.emoji}
              label={e.label}
              sublabel={e.sublabel}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/* ──────────────────── Types ──────────────────── */

interface TransportData {
  primaryMode: string;
  fuelType: string;
  weeklyKm: number;
  flightsPerYear: number;
  flightDistance: string;
}

interface HomeData {
  homeType: string;
  heatingType: string;
  homeAreaM2: number;
  monthlyEnergyKwh: number;
}

interface FoodData {
  dietType: string;
  beefFrequency: string;
  localSourcing: string;
}

interface ConsumptionData {
  shoppingFrequency: string;
  secondhandPreference: string;
  electronicsPurchaseFrequency: string;
}

/* ──────────────────── Grid factors by region ──────────────────── */

const GRID_FACTORS: Record<string, number> = {
  'IN-TG': 0.82,   // kgCO2/kWh India Telangana
  'US-CA': 0.23,   // California is fairly clean
  'GB': 0.21,
  'EU-AVG': 0.28,
  'NO': 0.02,      // Norway is almost entirely hydro
};

/* ──────────────────── Emission factor helpers ──────────────────── */

const TRANSPORT_FACTORS: Record<string, number> = {
  Petrol: 0.21,    // kgCO2/km
  Diesel: 0.27,
  Hybrid: 0.12,
  EV: 0.05,
};

const FOOD_DAILY_FACTORS: Record<string, number> = {
  Omnivore: 3.3,     // kgCO2/day
  Flexitarian: 2.5,
  Vegetarian: 1.7,
  Vegan: 1.2,
};

const BEEF_MULTIPLIERS: Record<string, number> = {
  Daily: 1.4,
  'Several times/week': 1.2,
  Weekly: 1.1,
  Rarely: 1.0,
  Never: 0.9,
};

const SHOPPING_MONTHLY_KG: Record<string, number> = {
  Monthly: 80,
  Quarterly: 45,
  'A few times a year': 25,
  Rarely: 12,
};

/* ──────────────────── Option Button ──────────────────── */

function OptionButton({
  selected,
  onClick,
  emoji,
  label,
  sublabel,
}: {
  selected: boolean;
  onClick: () => void;
  emoji?: string;
  label: string;
  sublabel?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="flex items-center gap-3 w-full text-left px-4 py-3.5 rounded-xl"
      style={{
        minHeight: '52px',
        background: selected ? 'var(--accent-green-bg)' : 'var(--bg-input)',
        border: selected
          ? '2px solid var(--accent-green)'
          : '2px solid transparent',
        color: selected ? 'var(--accent-green-dark)' : 'var(--text-primary)',
        fontWeight: selected ? 600 : 500,
        fontSize: '15px',
        transition: 'all var(--transition-fast)',
        cursor: 'pointer',
      }}
    >
      {emoji && <span className="text-xl flex-shrink-0">{emoji}</span>}
      <div className="flex-1 min-w-0">
        <div>{label}</div>
        {sublabel && (
          <div
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}
          >
            {sublabel}
          </div>
        )}
      </div>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-green)' }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

/* ──────────────────── Onboarding Page ──────────────────── */

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: Transport
  const [transport, setTransport] = useState<TransportData>({
    primaryMode: '',
    fuelType: 'Petrol',
    weeklyKm: 100,
    flightsPerYear: 2,
    flightDistance: 'Short',
  });

  // Step 2: Home
  const [home, setHome] = useState<HomeData>({
    homeType: '',
    heatingType: '',
    homeAreaM2: 60,
    monthlyEnergyKwh: 150,
  });

  // Step 3: Food
  const [food, setFood] = useState<FoodData>({
    dietType: '',
    beefFrequency: 'Weekly',
    localSourcing: 'Sometimes',
  });

  // Step 4: Consumption
  const [consumption, setConsumption] = useState<ConsumptionData>({
    shoppingFrequency: '',
    secondhandPreference: '',
    electronicsPurchaseFrequency: '',
  });

  const [isCalculating, setIsCalculating] = useState(false);

  /* ── Navigation ── */

  const canProceed = (): boolean => {
    switch (step) {
      case 1:
        return !!transport.primaryMode;
      case 2:
        return !!home.homeType && !!home.heatingType;
      case 3:
        return !!food.dietType;
      case 4:
        return (
          !!consumption.shoppingFrequency &&
          !!consumption.secondhandPreference &&
          !!consumption.electronicsPurchaseFrequency
        );
      default:
        return false;
    }
  };

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  /* ── Calculate Baseline ── */

  const calculateBaseline = () => {
    let userRegion = 'IN-TG';
    if (typeof window !== 'undefined') {
      try {
        const u = JSON.parse(
          window.localStorage.getItem('imprint_current_user') || '{}'
        );
        userRegion = u.region || 'IN-TG';
      } catch {
        // fallback
      }
    }

    const gridFactor = GRID_FACTORS[userRegion] ?? 0.45;

    // Transport (monthly)
    let transportMonthly = 0;
    if (transport.primaryMode === 'Car') {
      const factor = TRANSPORT_FACTORS[transport.fuelType] ?? 0.21;
      transportMonthly = transport.weeklyKm * factor * 4.33;
    } else if (transport.primaryMode === 'Transit') {
      transportMonthly = 30 * 0.089 * 4.33; // ~30km/week avg by transit
    } else if (transport.primaryMode === 'Mixed') {
      transportMonthly = 20 * 0.15 * 4.33;
    }
    // Flights: rough amortized monthly
    const flightDistKm: Record<string, number> = {
      Short: 800,
      Medium: 2500,
      Long: 6000,
    };
    const avgFlightDist = flightDistKm[transport.flightDistance] ?? 800;
    const flightMonthly =
      (transport.flightsPerYear * avgFlightDist * 0.255) / 12;
    transportMonthly += flightMonthly;

    // Food (monthly)
    const dailyFoodFactor = FOOD_DAILY_FACTORS[food.dietType] ?? 2.5;
    const beefMult =
      food.dietType === 'Omnivore' || food.dietType === 'Flexitarian'
        ? BEEF_MULTIPLIERS[food.beefFrequency] ?? 1.0
        : 1.0;
    const localMult =
      food.localSourcing === 'Often'
        ? 0.9
        : food.localSourcing === 'Sometimes'
          ? 0.95
          : 1.0;
    const foodMonthly = dailyFoodFactor * beefMult * localMult * 30;

    // Home (monthly)
    const homeMonthly = home.monthlyEnergyKwh * gridFactor;

    // Consumption (monthly)
    let consumptionMonthly = SHOPPING_MONTHLY_KG[consumption.shoppingFrequency] ?? 40;
    if (consumption.secondhandPreference === 'Yes') {
      consumptionMonthly *= 0.7;
    }
    if (consumption.electronicsPurchaseFrequency === 'Rarely') {
      consumptionMonthly *= 0.85;
    } else if (
      consumption.electronicsPurchaseFrequency === 'Every 2-3 years'
    ) {
      consumptionMonthly *= 0.95;
    }

    const totalMonthly =
      transportMonthly + foodMonthly + homeMonthly + consumptionMonthly;

    return {
      transport_kg_month: Math.round(transportMonthly * 10) / 10,
      food_kg_month: Math.round(foodMonthly * 10) / 10,
      home_kg_month: Math.round(homeMonthly * 10) / 10,
      consumption_kg_month: Math.round(consumptionMonthly * 10) / 10,
      baseline_kg_month: Math.round(totalMonthly * 10) / 10,
    };
  };

  const handleFinish = async () => {
    setIsCalculating(true);

    await new Promise((r) => setTimeout(r, 1200));

    const baseline = calculateBaseline();

    const profile = {
      transport,
      home,
      food,
      consumption,
      ...baseline,
      completedAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'imprint_user_profile',
        JSON.stringify(profile)
      );
    }

    router.push('/dashboard');
  };

  /* ── Render Steps ── */

  const renderStep = () => {
    switch (step) {
      case 1:
        return <TransportStep data={transport} onChange={setTransport} />;
      case 2:
        return <HomeStep data={home} onChange={setHome} />;
      case 3:
        return <FoodStep data={food} onChange={setFood} />;
      case 4:
        return (
          <ConsumptionStep data={consumption} onChange={setConsumption} />
        );
      default:
        return null;
    }
  };

  const stepTitles = [
    { emoji: '🚗', title: 'How do you get around?' },
    { emoji: '🏠', title: 'Tell us about your home.' },
    { emoji: '🍽️', title: 'What does a typical week of eating look like?' },
    { emoji: '🛍️', title: 'One last thing — what do you buy?' },
  ];

  /* ── Calculating overlay ── */
  if (isCalculating) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="flex flex-col items-center gap-5 animate-fade-in text-center px-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
            style={{ background: 'var(--accent-green-bg)' }}
          >
            <Sparkles
              className="w-10 h-10"
              style={{ color: 'var(--accent-green)' }}
            />
          </div>
          <div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Calculating your footprint…
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
              We&apos;re crunching the numbers based on your answers
            </p>
          </div>
          <div
            className="w-48 h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <div
              className="h-full rounded-full"
              style={{
                background:
                  'linear-gradient(90deg, var(--accent-green), var(--accent-green-light))',
                animation: 'shimmer 1.5s infinite',
                backgroundSize: '200% 100%',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 sm:px-6"
        style={{
          height: '64px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'var(--accent-green)' }}
        >
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-lg font-bold"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Imprint Setup
        </span>
        <div className="flex-1" />
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Step {step} of {TOTAL_STEPS}
        </span>
      </header>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-secondary)' }}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-4">
          <div className="progress-bar" style={{ height: '6px' }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${(step / TOTAL_STEPS) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step title */}
          <div className="mb-8 animate-fade-in" key={`title-${step}`}>
            <div className="text-4xl mb-3">{stepTitles[step - 1].emoji}</div>
            <h1
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {stepTitles[step - 1].title}
            </h1>
          </div>

          {/* Step content */}
          <div className="animate-fade-in" key={`content-${step}`}>
            {renderStep()}
          </div>
        </div>
      </div>

      {/* Footer navigation */}
      <div
        className="sticky bottom-0 px-4 sm:px-6 py-4"
        style={{
          background: 'rgba(249, 247, 244, 0.9)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={goNext}
              disabled={!canProceed()}
              style={{
                opacity: canProceed() ? 1 : 0.5,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
              }}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={handleFinish}
              disabled={!canProceed()}
              style={{
                opacity: canProceed() ? 1 : 0.5,
                cursor: canProceed() ? 'pointer' : 'not-allowed',
              }}
            >
              <Sparkles className="w-4 h-4" />
              See My Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Step 1: Transport
   ══════════════════════════════════════════════════════════════════ */

function TransportStep({
  data,
  onChange,
}: {
  data: TransportData;
  onChange: (d: TransportData) => void;
}) {
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

/* ══════════════════════════════════════════════════════════════════
   Step 2: Home Energy
   ══════════════════════════════════════════════════════════════════ */

function HomeStep({
  data,
  onChange,
}: {
  data: HomeData;
  onChange: (d: HomeData) => void;
}) {
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

/* ══════════════════════════════════════════════════════════════════
   Step 3: Food
   ══════════════════════════════════════════════════════════════════ */

function FoodStep({
  data,
  onChange,
}: {
  data: FoodData;
  onChange: (d: FoodData) => void;
}) {
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

/* ══════════════════════════════════════════════════════════════════
   Step 4: Consumption
   ══════════════════════════════════════════════════════════════════ */

function ConsumptionStep({
  data,
  onChange,
}: {
  data: ConsumptionData;
  onChange: (d: ConsumptionData) => void;
}) {
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

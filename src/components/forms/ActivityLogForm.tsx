'use client';

import { useState, useCallback, useEffect } from 'react';
import { X } from 'lucide-react';
import type {
  ActivityLog,
  EmissionCategory,
  Subcategory,
} from '@/types/domain';
import { calculateEmission } from '@/lib/emissions/calculator';
import { getEquivalency, getAlternativeComparison } from '@/lib/emissions/equivalencies';
import { getProfile, getCurrentUser, addActivityLog } from '@/lib/store';

import TransportFields, { TransportMode, FuelType } from './activity-log/TransportFields';
import FoodFields, { FoodType } from './activity-log/FoodFields';
import HomeFields from './activity-log/HomeFields';
import ConsumptionFields, { ConsumptionItem } from './activity-log/ConsumptionFields';

// ---------------------------------------------------------------------------
// Category configurations
// ---------------------------------------------------------------------------

const CATEGORIES: { key: EmissionCategory; label: string; emoji: string }[] = [
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'food', label: 'Food', emoji: '🥗' },
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'consumption', label: 'Purchases', emoji: '🛍️' },
];

const FOOD_TYPES_LABELS: Record<FoodType, string> = {
  beef: 'Beef meal',
  lamb: 'Lamb meal',
  pork: 'Pork meal',
  chicken: 'Chicken meal',
  fish: 'Fish meal',
  vegetarian_meal: 'Vegetarian meal',
  vegan_meal: 'Vegan meal',
  eggs: 'Eggs',
  dairy: 'Dairy',
};

const CONSUMPTION_ITEMS_LABELS: Record<ConsumptionItem, string> = {
  smartphone: 'New smartphone',
  laptop: 'Laptop',
  clothing_new: 'Clothing (new)',
  clothing_secondhand: 'Clothing (secondhand)',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

/**
 * Props layout for ActivityLogForm.
 */
interface ActivityLogFormProps {
  /** Flag showing if the form overlay is active. */
  isOpen: boolean;
  /** Callback to trigger when closing the form overlay. */
  onClose: () => void;
  /** Callback triggered when a log is successfully calculated and submitted. */
  onSubmit: (log: ActivityLog, equivalency: string, alternative: string) => void;
  /** Render as modal overlay (default: true) or inline sheet. */
  isModal?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ActivityLogForm component handles user activity logging for different categories.
 * Orchestrates category switching, manages sub-form states, invokes calculations,
 * and handles database/localStorage submissions.
 *
 * @param {ActivityLogFormProps} props - Component properties.
 * @returns {React.ReactElement | null} The form layout, or null if not open.
 */
export default function ActivityLogForm({
  isOpen,
  onClose,
  onSubmit,
  isModal = true,
}: ActivityLogFormProps) {
  // Main Category state
  const [category, setCategory] = useState<EmissionCategory>('transport');

  // Transport sub-form states
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [distance, setDistance] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [flightType, setFlightType] = useState<'short' | 'long'>('short');

  // Food sub-form states
  const [foodType, setFoodType] = useState<FoodType>('chicken');
  const [servings, setServings] = useState<number>(1);

  // Home Energy sub-form states
  const [homeType, setHomeType] = useState<'electricity' | 'gas_heating'>('electricity');
  const [energyAmount, setEnergyAmount] = useState<string>('');

  // Consumption sub-form states
  const [consumptionItem, setConsumptionItem] = useState<ConsumptionItem>('clothing_new');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Common metadata states
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form inputs upon open triggering
  useEffect(() => {
    if (isOpen) {
      setCategory('transport');
      setTransportMode('car');
      setDistance('');
      setPassengers(1);
      setFuelType('petrol');
      setFlightType('short');
      setFoodType('chicken');
      setServings(1);
      setHomeType('electricity');
      setEnergyAmount('');
      setConsumptionItem('clothing_new');
      setItemQuantity(1);
      setActivityDate(new Date().toISOString().substring(0, 10));
      setDescription('');
    }
  }, [isOpen]);

  /**
   * Resolves the current sub-form inputs into a standardized database schema payload.
   *
   * @returns {object | null} An object mapping subcategory, quantity, units, and descriptions, or null if invalid inputs.
   */
  const resolveActivity = useCallback((): {
    subcategory: Subcategory;
    quantity: number;
    unit: string;
    metadata: Record<string, unknown>;
    descriptionFallback: string;
  } | null => {
    if (category === 'transport') {
      const km = parseFloat(distance);
      if (!km || km <= 0) return null;

      let subcategory: Subcategory;
      const metadata: Record<string, unknown> = {};
      let descriptionFallback = '';

      switch (transportMode) {
        case 'car': {
          const fuelMap: Record<FuelType, Subcategory> = {
            petrol: 'petrol_car',
            diesel: 'diesel_car',
            hybrid: 'hybrid_car',
            ev: 'ev',
          };
          subcategory = fuelMap[fuelType];
          if (passengers > 1) metadata.passengers = passengers;
          descriptionFallback = `${fuelType.charAt(0).toUpperCase() + fuelType.slice(1)} car — ${km} km`;
          break;
        }
        case 'bus':
          subcategory = 'bus';
          descriptionFallback = `Bus — ${km} km`;
          break;
        case 'train':
          subcategory = 'train';
          descriptionFallback = `Train — ${km} km`;
          break;
        case 'bike':
        case 'walk':
          subcategory = 'walk_cycle';
          descriptionFallback = `${transportMode === 'bike' ? 'Cycled' : 'Walked'} — ${km} km`;
          break;
        case 'flight':
          subcategory = flightType === 'short' ? 'flight_short' : 'flight_long';
          descriptionFallback = `${flightType === 'short' ? 'Short-haul' : 'Long-haul'} flight — ${km} km`;
          break;
        default:
          return null;
      }

      return { subcategory, quantity: km, unit: 'km', metadata, descriptionFallback };
    }

    if (category === 'food') {
      return {
        subcategory: foodType,
        quantity: servings,
        unit: foodType.includes('meal') ? 'meal' : 'serving',
        metadata: {},
        descriptionFallback: `${FOOD_TYPES_LABELS[foodType] ?? foodType} × ${servings}`,
      };
    }

    if (category === 'home') {
      const kwh = parseFloat(energyAmount);
      if (!kwh || kwh <= 0) return null;
      return {
        subcategory: homeType,
        quantity: kwh,
        unit: 'kWh',
        metadata: {},
        descriptionFallback: `${homeType === 'electricity' ? 'Electricity' : 'Gas heating'} — ${kwh} kWh`,
      };
    }

    if (category === 'consumption') {
      return {
        subcategory: consumptionItem,
        quantity: itemQuantity,
        unit: 'item',
        metadata: {},
        descriptionFallback: `${CONSUMPTION_ITEMS_LABELS[consumptionItem] ?? consumptionItem} × ${itemQuantity}`,
      };
    }

    return null;
  }, [
    category, transportMode, distance, passengers, fuelType, flightType,
    foodType, servings, homeType, energyAmount, consumptionItem, itemQuantity,
  ]);

  /**
   * Commits the activity log entry to store and calculates equivalent metrics.
   */
  const handleSubmit = useCallback(() => {
    const resolved = resolveActivity();
    if (!resolved) return;

    setSubmitting(true);

    try {
      const user = getCurrentUser();
      const profile = getProfile();
      const regionCode = profile?.region_code ?? 'IN';

      const result = calculateEmission(
        resolved.subcategory,
        resolved.quantity,
        resolved.unit,
        resolved.metadata,
        regionCode,
      );

      const logDate = new Date(activityDate);
      logDate.setHours(new Date().getHours(), new Date().getMinutes());

      const activityLog = addActivityLog({
        user_id: user?.id ?? 'anonymous',
        category,
        subcategory: resolved.subcategory,
        description: description.trim() || resolved.descriptionFallback,
        quantity: resolved.quantity,
        unit: resolved.unit,
        co2e_kg: result.co2e_kg,
        emission_factor: result.emission_factor,
        factor_source: result.factor_source,
        metadata: resolved.metadata,
        logged_at: logDate.toISOString(),
      });

      const equivalency = getEquivalency(result.co2e_kg);
      const alternative = getAlternativeComparison(resolved.subcategory, result.co2e_kg);

      onSubmit(activityLog, equivalency, alternative ?? '');
    } catch (error) {
      console.error('[ActivityLogForm] Failed to submit log:', error);
    } finally {
      setSubmitting(false);
    }
  }, [resolveActivity, activityDate, category, description, onSubmit]);

  if (!isOpen) return null;

  const isValid = resolveActivity() !== null;

  const formBody = (
    <>
      {/* Category Navigation Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '20px',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            aria-pressed={category === cat.key}
            onClick={() => setCategory(cat.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '12px 8px',
              borderRadius: 'var(--radius-md)',
              border:
                category === cat.key
                  ? '2px solid var(--accent-green)'
                  : '2px solid var(--border-light)',
              background:
                category === cat.key ? 'var(--accent-green-bg)' : 'var(--bg-input)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              fontSize: '13px',
              fontWeight: category === cat.key ? 700 : 500,
              color: category === cat.key ? 'var(--accent-green-dark)' : 'var(--text-secondary)',
            }}
          >
            <span style={{ fontSize: '22px' }}>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Render Category specific forms dynamically */}
      {category === 'transport' && (
        <TransportFields
          transportMode={transportMode}
          setTransportMode={setTransportMode}
          distance={distance}
          setDistance={setDistance}
          passengers={passengers}
          setPassengers={setPassengers}
          fuelType={fuelType}
          setFuelType={setFuelType}
          flightType={flightType}
          setFlightType={setFlightType}
        />
      )}

      {category === 'food' && (
        <FoodFields
          foodType={foodType}
          setFoodType={setFoodType}
          servings={servings}
          setServings={setServings}
        />
      )}

      {category === 'home' && (
        <HomeFields
          homeType={homeType}
          setHomeType={setHomeType}
          energyAmount={energyAmount}
          setEnergyAmount={setEnergyAmount}
        />
      )}

      {category === 'consumption' && (
        <ConsumptionFields
          consumptionItem={consumptionItem}
          setConsumptionItem={setConsumptionItem}
          itemQuantity={itemQuantity}
          setItemQuantity={setItemQuantity}
        />
      )}

      {/* Common Meta Inputs */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-light)',
        }}
      >
        <div>
          <label htmlFor="activity-date" className="input-label">Activity Date</label>
          <input
            id="activity-date"
            type="date"
            className="input"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            max={new Date().toISOString().substring(0, 10)}
          />
        </div>
        <div>
          <label htmlFor="activity-description" className="input-label">Description (optional)</label>
          <input
            id="activity-description"
            type="text"
            className="input"
            placeholder="e.g. Morning commute to office"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={120}
          />
        </div>
      </div>

      {/* Submission Button */}
      <button
        className="btn btn-primary btn-lg"
        style={{ width: '100%', marginTop: '20px' }}
        disabled={!isValid || submitting}
        onClick={handleSubmit}
      >
        {submitting ? 'Calculating…' : '📊 Log Activity'}
      </button>
    </>
  );

  if (!isModal) {
    return <div style={{ width: '100%' }}>{formBody}</div>;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Log Activity
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>{formBody}</div>
      </div>
    </div>
  );
}

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

// ---------------------------------------------------------------------------
// Category & subcategory configuration
// ---------------------------------------------------------------------------

const CATEGORIES: { key: EmissionCategory; label: string; emoji: string }[] = [
  { key: 'transport', label: 'Transport', emoji: '🚗' },
  { key: 'food', label: 'Food', emoji: '🥗' },
  { key: 'home', label: 'Home', emoji: '🏠' },
  { key: 'consumption', label: 'Purchases', emoji: '🛍️' },
];

type TransportMode = 'car' | 'bus' | 'train' | 'bike' | 'walk' | 'flight';

const TRANSPORT_MODES: { key: TransportMode; label: string; emoji: string }[] = [
  { key: 'car', label: 'Car', emoji: '🚗' },
  { key: 'bus', label: 'Bus', emoji: '🚌' },
  { key: 'train', label: 'Train', emoji: '🚆' },
  { key: 'bike', label: 'Bike', emoji: '🚲' },
  { key: 'walk', label: 'Walk', emoji: '🚶' },
  { key: 'flight', label: 'Flight', emoji: '✈️' },
];

type FoodType =
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

type ConsumptionItem = 'smartphone' | 'laptop' | 'clothing_new' | 'clothing_secondhand';

const CONSUMPTION_ITEMS: { key: ConsumptionItem; label: string }[] = [
  { key: 'smartphone', label: 'New smartphone' },
  { key: 'laptop', label: 'Laptop' },
  { key: 'clothing_new', label: 'Clothing (new)' },
  { key: 'clothing_secondhand', label: 'Clothing (secondhand)' },
];

type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'ev';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActivityLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (log: ActivityLog, equivalency: string, alternative: string) => void;
  isModal?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ActivityLogForm({
  isOpen,
  onClose,
  onSubmit,
  isModal = true,
}: ActivityLogFormProps) {
  // Category
  const [category, setCategory] = useState<EmissionCategory>('transport');

  // Transport state
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [distance, setDistance] = useState<string>('');
  const [passengers, setPassengers] = useState<number>(1);
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [flightType, setFlightType] = useState<'short' | 'long'>('short');

  // Food state
  const [foodType, setFoodType] = useState<FoodType>('chicken');
  const [servings, setServings] = useState<number>(1);

  // Home state
  const [homeType, setHomeType] = useState<'electricity' | 'gas_heating'>('electricity');
  const [energyAmount, setEnergyAmount] = useState<string>('');

  // Consumption state
  const [consumptionItem, setConsumptionItem] = useState<ConsumptionItem>('clothing_new');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  // Common
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().substring(0, 10),
  );
  const [description, setDescription] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Reset form on open
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

  // Resolve subcategory, quantity, unit, metadata
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
        descriptionFallback: `${FOOD_TYPES.find((f) => f.key === foodType)?.label ?? foodType} × ${servings}`,
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
        descriptionFallback: `${CONSUMPTION_ITEMS.find((c) => c.key === consumptionItem)?.label ?? consumptionItem} × ${itemQuantity}`,
      };
    }

    return null;
  }, [
    category, transportMode, distance, passengers, fuelType, flightType,
    foodType, servings, homeType, energyAmount, consumptionItem, itemQuantity,
  ]);

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
      console.error('Failed to log activity:', error);
    } finally {
      setSubmitting(false);
    }
  }, [resolveActivity, activityDate, category, description, onSubmit]);

  if (!isOpen) return null;

  const isValid = resolveActivity() !== null;

  const formBody = (
    <>
      {/* Category selector */}
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

          {/* ── Category-specific fields ────────────────────────────────── */}

          {/* TRANSPORT */}
          {category === 'transport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Mode selector */}
              <div>
                <label className="input-label">Mode</label>
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

              {/* Distance */}
              {(transportMode !== 'bike' && transportMode !== 'walk') || true ? (
                <div>
                  <label className="input-label">Distance (km)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 25"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    min={0}
                    step={0.1}
                  />
                </div>
              ) : null}

              {/* Car-specific */}
              {transportMode === 'car' && (
                <>
                  <div>
                    <label className="input-label">Fuel Type</label>
                    <select
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
                    <label className="input-label">Passengers (including you)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {[1, 2, 3, 4].map((n) => (
                        <button
                          key={n}
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

              {/* Flight-specific */}
              {transportMode === 'flight' && (
                <div>
                  <label className="input-label">Flight Type</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['short', 'long'] as const).map((t) => (
                      <button
                        key={t}
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
          )}

          {/* FOOD */}
          {category === 'food' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Meal Type</label>
                <select
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
                <label className="input-label">Servings</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
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
          )}

          {/* HOME */}
          {category === 'home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Type</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {([
                    { key: 'electricity' as const, label: '⚡ Electricity' },
                    { key: 'gas_heating' as const, label: '🔥 Gas Heating' },
                  ]).map((h) => (
                    <button
                      key={h.key}
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
                <label className="input-label">Amount (kWh)</label>
                <input
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
          )}

          {/* CONSUMPTION */}
          {category === 'consumption' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">Item</label>
                <select
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
                <label className="input-label">Quantity</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
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
          )}

          {/* ── Common fields ────────────────────────────────────────── */}
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
              <label className="input-label">Activity Date</label>
              <input
                type="date"
                className="input"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                max={new Date().toISOString().substring(0, 10)}
              />
            </div>
            <div>
              <label className="input-label">Description (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Morning commute to office"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
              />
            </div>
          </div>

          {/* Submit */}
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
    return (
      <div style={{ width: '100%' }}>
        {formBody}
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
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

        <div style={{ padding: '20px 24px 24px' }}>
          {formBody}
        </div>
      </div>
    </div>
  );
}

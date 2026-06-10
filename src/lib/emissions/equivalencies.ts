// =============================================================================
// Imprint Carbon Footprint Platform — Emission Equivalencies
// =============================================================================

import type { Subcategory } from '@/types/domain';

// ---------------------------------------------------------------------------
// Reference constants for equivalency calculations
// ---------------------------------------------------------------------------

const PHONE_CHARGE_KG = 0.008;       // ~8g CO2e per smartphone charge
const BULB_60W_KG_PER_HOUR = 0.012;  // 60W bulb × grid avg ≈ 12g CO2e/hr
const PETROL_CAR_KG_PER_KM = 0.170;  // from factors.json
const TREE_ABSORB_KG_PER_YEAR = 22;  // avg tree absorbs ~22 kg CO2/year
const AVG_SHOWER_KG = 0.5;           // ~0.5 kg per 8-minute gas-heated shower
const AVG_DRIVING_KG_PER_WEEK = 40;  // ~240 km/week × 0.170

// Flight distance references (one-way, km)
const FLIGHT_REFS: { city: string; km: number }[] = [
  { city: 'London to Paris', km: 340 },
  { city: 'London to Berlin', km: 930 },
  { city: 'London to Rome', km: 1430 },
  { city: 'Delhi to Mumbai', km: 1150 },
  { city: 'Delhi to Bengaluru', km: 1740 },
  { city: 'New York to Chicago', km: 1150 },
  { city: 'New York to Miami', km: 1760 },
  { city: 'Sydney to Melbourne', km: 710 },
];

// ---------------------------------------------------------------------------
// Primary equivalency function
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable equivalency string for a given CO2e value.
 * Uses contextual ranges to pick the most relatable comparison.
 */
export function getEquivalency(co2e_kg: number): string {
  const abs = Math.abs(co2e_kg);

  if (abs === 0) {
    return 'Zero emissions — amazing! 🌱';
  }

  // ── Tiny: 0–1 kg ──────────────────────────────────────────────────────
  if (abs < 1) {
    const charges = Math.round(abs / PHONE_CHARGE_KG);
    if (charges <= 1) {
      return 'About the same as charging your phone once';
    }
    return `About the same as charging your phone ${charges} times`;
  }

  // ── Small: 1–5 kg ─────────────────────────────────────────────────────
  if (abs < 5) {
    const hours = abs / BULB_60W_KG_PER_HOUR;
    const days = hours / 24;
    if (days < 1) {
      return `Like leaving a 60W bulb on for ${Math.round(hours)} hours`;
    }
    return `Like leaving a 60W bulb on for ${formatDecimal(days)} days`;
  }

  // ── Medium: 5–20 kg ───────────────────────────────────────────────────
  if (abs < 20) {
    const km = Math.round(abs / PETROL_CAR_KG_PER_KM);
    return `About the same as driving ${km} km in a petrol car`;
  }

  // ── Large: 20–100 kg ──────────────────────────────────────────────────
  if (abs < 100) {
    const flightRef = findClosestFlight(abs);
    if (flightRef) {
      return `Like flying from ${flightRef.city} (one way)`;
    }
    const trees = formatDecimal(abs / (TREE_ABSORB_KG_PER_YEAR / 12));
    return `What ${trees} trees absorb in a month`;
  }

  // ── Very large: 100+ kg ───────────────────────────────────────────────
  const weeks = formatDecimal(abs / AVG_DRIVING_KG_PER_WEEK);
  return `Equivalent to ${weeks} weeks of average driving`;
}

// ---------------------------------------------------------------------------
// Alternative / nudge comparison
// ---------------------------------------------------------------------------

/**
 * Generate a comparison-based nudge for a specific activity.
 * Used to suggest alternatives that are lower-impact.
 */
export function getAlternativeComparison(subcategory: Subcategory, co2e_kg: number): string {
  const nudges: Partial<Record<Subcategory, () => string>> = {
    // ── Transport nudges ─────────────────────────────────────────────────
    petrol_car: () => {
      const trainKm = Math.round(co2e_kg / 0.041);
      return `This trip by train would emit ~${formatDecimal(co2e_kg * 0.041 / 0.170)} kg — saving ${formatDecimal(co2e_kg * (1 - 0.041 / 0.170))} kg CO₂e. That's ${trainKm} km worth of train travel!`;
    },
    diesel_car: () => {
      const saving = co2e_kg * (1 - 0.089 / 0.163);
      return `Taking the bus instead would save ~${formatDecimal(saving)} kg CO₂e (${Math.round((saving / co2e_kg) * 100)}% less)`;
    },
    hybrid_car: () => {
      const evSaving = co2e_kg * (1 - 0.053 / 0.105);
      return `A fully electric car would cut this by ~${formatDecimal(evSaving)} kg (${Math.round((evSaving / co2e_kg) * 100)}% reduction)`;
    },
    ev: () =>
      `Already one of the cleanest options! This is ${Math.round(co2e_kg / 0.170 * 100 / (co2e_kg / 0.053))}% of what a petrol car would emit`,
    flight_short: () => {
      return `A train covering the same distance would emit ~${formatDecimal(co2e_kg * 0.041 / 0.255)} kg — ${Math.round((1 - 0.041 / 0.255) * 100)}% less`;
    },
    flight_long: () => {
      const trees = Math.round(co2e_kg / TREE_ABSORB_KG_PER_YEAR);
      return trees >= 1
        ? `It would take ${trees} tree${trees !== 1 ? 's' : ''} a full year to absorb this`
        : `It would take a tree about ${Math.round((co2e_kg / TREE_ABSORB_KG_PER_YEAR) * 12)} months to absorb this`;
    },

    // ── Food nudges ──────────────────────────────────────────────────────
    beef: () => {
      const chickenEquiv = co2e_kg / 1.7;
      return `Swapping to chicken would be ${formatDecimal(chickenEquiv)} servings for the same footprint — or ${formatDecimal(co2e_kg / 0.25)} vegan meals!`;
    },
    lamb: () => {
      const saving = co2e_kg - (co2e_kg / 5.6) * 1.7;
      return `Choosing chicken instead would save ~${formatDecimal(saving)} kg CO₂e per serving`;
    },
    pork: () =>
      `A vegetarian meal has ${Math.round((1 - 0.5 / 3.0) * 100)}% less impact — try a meat-free day!`,
    chicken: () =>
      `Already a lower-impact protein! Going veggie would save another ~${formatDecimal(co2e_kg - (co2e_kg / 1.7) * 0.5)} kg`,
    dairy: () =>
      `Plant-based milk alternatives produce ~60% less CO₂e per serving`,

    // ── Home nudges ──────────────────────────────────────────────────────
    electricity: () => {
      const ledSaving = co2e_kg * 0.15;
      return `Switching to LED lighting could save ~${formatDecimal(ledSaving)} kg/month from your electricity footprint`;
    },
    gas_heating: () =>
      `Lowering your thermostat by 1°C could reduce heating emissions by ~10% (~${formatDecimal(co2e_kg * 0.1)} kg)`,

    // ── Consumption nudges ───────────────────────────────────────────────
    clothing_new: () => {
      const saving = co2e_kg - (co2e_kg / 25) * 4;
      return `Buying secondhand would save ~${formatDecimal(saving)} kg CO₂e (${Math.round((saving / co2e_kg) * 100)}% less)`;
    },
    clothing_secondhand: () =>
      `Great choice! Secondhand saves ~84% compared to buying new 👏`,
    smartphone: () =>
      `Keeping your phone an extra year would save ~${formatDecimal(70 / 2 / 12)} kg CO₂e per month`,
    laptop: () =>
      `Choosing a refurbished laptop saves ~70% of manufacturing emissions`,
  };

  const nudgeFn = nudges[subcategory];
  if (nudgeFn) {
    return nudgeFn();
  }

  // Generic fallback
  return getEquivalency(co2e_kg);
}

// ---------------------------------------------------------------------------
// Batch equivalency for summaries
// ---------------------------------------------------------------------------

/**
 * Get multiple equivalency strings for a value (useful for dashboards).
 */
export function getMultipleEquivalencies(co2e_kg: number): string[] {
  const results: string[] = [];
  const abs = Math.abs(co2e_kg);

  if (abs === 0) return ['Zero emissions — amazing! 🌱'];

  // Phone charges
  if (abs < 10) {
    const charges = Math.round(abs / PHONE_CHARGE_KG);
    results.push(`${charges} smartphone charges`);
  }

  // Driving distance
  if (abs > 1) {
    const km = Math.round(abs / PETROL_CAR_KG_PER_KM);
    results.push(`Driving ${km} km in a petrol car`);
  }

  // Showers
  if (abs > 0.5 && abs < 50) {
    const showers = Math.round(abs / AVG_SHOWER_KG);
    results.push(`${showers} hot shower${showers !== 1 ? 's' : ''}`);
  }

  // Tree absorption
  if (abs > 5) {
    const monthsOfTree = formatDecimal((abs / TREE_ABSORB_KG_PER_YEAR) * 12);
    results.push(`${monthsOfTree} months of tree absorption`);
  }

  // Light bulb
  if (abs > 0.5 && abs < 30) {
    const hours = Math.round(abs / BULB_60W_KG_PER_HOUR);
    results.push(`A 60W bulb running for ${hours} hours`);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findClosestFlight(co2e_kg: number): { city: string; km: number } | null {
  // Estimate using short-haul factor (0.255 kg/km)
  const equivKm = co2e_kg / 0.255;

  let best: { city: string; km: number } | null = null;
  let bestDiff = Infinity;

  for (const ref of FLIGHT_REFS) {
    const diff = Math.abs(ref.km - equivKm);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = ref;
    }
  }

  // Only return if reasonably close (within 50%)
  if (best && bestDiff / best.km < 0.5) {
    return best;
  }
  return null;
}

function formatDecimal(value: number): string {
  if (value >= 100) return Math.round(value).toString();
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

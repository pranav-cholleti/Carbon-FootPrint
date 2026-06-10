'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Filter, Zap, BarChart3 } from 'lucide-react';
import EffortImpactMatrix from '@/components/charts/EffortImpactMatrix';
import ActionCard, { ActionData, ActionStatus } from '@/components/cards/ActionCard';

// ---------------------------------------------------------------------------
// ACTIONS LIBRARY — 24 actions
// ---------------------------------------------------------------------------

const ACTIONS_LIBRARY: ActionData[] = [
  // Transport (6)
  {
    id: 'action_walk_short_trips',
    title: 'Switch 2 short car trips/week to walking',
    description: 'Replace short drives (under 2 km) with walking. Good for health and the planet.',
    category: 'transport',
    base_impact_kg_month: 4,
    effort_score: 1,
    tips: [
      'Start with errands within a 15-min walk',
      'Use a step counter to stay motivated',
      'Combine nearby errands into one walk',
    ],
    icon: '🚶',
  },
  {
    id: 'action_carpool',
    title: 'Carpool to work',
    description: 'Share your commute with a colleague or neighbor. Halve your transport emissions instantly.',
    category: 'transport',
    base_impact_kg_month: 8,
    effort_score: 2,
    tips: [
      'Ask colleagues who live nearby',
      'Try carpooling apps like Quick Ride or BlaBlaCar',
      'Even 2 days/week makes a big difference',
    ],
    icon: '🚗',
  },
  {
    id: 'action_train_commute',
    title: 'Take the train instead of driving',
    description: 'For longer commutes, trains emit up to 80% less CO₂ than cars per passenger-km.',
    category: 'transport',
    base_impact_kg_month: 12,
    effort_score: 3,
    tips: [
      'Get a monthly pass for savings',
      'Use commute time to read or work',
      'Check if your employer offers transit benefits',
    ],
    icon: '🚆',
  },
  {
    id: 'action_cycle_commute',
    title: 'Cycle to work 2 days/week',
    description: 'Cycling produces zero direct emissions and keeps you fit.',
    category: 'transport',
    base_impact_kg_month: 6,
    effort_score: 3,
    tips: [
      'Start with good weather days',
      'Keep a change of clothes at work',
      'Plan a safe route with bike lanes',
    ],
    icon: '🚲',
  },
  {
    id: 'action_reduce_flights',
    title: 'Replace 1 short flight/year with train',
    description: 'A single domestic flight can emit 3-5x more CO₂ than the same journey by rail.',
    category: 'transport',
    base_impact_kg_month: 10,
    effort_score: 4,
    tips: [
      'Compare train vs. flight time including airport overhead',
      'Book trains early for best prices',
      'Enjoy the scenery!',
    ],
    icon: '✈️',
  },
  {
    id: 'action_eco_driving',
    title: 'Practice eco-driving techniques',
    description: 'Smooth acceleration, maintaining tire pressure, and avoiding idling can cut fuel use by 15-20%.',
    category: 'transport',
    base_impact_kg_month: 5,
    effort_score: 1,
    tips: [
      'Avoid hard braking and rapid acceleration',
      'Check tire pressure monthly',
      'Remove unnecessary roof racks',
    ],
    icon: '⛽',
  },

  // Food (6)
  {
    id: 'action_less_beef',
    title: 'Eliminate one beef meal per week',
    description: 'Beef has the highest carbon footprint of any common food — ~6.6 kg CO₂e per serving.',
    category: 'food',
    base_impact_kg_month: 7,
    effort_score: 2,
    tips: [
      'Try chicken or paneer as substitutes',
      'Explore lentil-based curries for protein',
      'Make it a specific day, like Meatless Monday',
    ],
    icon: '🥩',
  },
  {
    id: 'action_veg_days',
    title: 'Go vegetarian 2 days/week',
    description: 'Two meat-free days per week can reduce your food footprint by ~25%.',
    category: 'food',
    base_impact_kg_month: 10,
    effort_score: 2,
    tips: [
      'Indian cuisine has amazing vegetarian options',
      'Prep vegetarian meals on weekends',
      'Try new cuisines — Ethiopian, Thai, Mediterranean',
    ],
    icon: '🥬',
  },
  {
    id: 'action_plant_milk',
    title: 'Switch to plant-based milk',
    description: 'Oat or soy milk produces 60-70% less emissions than dairy milk.',
    category: 'food',
    base_impact_kg_month: 3,
    effort_score: 1,
    tips: [
      'Oat milk froths well for coffee',
      'Try different brands to find your favorite',
      'Soy milk has the most protein',
    ],
    icon: '🥛',
  },
  {
    id: 'action_seasonal_produce',
    title: 'Buy seasonal produce',
    description: 'Out-of-season produce often travels far or grows in heated greenhouses.',
    category: 'food',
    base_impact_kg_month: 2,
    effort_score: 1,
    tips: [
      'Visit your local farmer\'s market',
      'Learn what\'s in season in your region',
      'Frozen local veggies are often lower footprint than fresh imported ones',
    ],
    icon: '🌽',
  },
  {
    id: 'action_reduce_food_waste',
    title: 'Reduce food waste by 50%',
    description: 'About 8-10% of global emissions come from food waste. Plan meals and store food properly.',
    category: 'food',
    base_impact_kg_month: 5,
    effort_score: 2,
    tips: [
      'Plan weekly meals and make a shopping list',
      'Use the FIFO method in your fridge',
      'Freeze leftovers for future meals',
    ],
    icon: '🗑️',
  },
  {
    id: 'action_home_cooking',
    title: 'Cook at home 3 more meals/week',
    description: 'Home cooking is typically 30-50% lower carbon than restaurant meals due to less waste and energy.',
    category: 'food',
    base_impact_kg_month: 4,
    effort_score: 2,
    tips: [
      'Meal prep on Sundays for the week',
      'Start with simple one-pot recipes',
      'Batch cook and freeze portions',
    ],
    icon: '🍳',
  },

  // Home (6)
  {
    id: 'action_led_bulbs',
    title: 'Switch to LED bulbs',
    description: 'LEDs use 75% less energy than incandescent bulbs and last 25x longer.',
    category: 'home',
    base_impact_kg_month: 5,
    effort_score: 1,
    tips: [
      'Start with the most-used rooms',
      'Look for BEE 5-star rated LEDs',
      'Warm white (2700K) is cozy; daylight (5000K) for workspaces',
    ],
    icon: '💡',
  },
  {
    id: 'action_lower_thermostat',
    title: 'Lower thermostat by 2°C',
    description: 'Each degree lower saves 5-10% on heating energy. Layer up instead!',
    category: 'home',
    base_impact_kg_month: 8,
    effort_score: 1,
    tips: [
      'Wear a warm sweater indoors',
      'Use a programmable thermostat',
      'Lower it more at night — good for sleep too',
    ],
    icon: '🌡️',
  },
  {
    id: 'action_cold_laundry',
    title: 'Use cold water for laundry',
    description: '90% of washing machine energy goes to heating water. Cold wash cleans just as well.',
    category: 'home',
    base_impact_kg_month: 3,
    effort_score: 1,
    tips: [
      'Modern detergents work great in cold water',
      'Reserve hot wash for towels and bedding only',
      'Full loads only — saves water and energy',
    ],
    icon: '🧺',
  },
  {
    id: 'action_air_dry',
    title: 'Air dry clothes instead of using dryer',
    description: 'Clothes dryers are one of the most energy-intensive appliances. Sun drying is free!',
    category: 'home',
    base_impact_kg_month: 4,
    effort_score: 1,
    tips: [
      'Use a drying rack indoors during rainy days',
      'Sunlight is a natural whitener',
      'Clothes last longer when air dried',
    ],
    icon: '☀️',
  },
  {
    id: 'action_unplug_standby',
    title: 'Unplug devices on standby',
    description: 'Standby power (vampire energy) accounts for 5-10% of household electricity.',
    category: 'home',
    base_impact_kg_month: 3,
    effort_score: 1,
    tips: [
      'Use power strips to switch off groups of devices',
      'Focus on TVs, gaming consoles, and chargers',
      'Smart plugs can automate this',
    ],
    icon: '🔌',
  },
  {
    id: 'action_efficient_ac',
    title: 'Set AC to 24°C instead of 20°C',
    description: 'Every degree warmer on AC saves 6% energy. 24°C is comfortable and efficient.',
    category: 'home',
    base_impact_kg_month: 6,
    effort_score: 1,
    tips: [
      'Use a ceiling fan with AC for better circulation',
      'Clean AC filters monthly for efficiency',
      'Close curtains during peak sun hours',
    ],
    icon: '❄️',
  },

  // Consumption (6)
  {
    id: 'action_secondhand_clothing',
    title: 'Buy secondhand clothes',
    description: 'The fashion industry produces ~10% of global emissions. Thrifting cuts your clothing footprint by 80%.',
    category: 'consumption',
    base_impact_kg_month: 6,
    effort_score: 2,
    tips: [
      'Check out thrift stores and online resale platforms',
      'Host a clothing swap with friends',
      'Quality vintage pieces often last longer',
    ],
    icon: '👕',
  },
  {
    id: 'action_repair',
    title: 'Repair instead of replace',
    description: 'Extending the life of products by just 9 months can reduce their carbon footprint by 20-30%.',
    category: 'consumption',
    base_impact_kg_month: 4,
    effort_score: 2,
    tips: [
      'Learn basic sewing for clothing repairs',
      'YouTube has great repair tutorials for electronics',
      'Find local repair cafés in your city',
    ],
    icon: '🔧',
  },
  {
    id: 'action_no_single_use_plastic',
    title: 'Avoid single-use plastics',
    description: 'Carry reusable bags, bottles, and containers. Plastic production is very carbon-intensive.',
    category: 'consumption',
    base_impact_kg_month: 2,
    effort_score: 1,
    tips: [
      'Keep a reusable bag in your car/bag',
      'Carry a water bottle everywhere',
      'Say no to plastic straws and cutlery',
    ],
    icon: '♻️',
  },
  {
    id: 'action_extend_phone',
    title: 'Extend phone lifecycle to 3+ years',
    description: 'Manufacturing a new smartphone emits ~70 kg CO₂. Keep yours longer!',
    category: 'consumption',
    base_impact_kg_month: 3,
    effort_score: 1,
    tips: [
      'Use a good case and screen protector',
      'Replace the battery instead of the phone',
      'Clear storage and update software for better performance',
    ],
    icon: '📱',
  },
  {
    id: 'action_minimal_packaging',
    title: 'Choose products with minimal packaging',
    description: 'Packaging accounts for a significant portion of product emissions. Buy in bulk when possible.',
    category: 'consumption',
    base_impact_kg_month: 2,
    effort_score: 1,
    tips: [
      'Buy from bulk stores',
      'Choose concentrates over ready-to-use products',
      'Prefer paper/cardboard over plastic packaging',
    ],
    icon: '📦',
  },
  {
    id: 'action_borrow_not_buy',
    title: 'Borrow or rent rarely-used items',
    description: 'Power tools, party supplies, books — borrow instead of buying things you rarely use.',
    category: 'consumption',
    base_impact_kg_month: 3,
    effort_score: 2,
    tips: [
      'Use your local library for books',
      'Check neighborhood sharing groups',
      'Rent equipment from hardware stores',
    ],
    icon: '🤝',
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabCategory = 'all' | 'transport' | 'food' | 'home' | 'consumption';

interface UserActionMap {
  [actionId: string]: ActionStatus;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ActionsPage() {
  const [activeTab, setActiveTab] = useState<TabCategory>('all');
  const [userActions, setUserActions] = useState<UserActionMap>({});
  const [showChart, setShowChart] = useState(true);

  // Load saved actions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('imprint_user_actions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it's an array (from store.ts format), convert to our map
        if (Array.isArray(parsed)) {
          const map: UserActionMap = {};
          parsed.forEach((ua: { action_id: string; status: ActionStatus }) => {
            map[ua.action_id] = ua.status;
          });
          setUserActions(map);
        } else {
          setUserActions(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save to localStorage
  const saveActions = useCallback((actions: UserActionMap) => {
    // Save as both our simple map and the store format
    const userId = localStorage.getItem('imprint_current_user_id') || 'user';

    // Update the existing user_actions array format used by the store
    try {
      const existing = JSON.parse(localStorage.getItem('imprint_user_actions') || '[]');
      const existingArray = Array.isArray(existing) ? existing : [];

      Object.entries(actions).forEach(([actionId, status]) => {
        const idx = existingArray.findIndex((ua: { action_id: string }) => ua.action_id === actionId);
        if (idx >= 0) {
          existingArray[idx] = { ...existingArray[idx], status, updated_at: new Date().toISOString() };
        } else if (status) {
          existingArray.push({
            id: `ua_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            user_id: userId,
            action_id: actionId,
            status,
            started_at: status === 'doing' ? new Date().toISOString() : undefined,
            completed_at: status === 'completed' ? new Date().toISOString() : undefined,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      });

      localStorage.setItem('imprint_user_actions', JSON.stringify(existingArray));
    } catch {
      // Fallback: just save the map
      localStorage.setItem('imprint_action_statuses', JSON.stringify(actions));
    }
  }, []);

  const handleStatusChange = useCallback((actionId: string, newStatus: ActionStatus) => {
    setUserActions((prev) => {
      const updated = { ...prev, [actionId]: newStatus };
      saveActions(updated);
      return updated;
    });
  }, [saveActions]);

  // Filter actions by tab
  const filteredActions = activeTab === 'all'
    ? ACTIONS_LIBRARY
    : ACTIONS_LIBRARY.filter((a) => a.category === activeTab);

  // Sort by priority score (impact / effort)
  const sortedActions = [...filteredActions].sort((a, b) => {
    const scoreA = a.base_impact_kg_month / a.effort_score;
    const scoreB = b.base_impact_kg_month / b.effort_score;
    return scoreB - scoreA;
  });

  // Prepare matrix data
  const matrixData = filteredActions.map((a) => ({
    name: a.title,
    effort: a.effort_score,
    impact: a.base_impact_kg_month,
    category: a.category,
  }));

  const tabs: { key: TabCategory; label: string; emoji: string }[] = [
    { key: 'all', label: 'All', emoji: '🌍' },
    { key: 'transport', label: 'Transport', emoji: '🚗' },
    { key: 'food', label: 'Food', emoji: '🍽️' },
    { key: 'home', label: 'Home', emoji: '🏠' },
    { key: 'consumption', label: 'Stuff', emoji: '🛍️' },
  ];

  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>
          <Zap size={22} style={{ display: 'inline', verticalAlign: 'text-bottom', color: 'var(--accent-green)' }} />{' '}
          Actions
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Discover high-impact ways to reduce your footprint
        </p>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '4px',
          marginBottom: '16px',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            <span>{tab.emoji}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Matrix Chart Toggle */}
      <button
        onClick={() => setShowChart(!showChart)}
        className="btn btn-sm btn-ghost"
        style={{
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          color: 'var(--accent-green)',
          fontSize: '13px',
        }}
      >
        <BarChart3 size={14} />
        {showChart ? 'Hide' : 'Show'} Impact Matrix
      </button>

      {/* Effort/Impact Matrix */}
      {showChart && (
        <div className="card" style={{ padding: '16px 8px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px', paddingLeft: '12px' }}>
            Effort vs Impact
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '0 0 8px', paddingLeft: '12px' }}>
            Look for Quick Wins in the top-left!
          </p>
          <EffortImpactMatrix actions={matrixData} />
        </div>
      )}

      {/* Action Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Filter size={14} style={{ color: 'var(--text-tertiary)' }} />
        <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
          {sortedActions.length} actions · sorted by priority
        </span>
      </div>

      {/* Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedActions.map((action, i) => (
          <div
            key={action.id}
            style={{
              opacity: 0,
              animation: `fadeIn 0.4s ease-out ${i * 50}ms forwards`,
            }}
          >
            <ActionCard
              action={action}
              status={userActions[action.id] || null}
              onStatusChange={handleStatusChange}
            />
          </div>
        ))}
      </div>

      {/* Bottom spacer */}
      <div style={{ height: '24px' }} />
    </div>
  );
}

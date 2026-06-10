# System Architecture — Imprint Carbon Footprint Platform

This document maps out the system components, modular structure, data propagation flows, and offline fallback strategy of the Imprint platform.

---

## 1. Folder Structure Overview

```
src/
├── app/                        # Next.js App Router Pages & Routings
│   ├── (auth)/                 # LoginPage, SignupPage
│   ├── (dashboard)/            # Authenticated Routes
│   │   ├── dashboard/          # Summary KPIs, Ring Chart, Actions
│   │   ├── history/            # Calendar view & Activity Log tables
│   │   ├── insights/           # AI Weekly Digest, What-If simulation
│   │   ├── actions/            # Recommendations Matrix
│   │   ├── goals/              # Reduction Target panels
│   │   ├── achievements/       # Milestone Badges grid
│   │   └── profile/            # User settings & onboarding retakes
│   ├── layout.tsx              # Global Theme Context Provider
│   └── page.tsx                # Public Landing Page
├── components/
│   ├── cards/                  # ActionCard, ActivityResultCard, DigestCard
│   ├── charts/                 # CategoryTrendChart, EffortImpactMatrix, EmissionRingChart
│   ├── dashboard/              # DashboardHeader, MonthlyHeroCard, QuickActionsList
│   ├── forms/                  # ActivityLogForm, OnboardingQuiz
│   │   └── activity-log/       # TransportFields, FoodFields, HomeFields, ConsumptionFields
│   ├── history/                # HistorySummaryCards, HistoryFilterBar, HistoryLogList
│   └── layout/                 # Collapsible Sidebar & BottomNav
├── lib/
│   ├── actions-engine/         # Actions library database & ranking heuristics
│   ├── ai/                     # Claude AI prompt templates
│   ├── emissions/              # factors.json, equivalencies, and calculator
│   ├── store/                  # Modular localStorage CRUD operations
│   ├── store.ts                # Unified entry re-export module
│   └── supabase.ts             # Supabase Client initializations
└── types/
    └── domain.ts               # Core entity type declarations (TypeScript)
```

---

## 2. Core Modules & Interactions

### Data Propagation Flow
```
[User Input UI] ──> [Component State] ──> [Emissions Calculator Engine]
                                                     │
                                                     ▼ (footprint kg CO2e)
[Dashboard Refresh] <── [Unified Store API] <── [Activity Logs CRUD]
```

### Seeding Mechanics
When the application launches, `initializeSeedData()` verifies if the localStorage key `imprint_seed_initialized` is set.
If not, it populates the store with demo records relative to the current timestamp. Dates are calculated dynamically:
- **Week 3 Logs**: logged `daysAgo(new Date(), 15-21)`.
- **Week 2 Logs**: logged `daysAgo(new Date(), 8-14)`.
- **Week 1 Logs**: logged `daysAgo(new Date(), 1-7)`.
This ensures that the graphs on the dashboard always display active and fresh metrics rather than stale dates.

---

## 3. Database Fallback Strategy

The store is designed to integrate cloud persistent storage via Supabase Auth and database tables, while operating locally with browser LocalStorage when database credentials are not set.

1. **Supabase Auth Attempt**: Login and signup routes attempt connection to the configured Supabase client wrapper.
2. **Offline Fallback**: If connection fails or environment variables (`NEXT_PUBLIC_SUPABASE_URL`) are omitted, the store falls back to local storage seamlessly, preserving user profiles and logged entries.

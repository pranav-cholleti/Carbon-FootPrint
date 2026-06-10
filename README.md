# Imprint — Know Your Impact. Change It.

> **Imprint** shows you exactly where your carbon comes from, ranks your best opportunities to cut it, and gives you three specific things to do about it this week — in under two minutes a day.

## What It Does

Imprint is a carbon footprint awareness platform designed for people who care about climate change but feel stuck between overwhelm and irrelevance. It bridges the gap from awareness to **personalized, effort-ranked action** — turning abstract emission numbers into concrete, achievable changes tailored to your lifestyle.

## Why Imprint Is Different

| Generic Carbon Tracker | Imprint |
|---|---|
| Shows total tonnes/year | Shows exactly which habits drive 80% of your footprint |
| Generic global averages | Compares you to people with similar profiles in your region |
| "Eat less beef" for everyone | Ranks actions by your personal effort-to-impact ratio |
| One-time questionnaire | Learns from logged activities and refines over time |
| No narrative context | AI-written weekly digest in plain English |
| No momentum mechanics | Streaks, milestones, and visible before/after forecasts |

### Key Differentiators
- **Effort-Impact Matrix** — A unique 2×2 visualization showing every action plotted by effort vs. carbon impact
- **AI-Personalized Weekly Digest** — Warm, specific, non-preachy summaries of your week with actionable suggestions
- **Calculation Transparency** — Every emission factor is cited to peer-reviewed sources (DEFRA 2023, IPCC AR6, Our World in Data)
- **Fair Comparisons** — Compare against your regional cohort, not unfair global averages
- **Lifestyle-Filtered Actions** — Only see recommendations you can actually follow

## Demo

**Demo credentials:**
- Email: `demo@imprint.app`
- Password: `demo123`

The demo account comes pre-seeded with 3 weeks of realistic activity data, active goals, and achievements.

## Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR + client components, great DX |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Charts | Recharts | Lightweight, composable, React-native |
| Icons | Lucide React | Beautiful, consistent icon set |
| Data | localStorage (demo) | Self-contained demo — no external services needed |
| Fonts | Inter + Plus Jakarta Sans + JetBrains Mono | Modern, legible typography |

## Calculation Methodology

Imprint uses a **category × activity × emission-factor** model based on peer-reviewed sources.

### Worked Example
A 35km solo petrol car commute:
```
35 km × 0.170 kg CO₂e/km = 5.95 kg CO₂e
```
That's about the same as leaving a 60W light bulb on for 4 days.

### Emission Factor Sources
- **Transport**: DEFRA 2023 (UK Department for Environment, Food & Rural Affairs)
- **Food**: Poore & Nemecek (2018), Our World in Data
- **Energy**: Regional grid emission factors from IEA 2024
- **Consumption**: Lifecycle analysis averages from peer-reviewed literature

All factors are stored in [`src/lib/emissions/factors.json`](src/lib/emissions/factors.json) with full source citations.

### Key Transport Factors
| Mode | kg CO₂e/km | Source |
|---|---|---|
| Petrol car (solo) | 0.170 | DEFRA 2023 |
| Diesel car (solo) | 0.163 | DEFRA 2023 |
| Hybrid car | 0.105 | DEFRA 2023 |
| Electric vehicle | 0.053 | DEFRA 2023 |
| Bus | 0.089 | DEFRA 2023 |
| Train | 0.041 | DEFRA 2023 |
| Short-haul flight | 0.255 | DEFRA 2023 (incl. RFI×2) |

### Limitations
- Emission factors are estimates from 2023–2024 sources
- Food emissions vary significantly by production region — factors are global averages
- Onboarding baseline is accurate to ±20% before sufficient logs are collected
- App does not currently integrate with utility providers or financial data

## Features

### Core Features
- **Lifestyle Onboarding Quiz** — 4-step guided questionnaire establishing baseline footprint
- **Emission Dashboard** — Animated ring chart with category breakdown, projections, and comparisons
- **Activity Logging** — Quick-entry log with instant CO₂e feedback and contextual equivalencies
- **Personalized Actions** — 25+ recommendations ranked by effort × impact, filtered to your profile
- **Weekly AI Digest** — Template-based personalized narrative summaries
- **Goal Tracking** — Set reduction targets with progress visualization
- **What If Simulator** — Model hypothetical lifestyle changes before committing
- **Achievements** — 8 milestone badges with progress tracking

### Architecture
```
src/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Login, Signup
│   ├── (dashboard)/            # All authenticated routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── history/            # Activity history
│   │   ├── insights/           # AI digest + trends
│   │   │   └── simulate/       # What If simulator
│   │   ├── actions/            # Recommendations + matrix
│   │   ├── goals/              # Goal tracking
│   │   ├── achievements/       # Badges
│   │   ├── profile/            # Settings
│   │   └── onboarding/         # Quiz
│   └── page.tsx                # Landing page
├── components/
│   ├── charts/                 # EmissionRingChart, EffortImpactMatrix, CategoryTrendChart
│   ├── cards/                  # ActionCard, ActivityResultCard, DigestCard, GoalProgressCard
│   ├── forms/                  # ActivityLogForm, OnboardingQuiz
│   └── layout/                 # Sidebar, BottomNav
├── lib/
│   ├── emissions/              # calculator.ts, factors.json, equivalencies.ts
│   ├── ai/                     # digest.ts (template-based generator)
│   ├── actions-engine/         # ranker.ts (25 pre-defined actions)
│   └── store.ts                # localStorage CRUD store with seed data
└── types/
    └── domain.ts               # Full TypeScript domain model
```

## Running Locally

### Prerequisites
- Node.js 18+ 
- npm

### Setup
```bash
# Clone the repository
git clone https://github.com/pranav-cholleti/Carbon-FootPrint.git
cd Carbon-FootPrint/Pranav_Carbon-Footprint

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Account
Use the "Demo Account" button on the login page, or enter:
- Email: `demo@imprint.app`
- Password: `demo123`

## Security

- All emission calculations performed server-side (in `lib/emissions/calculator.ts`)
- Input validation on all numeric fields with sanity limits
- No third-party tracking SDKs
- Privacy-first: minimal data collection, no analytics fingerprinting
- Data export and account deletion available in Profile

## Future Roadmap

- Receipt OCR for automatic food logging
- Utility API integration (smart meters)
- Team/workplace challenges
- Verified carbon offset marketplace
- Supabase integration for persistent cloud storage
- Push notifications for streak reminders

## Licence

MIT

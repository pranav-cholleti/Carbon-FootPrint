# API Reference Guide — Imprint Carbon Footprint Platform

This document describes the parameters, return types, and exceptions of the core functional modules in the Imprint application.

---

## 1. Storage API (`src/lib/store/`)

All storage methods are re-exported by `src/lib/store.ts`.

### User CRUD (`src/lib/store/user.ts`)
* **`getCurrentUser()`**
  - **Returns**: `User | null`
  - **Description**: Returns the active user record from the current session.
* **`setCurrentUser(user: User)`**
  - **Parameters**: `user: User`
  - **Returns**: `void`
  - **Description**: Saves and sets a user profile as active in localStorage.
* **`createUser(displayName: string, email: string)`**
  - **Parameters**:
    - `displayName: string` — Public name.
    - `email: string` — Email address.
  - **Returns**: `User`
  - **Description**: Creates and registers a new user record.
* **`updateUser(updates: Partial<User> & { id: string })`**
  - **Parameters**: `updates: Partial<User> & { id: string }`
  - **Returns**: `User | null`
  - **Description**: Modifies specific user properties.

### Profile API (`src/lib/store/profile.ts`)
* **`getProfile(userId?: string)`**
  - **Parameters**: `userId?: string` (Optional)
  - **Returns**: `UserProfile | null`
  - **Description**: Retrieves baseline onboarding configurations.
* **`saveProfile(profile: UserProfile)`**
  - **Parameters**: `profile: UserProfile`
  - **Returns**: `UserProfile`
  - **Description**: Saves or overwrites a profile config.

### Activity Logs CRUD (`src/lib/store/activity.ts`)
* **`addActivityLog(log: Omit<ActivityLog, 'id' | 'created_at'>)`**
  - **Parameters**: `log` — Log data.
  - **Returns**: `ActivityLog`
  - **Description**: Appends a new activity log entry.
* **`getActivityLogs(filters?: ActivityLogFilters)`**
  - **Parameters**: `filters?: ActivityLogFilters`
  - **Returns**: `ActivityLog[]`
  - **Description**: Retrieves logs sorted chronologically descending. Filters include `userId`, `category`, `subcategory`, `startDate`, `endDate`, and `limit`.
* **`deleteActivityLog(id: string)`**
  - **Parameters**: `id: string`
  - **Returns**: `boolean`
  - **Description**: Deletes a single log by ID.
* **`getActivitySummary(startDate: string, endDate: string, userId?: string)`**
  - **Parameters**:
    - `startDate: string` — ISO start boundary.
    - `endDate: string` — ISO end boundary.
    - `userId?: string` (Optional)
  - **Returns**: `ActivitySummary`
  - **Description**: Compiles total emissions, category distributions, counts, and daily averages.

---

## 2. Calculation Engine (`src/lib/emissions/calculator.ts`)

* **`calculateEmission(subcategory, quantity, unit, metadata, regionCode)`**
  - **Parameters**:
    - `subcategory` (Subcategory) — Targeted item.
    - `quantity` (number) — Quantity (distance, servings, kWh).
    - `unit` (string) — Units (`km`, `serving`, `kWh`, `item`).
    - `metadata` (Record<string, any>) — Additional factors (occupants).
    - `regionCode` (string) — Region code (determines electricity carbon coefficients).
  - **Returns**: `EmissionResult`
  - **Description**: Computes greenhouse gas emissions footprint in kg CO₂e.
    - Cars: `(quantity * factor) / passengers`
    - Electricity: localized grid coefficients (Telangana: `0.708 kg/kWh`, Norway: `0.024 kg/kWh`, UK: `0.207 kg/kWh`).

---

## 3. Equivalency Engine (`src/lib/emissions/equivalencies.ts`)

* **`getEquivalency(co2e_kg)`**
  - **Parameters**: `co2e_kg: number`
  - **Returns**: `string`
  - **Description**: Translates abstract kg emissions into physical concepts (lightbulbs, tree absorption, smartphone charges).
* **`getAlternativeComparison(subcategory, co2e_kg)`**
  - **Parameters**:
    - `subcategory: Subcategory`
    - `co2e_kg: number`
  - **Returns**: `string | null`
  - **Description**: Compares the activity to an alternative choice (e.g. taking the train instead of driving).

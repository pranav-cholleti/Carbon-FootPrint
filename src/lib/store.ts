'use client';

/**
 * Imprint Carbon Footprint Platform — Data Storage System
 *
 * This file serves as the main entry point and unified interface for localStorage CRUD operations.
 * The implementation details are modularized into single-responsibility files under the `store/` directory:
 * - core: Browser compatibility checks, safety wrappers, constants, and utilities.
 * - user: Session tracking, email searches, and user CRUD.
 * - profile: Onboarding details storage.
 * - activity: Log entries CRUD and range calculations.
 * - goals: Reduction goal calculations.
 * - actions: Action recommendation states.
 * - digests: Claude AI-modeled summary logs.
 * - achievements: Badge unlocks.
 * - streaks: Logging frequency analysis.
 * - seed: Demo database initialization.
 */

export * from './store/core';
export * from './store/user';
export * from './store/profile';
export * from './store/activity';
export * from './store/goals';
export * from './store/actions';
export * from './store/digests';
export * from './store/achievements';
export * from './store/streaks';
export * from './store/seed';
export * from './store/seedData';

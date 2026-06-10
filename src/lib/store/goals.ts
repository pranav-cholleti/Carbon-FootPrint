'use client';

import type { Goal } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, nowISO, generateId } from './core';

/**
 * Retrieves the reduction goals set by a user.
 * Defaults to the currently authenticated user session.
 *
 * @param {string} [userId] - The ID of the user whose goals are queried.
 * @returns {Goal[]} The array of goal objects matching the user profile.
 */
export function getGoals(userId?: string): Goal[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  return uid ? goals.filter((g) => g.user_id === uid) : goals;
}

/**
 * Creates and registers a new carbon reduction goal.
 *
 * @param {Omit<Goal, 'id' | 'created_at' | 'updated_at'>} goal - The goal specifications.
 * @returns {Goal} The newly registered goal object.
 */
export function addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Goal {
  const fullGoal: Goal = {
    ...goal,
    id: generateId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  goals.push(fullGoal);
  setItem(KEYS.goals, goals);
  return fullGoal;
}

/**
 * Updates an existing carbon reduction goal with partial parameters.
 *
 * @param {string} id - The ID of the goal to modify.
 * @param {Partial<Goal>} updates - The fields to update.
 * @returns {Goal | null} The updated goal object, or null if not found.
 */
export function updateGoal(id: string, updates: Partial<Goal>): Goal | null {
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  const idx = goals.findIndex((g) => g.id === id);
  if (idx < 0) return null;
  goals[idx] = { ...goals[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.goals, goals);
  return goals[idx];
}

/**
 * Deletes a single goal from localStorage.
 *
 * @param {string} id - The ID of the goal to delete.
 * @returns {boolean} True if deletion was successful, false if the goal was not found.
 */
export function deleteGoal(id: string): boolean {
  const goals = getItem<Goal[]>(KEYS.goals) ?? [];
  const idx = goals.findIndex((g) => g.id === id);
  if (idx < 0) return false;
  goals.splice(idx, 1);
  setItem(KEYS.goals, goals);
  return true;
}

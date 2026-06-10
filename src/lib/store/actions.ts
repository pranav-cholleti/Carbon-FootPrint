'use client';

import type { UserAction } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, nowISO, generateId } from './core';

/**
 * Retrieves the list of actions configured or saved by a user.
 * Defaults to the currently authenticated session user.
 *
 * @param {string} [userId] - The ID of the user whose actions are queried.
 * @returns {UserAction[]} The matching user actions.
 */
export function getUserActions(userId?: string): UserAction[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  return uid ? actions.filter((a) => a.user_id === uid) : actions;
}

/**
 * Saves a new user action status to localStorage.
 *
 * @param {Omit<UserAction, 'id' | 'created_at' | 'updated_at'>} action - The action status properties.
 * @returns {UserAction} The newly added user action.
 */
export function addUserAction(
  action: Omit<UserAction, 'id' | 'created_at' | 'updated_at'>,
): UserAction {
  const fullAction: UserAction = {
    ...action,
    id: generateId(),
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  actions.push(fullAction);
  setItem(KEYS.actions, actions);
  return fullAction;
}

/**
 * Updates an existing user action status (e.g. marking it from 'saved' to 'doing' or 'completed').
 *
 * @param {string} id - The unique ID of the user action record.
 * @param {Partial<UserAction>} updates - Partial fields to update.
 * @returns {UserAction | null} The updated user action object, or null if not found.
 */
export function updateUserAction(
  id: string,
  updates: Partial<UserAction>,
): UserAction | null {
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  const idx = actions.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  actions[idx] = { ...actions[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.actions, actions);
  return actions[idx];
}

/**
 * Convenience query to find a user action state for a specific action library item.
 *
 * @param {string} actionId - The static action ID (e.g. 'action_carpool').
 * @param {string} [userId] - The user ID.
 * @returns {UserAction | null} The active user action configuration, or null if not found.
 */
export function getUserActionByActionId(actionId: string, userId?: string): UserAction | null {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const actions = getItem<UserAction[]>(KEYS.actions) ?? [];
  return actions.find((a) => a.action_id === actionId && a.user_id === uid) ?? null;
}

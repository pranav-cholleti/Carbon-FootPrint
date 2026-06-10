'use client';

import type { UserProfile } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, nowISO } from './core';

/**
 * Retrieves the profile of a given user from localStorage.
 * Defaults to the currently logged-in user if no ID is passed.
 *
 * @param {string} [userId] - The ID of the user whose profile is to be retrieved.
 * @returns {UserProfile | null} The profile object, or null if not found or no active session.
 */
export function getProfile(userId?: string): UserProfile | null {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  if (!uid) return null;
  const profiles = getItem<UserProfile[]>(KEYS.profiles) ?? [];
  return profiles.find((p) => p.user_id === uid) ?? null;
}

/**
 * Saves or updates a user profile record in localStorage.
 *
 * @param {UserProfile} profile - The user profile object to save.
 * @returns {UserProfile} The updated user profile object with timestamp updated.
 */
export function saveProfile(profile: UserProfile): UserProfile {
  const profiles = getItem<UserProfile[]>(KEYS.profiles) ?? [];
  const idx = profiles.findIndex((p) => p.user_id === profile.user_id);
  const updated = { ...profile, updated_at: nowISO() };
  if (idx >= 0) {
    profiles[idx] = updated;
  } else {
    profiles.push(updated);
  }
  setItem(KEYS.profiles, profiles);
  return updated;
}

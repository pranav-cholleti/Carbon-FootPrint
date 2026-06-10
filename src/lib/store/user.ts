'use client';

import type { User } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, nowISO, generateId } from './core';

/**
 * Retrieves the currently authenticated user from localStorage.
 *
 * @returns {User | null} The active user object, or null if no user session is active.
 */
export function getCurrentUser(): User | null {
  if (!isBrowser()) return null;
  const userId = localStorage.getItem(KEYS.currentUserId);
  if (!userId) return null;
  const users = getItem<User[]>(KEYS.users) ?? [];
  return users.find((u) => u.id === userId) ?? null;
}

/**
 * Sets the currently authenticated user and persists it.
 *
 * @param {User} user - The user object to set as active.
 */
export function setCurrentUser(user: User): void {
  if (!isBrowser()) return;
  const users = getItem<User[]>(KEYS.users) ?? [];
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = { ...user, updated_at: nowISO() };
  } else {
    users.push(user);
  }
  setItem(KEYS.users, users);
  localStorage.setItem(KEYS.currentUserId, user.id);
}

/**
 * Searches for a user profile matching the specified email address.
 *
 * @param {string} email - The email address to look up.
 * @returns {User | null} The matching user object, or null if not found.
 */
export function getUserByEmail(email: string): User | null {
  const users = getItem<User[]>(KEYS.users) ?? [];
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/**
 * Creates and stores a new user record in localStorage.
 *
 * @param {string} displayName - The public display name of the user.
 * @param {string} email - The email address of the user.
 * @returns {User} The newly created user object.
 */
export function createUser(displayName: string, email: string): User {
  const user: User = {
    id: generateId(),
    email,
    display_name: displayName,
    created_at: nowISO(),
    updated_at: nowISO(),
    onboarding_completed: false,
  };
  const users = getItem<User[]>(KEYS.users) ?? [];
  users.push(user);
  setItem(KEYS.users, users);
  if (isBrowser()) {
    localStorage.setItem(KEYS.currentUserId, user.id);
  }
  return user;
}

/**
 * Updates an existing user record with partial parameters.
 *
 * @param {Partial<User> & { id: string }} updates - Map of updates including the target user's ID.
 * @returns {User | null} The updated user record, or null if the user was not found.
 */
export function updateUser(updates: Partial<User> & { id: string }): User | null {
  const users = getItem<User[]>(KEYS.users) ?? [];
  const idx = users.findIndex((u) => u.id === updates.id);
  if (idx < 0) return null;
  users[idx] = { ...users[idx], ...updates, updated_at: nowISO() };
  setItem(KEYS.users, users);
  return users[idx];
}

/**
 * Terminates the active user session by clearing the session ID from localStorage.
 */
export function logout(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(KEYS.currentUserId);
}

'use client';

/**
 * Prefix used for all localStorage keys in the Imprint application.
 */
export const PREFIX = 'imprint_';

/**
 * LocalStorage keys mapped to their prefixed counterparts.
 */
export const KEYS = {
  currentUserId: `${PREFIX}current_user_id`,
  users: `${PREFIX}users`,
  profiles: `${PREFIX}profiles`,
  activityLogs: `${PREFIX}activity_logs`,
  goals: `${PREFIX}goals`,
  actions: `${PREFIX}user_actions`,
  digests: `${PREFIX}ai_digests`,
  achievements: `${PREFIX}achievements`,
  initialized: `${PREFIX}seed_initialized`,
} as const;

/**
 * Checks if the execution environment is a browser and has localStorage available.
 *
 * @returns {boolean} True if window and localStorage are defined, false otherwise.
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

/**
 * Safely retrieves and parses a JSON-serialized item from localStorage.
 *
 * @template T The expected type of the parsed item.
 * @param {string} key - The localStorage key to retrieve.
 * @returns {T | null} The parsed item of type T, or null if not found or parsing fails.
 */
export function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (e) {
    console.error(`[Imprint Store] Failed to read key "${key}":`, e);
    return null;
  }
}

/**
 * Safely serializes and writes an item to localStorage.
 *
 * @template T The type of the item being saved.
 * @param {string} key - The localStorage key to write to.
 * @param {T} value - The value to serialize and store.
 */
export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Imprint Store] Failed to write key "${key}":`, e);
  }
}

/**
 * Generates a unique, randomized string identifier using timestamp and base-36 random values.
 *
 * @returns {string} The generated unique ID.
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Helper to obtain the current timestamp in ISO 8601 string format.
 *
 * @returns {string} The ISO string representation of the current time.
 */
export function nowISO(): string {
  return new Date().toISOString();
}

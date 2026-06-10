'use client';

import type { AIDigest } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, generateId } from './core';

/**
 * Retrieves the list of historical AI summaries generated for a user.
 * Sorted chronologically descending (newest first).
 *
 * @param {string} [userId] - The ID of the user.
 * @returns {AIDigest[]} The array of AI summaries.
 */
export function getDigests(userId?: string): AIDigest[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const digests = getItem<AIDigest[]>(KEYS.digests) ?? [];
  const filtered = uid ? digests.filter((d) => d.user_id === uid) : digests;
  return filtered.sort(
    (a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime(),
  );
}

/**
 * Adds a newly generated AI weekly summary to localStorage.
 *
 * @param {Omit<AIDigest, 'id'>} digest - The AI summary details.
 * @returns {AIDigest} The newly created digest object.
 */
export function addDigest(digest: Omit<AIDigest, 'id'>): AIDigest {
  const fullDigest: AIDigest = {
    ...digest,
    id: generateId(),
  };
  const digests = getItem<AIDigest[]>(KEYS.digests) ?? [];
  digests.push(fullDigest);
  setItem(KEYS.digests, digests);
  return fullDigest;
}

/**
 * Retrieves the latest generated AI digest summary for a user.
 *
 * @param {string} [userId] - The user ID.
 * @returns {AIDigest | null} The latest summary record, or null if none exist.
 */
export function getLatestDigest(userId?: string): AIDigest | null {
  const all = getDigests(userId);
  return all.length > 0 ? all[0] : null;
}

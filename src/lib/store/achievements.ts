'use client';

import type { Achievement } from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, generateId } from './core';

/**
 * Retrieves the unlocked achievements / badges for a user.
 *
 * @param {string} [userId] - The ID of the user.
 * @returns {Achievement[]} The list of earned achievements.
 */
export function getAchievements(userId?: string): Achievement[] {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];
  return uid ? achievements.filter((a) => a.user_id === uid) : achievements;
}

/**
 * Persists an earned achievement to the database. Prevents duplication.
 *
 * @param {Omit<Achievement, 'id'>} achievement - The achievement details.
 * @returns {Achievement} The earned achievement object.
 */
export function addAchievement(
  achievement: Omit<Achievement, 'id'>,
): Achievement {
  const fullAchievement: Achievement = {
    ...achievement,
    id: generateId(),
  };
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];

  // Prevent duplicate achievements
  const existing = achievements.find(
    (a) => a.user_id === achievement.user_id && a.title === achievement.title,
  );
  if (existing) {
    return existing;
  }

  achievements.push(fullAchievement);
  setItem(KEYS.achievements, achievements);
  return fullAchievement;
}

/**
 * Checks if a user has unlocked a specific achievement badge.
 *
 * @param {string} title - The title of the achievement (e.g. 'First Log').
 * @param {string} [userId] - The user ID.
 * @returns {boolean} True if unlocked, false otherwise.
 */
export function hasAchievement(title: string, userId?: string): boolean {
  const uid = userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  const achievements = getItem<Achievement[]>(KEYS.achievements) ?? [];
  return achievements.some((a) => a.user_id === uid && a.title === title);
}

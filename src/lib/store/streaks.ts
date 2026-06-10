'use client';

import { getActivityLogs } from './activity';

/**
 * Helper to convert a Date object into a YYYY-MM-DD string.
 *
 * @param {Date} date - The date to format.
 * @returns {string} The formatted date string.
 */
function toDateStr(date: Date): string {
  return date.toISOString().substring(0, 10);
}

/**
 * Calculates the consecutive logging streak count for a user in days.
 * A streak remains active if the user has logged at least one activity either today or yesterday.
 *
 * @param {string} [userId] - The ID of the user.
 * @returns {number} The active streak count in days.
 */
export function getStreakCount(userId?: string): number {
  const logs = getActivityLogs({ userId });
  if (logs.length === 0) return 0;

  // Collect unique dates (YYYY-MM-DD)
  const dates = new Set<string>();
  for (const log of logs) {
    dates.add(log.logged_at.substring(0, 10));
  }

  const sortedDates = Array.from(dates).sort().reverse(); // newest first
  if (sortedDates.length === 0) return 0;

  // Check if today (or yesterday) is in the set
  const today = new Date();
  const todayStr = toDateStr(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toDateStr(yesterday);

  // Streak must include today or yesterday
  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(sortedDates[0]);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevStr = toDateStr(prevDate);

    if (sortedDates[i] === prevStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

'use client';

import type {
  ActivityLog,
  EmissionCategory,
  Subcategory,
  ActivitySummary,
  EmissionBreakdown,
} from '@/types/domain';
import { KEYS, getItem, setItem, isBrowser, nowISO, generateId } from './core';

/**
 * Filter criteria for querying activity logs.
 */
export interface ActivityLogFilters {
  /** Filter logs by user identifier. */
  userId?: string;
  /** Filter logs by emission category. */
  category?: EmissionCategory;
  /** Filter logs by activity subcategory. */
  subcategory?: Subcategory;
  /** Start of date range (inclusive). */
  startDate?: string;
  /** End of date range (inclusive). */
  endDate?: string;
  /** Maximum number of records to return. */
  limit?: number;
}

/**
 * Appends a new activity log entry to the user's history in localStorage.
 *
 * @param {Omit<ActivityLog, 'id' | 'created_at'>} log - The log contents without ID and timestamp.
 * @returns {ActivityLog} The created activity log with generated ID and timestamps.
 */
export function addActivityLog(
  log: Omit<ActivityLog, 'id' | 'created_at'>,
): ActivityLog {
  const fullLog: ActivityLog = {
    ...log,
    id: generateId(),
    created_at: nowISO(),
  };
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  logs.push(fullLog);
  setItem(KEYS.activityLogs, logs);
  return fullLog;
}

/**
 * Queries the list of activity logs from localStorage based on criteria filters.
 *
 * @param {ActivityLogFilters} [filters={}] - Optional filters to limit or query results.
 * @returns {ActivityLog[]} The sorted array of matching activity logs.
 */
export function getActivityLogs(filters: ActivityLogFilters = {}): ActivityLog[] {
  let logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];

  const userId = filters.userId ?? (isBrowser() ? localStorage.getItem(KEYS.currentUserId) : null);
  if (userId) {
    logs = logs.filter((l) => l.user_id === userId);
  }

  if (filters.category) {
    logs = logs.filter((l) => l.category === filters.category);
  }

  if (filters.subcategory) {
    logs = logs.filter((l) => l.subcategory === filters.subcategory);
  }

  if (filters.startDate) {
    const start = new Date(filters.startDate).getTime();
    logs = logs.filter((l) => new Date(l.logged_at).getTime() >= start);
  }

  if (filters.endDate) {
    const end = new Date(filters.endDate).getTime();
    logs = logs.filter((l) => new Date(l.logged_at).getTime() <= end);
  }

  // Sort by logged_at descending (newest first)
  logs.sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());

  if (filters.limit && filters.limit > 0) {
    logs = logs.slice(0, filters.limit);
  }

  return logs;
}

/**
 * Retrieves a single activity log entry by its unique ID.
 *
 * @param {string} id - The unique identifier of the activity log.
 * @returns {ActivityLog | null} The log object, or null if not found.
 */
export function getActivityLogById(id: string): ActivityLog | null {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  return logs.find((l) => l.id === id) ?? null;
}

/**
 * Deletes a single activity log entry from localStorage.
 *
 * @param {string} id - The ID of the log to delete.
 * @returns {boolean} True if deletion was successful, false if not found.
 */
export function deleteActivityLog(id: string): boolean {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  const idx = logs.findIndex((l) => l.id === id);
  if (idx < 0) return false;
  logs.splice(idx, 1);
  setItem(KEYS.activityLogs, logs);
  return true;
}

/**
 * Updates an existing activity log with partial parameters.
 *
 * @param {string} id - The ID of the activity log to update.
 * @param {Partial<ActivityLog>} updates - The fields to update.
 * @returns {ActivityLog | null} The updated log entry, or null if not found.
 */
export function updateActivityLog(
  id: string,
  updates: Partial<ActivityLog>,
): ActivityLog | null {
  const logs = getItem<ActivityLog[]>(KEYS.activityLogs) ?? [];
  const idx = logs.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  logs[idx] = { ...logs[idx], ...updates };
  setItem(KEYS.activityLogs, logs);
  return logs[idx];
}

/**
 * Compiles and aggregates activity logs into a quantitative summary report for a given date range.
 *
 * @param {string} startDate - Start boundary date (ISO format).
 * @param {string} endDate - End boundary date (ISO format).
 * @param {string} [userId] - Optional user ID (defaults to current session).
 * @returns {ActivitySummary} An aggregated overview of total emissions, breakdown by category, counts, and daily averages.
 */
export function getActivitySummary(
  startDate: string,
  endDate: string,
  userId?: string,
): ActivitySummary {
  const logs = getActivityLogs({ userId, startDate, endDate });

  const breakdown: EmissionBreakdown = {
    transport: 0,
    food: 0,
    home: 0,
    consumption: 0,
  };

  for (const log of logs) {
    breakdown[log.category] += log.co2e_kg;
  }

  // Round values
  breakdown.transport = Math.round(breakdown.transport * 1000) / 1000;
  breakdown.food = Math.round(breakdown.food * 1000) / 1000;
  breakdown.home = Math.round(breakdown.home * 1000) / 1000;
  breakdown.consumption = Math.round(breakdown.consumption * 1000) / 1000;

  const total_co2e_kg =
    Math.round(
      (breakdown.transport + breakdown.food + breakdown.home + breakdown.consumption) * 1000,
    ) / 1000;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const period_days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
  const daily_average_kg = Math.round((total_co2e_kg / period_days) * 1000) / 1000;

  return {
    total_co2e_kg,
    count: logs.length,
    breakdown,
    daily_average_kg,
    period_days,
  };
}

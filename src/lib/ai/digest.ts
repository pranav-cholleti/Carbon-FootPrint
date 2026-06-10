// =============================================================================
// Imprint Carbon Footprint Platform — AI Digest Generator
// =============================================================================

import type { DigestInput, EmissionCategory } from '@/types/domain';

// ---------------------------------------------------------------------------
// Template selection logic
// ---------------------------------------------------------------------------

type TemplateCondition = 'improved' | 'worsened' | 'stable' | 'high_streak' | 'new_user';

function classifyCondition(data: DigestInput): TemplateCondition {
  if (data.streak <= 3 && data.total_kg_this_week === 0) {
    return 'new_user';
  }
  if (data.streak >= 7) {
    return 'high_streak';
  }
  if (data.change_vs_last_week_pct <= -5) {
    return 'improved';
  }
  if (data.change_vs_last_week_pct >= 5) {
    return 'worsened';
  }
  return 'stable';
}

// ---------------------------------------------------------------------------
// Category display names and tips
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<EmissionCategory, string> = {
  transport: 'transportation',
  food: 'food & diet',
  home: 'home energy',
  consumption: 'consumption & shopping',
};

function getCategoryLabel(cat: EmissionCategory): string {
  return CATEGORY_LABELS[cat] ?? cat;
}

function getStreakEmoji(streak: number): string {
  if (streak >= 21) return '🏆';
  if (streak >= 14) return '⭐';
  if (streak >= 7) return '🔥';
  if (streak >= 3) return '✨';
  return '📊';
}

function getCohortInsight(vs_cohort_pct: number): string {
  if (vs_cohort_pct <= -20) {
    return 'significantly below the average for users in your area — you\'re leading the way!';
  }
  if (vs_cohort_pct <= -5) {
    return 'below the average for similar users — nice work!';
  }
  if (vs_cohort_pct <= 5) {
    return 'right around the average for users like you';
  }
  if (vs_cohort_pct <= 20) {
    return 'slightly above average, but with clear room to improve';
  }
  return 'above average — but every step forward counts!';
}

function formatPct(value: number): string {
  const abs = Math.abs(value);
  return abs % 1 === 0 ? abs.toFixed(0) : abs.toFixed(1);
}

function formatKg(value: number): string {
  if (value >= 100) return Math.round(value).toString();
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

// ---------------------------------------------------------------------------
// Template library
// ---------------------------------------------------------------------------

// DigestInput uses `user_name` but templates use `name` — we normalize.
interface NormalizedInput extends Omit<DigestInput, 'user_name'> {
  name: string;
}

type TemplateGenerator = (data: NormalizedInput) => string;

const IMPROVED_TEMPLATES: TemplateGenerator[] = [
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `Hey ${data.name}! ${streakEmoji} Great news — your carbon footprint dropped by ${formatPct(data.change_vs_last_week_pct)}% this ${data.period}. You logged ${formatKg(data.total_kg_this_week)} kg CO₂e total, and that downward trend is exactly what we want to see.

Your biggest area was ${getCategoryLabel(data.top_category)} at ${formatKg(data.top_category_kg)} kg.${data.notable_events.length > 0 ? ` Some highlights: ${data.notable_events.slice(0, 2).join(', ')}.` : ''} Your ${data.streak}-day tracking streak shows real commitment — consistency is the foundation of lasting change.

Compared to other users in your area, you're ${getCohortInsight(data.vs_cohort_pct)}.

For the week ahead, here's something to try: **${data.recommended_action}**. Even small adjustments compound into meaningful impact over time. Keep going, ${data.name} — you're proving that individual action matters. 🌱`;
  },
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `${data.name}, you crushed it this ${data.period}! ${streakEmoji} Your footprint is down ${formatPct(data.change_vs_last_week_pct)}% — that's ${formatKg(Math.abs(data.total_kg_this_week * data.change_vs_last_week_pct / 100))} fewer kg of CO₂e compared to last week.

The numbers tell a good story: ${formatKg(data.total_kg_this_week)} kg total, with ${getCategoryLabel(data.top_category)} as your leading category (${formatKg(data.top_category_kg)} kg).${data.notable_events.length > 0 ? ` I noticed ${data.notable_events[0]} — that kind of conscious choice really adds up.` : ''} And with a ${data.streak}-day streak, you're building momentum.

Your footprint is ${getCohortInsight(data.vs_cohort_pct)}.

Want to keep the momentum going? Try this: **${data.recommended_action}**. You've shown you can make changes that stick — let's see what this next week brings! 💪`;
  },
];

const WORSENED_TEMPLATES: TemplateGenerator[] = [
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `Hey ${data.name}! ${streakEmoji} Let's talk about your ${data.period}. Your footprint came in at ${formatKg(data.total_kg_this_week)} kg CO₂e — that's about ${formatPct(data.change_vs_last_week_pct)}% higher than last week. But don't worry, fluctuations are completely normal.

Most of the increase came from ${getCategoryLabel(data.top_category)} (${formatKg(data.top_category_kg)} kg).${data.notable_events.length > 0 ? ` ${data.notable_events[0]} might have contributed to this.` : ''} The important thing is that you're still tracking — your ${data.streak}-day streak proves you're committed to understanding your impact.

Here's the thing: being aware of a higher-footprint week is actually progress. You can't improve what you don't measure. Compared to others, you're ${getCohortInsight(data.vs_cohort_pct)}.

For a quick win this week, consider: **${data.recommended_action}**. One small change can turn the trend right around. You've got this, ${data.name}! 🌿`;
  },
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `Hi ${data.name}! ${streakEmoji} Your ${data.period} footprint was ${formatKg(data.total_kg_this_week)} kg CO₂e — a bit higher than usual (up ${formatPct(data.change_vs_last_week_pct)}%). That's okay — the journey to lower emissions isn't always a straight line.

${getCategoryLabel(data.top_category)} was your top category at ${formatKg(data.top_category_kg)} kg.${data.notable_events.length > 0 ? ` It looks like ${data.notable_events.slice(0, 2).join(' and ')} played a role.` : ''} But here's what matters most: you showed up for day ${data.streak} of your streak. That discipline is what creates long-term change.

You're ${getCohortInsight(data.vs_cohort_pct)}.

My suggestion for this week: **${data.recommended_action}**. Focus on just this one thing and see how it feels. Progress isn't about perfection — it's about the trend over time. 🌍`;
  },
];

const STABLE_TEMPLATES: TemplateGenerator[] = [
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `Hey ${data.name}! ${streakEmoji} Your ${data.period} report is in: ${formatKg(data.total_kg_this_week)} kg CO₂e, which is very close to last week. Consistency is actually a great sign — it means your habits are becoming stable.

Your leading category was ${getCategoryLabel(data.top_category)} at ${formatKg(data.top_category_kg)} kg.${data.notable_events.length > 0 ? ` This week featured ${data.notable_events.slice(0, 2).join(' and ')}.` : ''} You're on a ${data.streak}-day tracking streak, which tells me this is becoming part of your routine.

Compared to similar users, you're ${getCohortInsight(data.vs_cohort_pct)}.

Now that your baseline is steady, it's a perfect time to try something new: **${data.recommended_action}**. Think of it as your next level-up. Even a 5% improvement from here would be meaningful over a year. Ready to shake things up? 🚀`;
  },
];

const HIGH_STREAK_TEMPLATES: TemplateGenerator[] = [
  (data) => {
    const streakEmoji = getStreakEmoji(data.streak);
    return `${data.name}! ${streakEmoji} ${data.streak} days straight — you're on fire! That kind of consistency puts you in the top tier of Imprint users.

This ${data.period}: ${formatKg(data.total_kg_this_week)} kg CO₂e (${data.change_vs_last_week_pct <= 0 ? `down ${formatPct(data.change_vs_last_week_pct)}%` : `up ${formatPct(data.change_vs_last_week_pct)}%`} vs. last week). ${getCategoryLabel(data.top_category)} led at ${formatKg(data.top_category_kg)} kg.${data.notable_events.length > 0 ? ` Standout moments: ${data.notable_events.slice(0, 2).join(', ')}.` : ''}

You're ${getCohortInsight(data.vs_cohort_pct)}. With your dedication, you're setting a powerful example.

Since you've mastered the tracking habit, here's a challenge: **${data.recommended_action}**. You've proven you can commit — let's channel that energy into your next big reduction. The planet thanks you! 🌎✨`;
  },
];

const NEW_USER_TEMPLATES: TemplateGenerator[] = [
  (data) => {
    return `Welcome, ${data.name}! 🎉 You've just taken the most important step — starting to track your carbon footprint. This is where awareness begins, and awareness leads to action.

${data.total_kg_this_week > 0 ? `So far this ${data.period}, you've logged ${formatKg(data.total_kg_this_week)} kg CO₂e. Your top category is ${getCategoryLabel(data.top_category)} at ${formatKg(data.top_category_kg)} kg.` : `Start logging your daily activities and I'll give you personalized insights and comparisons.`}${data.notable_events.length > 0 ? ` ${data.notable_events[0]} — great first entry!` : ''}

Don't worry about the numbers being "good" or "bad" right now. The goal is simply to understand your patterns. Once we have a week of data, I'll be able to give you much richer insights and comparisons.

Here's your first suggested action: **${data.recommended_action}**. But for now, the best thing you can do is keep logging. Every entry helps paint a clearer picture. Let's do this together! 🌱`;
  },
];

// ---------------------------------------------------------------------------
// Main digest generator
// ---------------------------------------------------------------------------



/**
 * Generate a personalized AI digest for a user's weekly summary.
 * Uses template interpolation to create warm, 150-200 word digests.
 *
 * This simulates what a Claude API call would generate, using
 * rule-based templates that produce varied, contextual output.
 */
export function generateDigest(userData: DigestInput): string {
  const data: NormalizedInput = {
    ...userData,
    name: userData.user_name,
  };

  const condition = classifyCondition(userData);
  let templates: TemplateGenerator[];

  switch (condition) {
    case 'improved':
      templates = IMPROVED_TEMPLATES;
      break;
    case 'worsened':
      templates = WORSENED_TEMPLATES;
      break;
    case 'stable':
      templates = STABLE_TEMPLATES;
      break;
    case 'high_streak':
      templates = HIGH_STREAK_TEMPLATES;
      break;
    case 'new_user':
      templates = NEW_USER_TEMPLATES;
      break;
    default:
      templates = STABLE_TEMPLATES;
  }

  // Select template deterministically but varied based on data
  const templateIndex = selectTemplateIndex(data, templates.length);
  const template = templates[templateIndex];

  return template(data);
}

/**
 * Generate a shorter digest suitable for notifications or cards.
 */
export function generateShortDigest(userData: DigestInput): string {
  const name = userData.user_name;
  const change = userData.change_vs_last_week_pct;
  const total = formatKg(userData.total_kg_this_week);

  if (change <= -10) {
    return `🎉 ${name}, your footprint dropped ${formatPct(change)}% to ${total} kg! Keep up the amazing work.`;
  }
  if (change <= -1) {
    return `📉 Nice, ${name}! Down ${formatPct(change)}% this week (${total} kg CO₂e). Every bit counts!`;
  }
  if (change <= 5) {
    return `📊 ${name}, your ${userData.period} footprint: ${total} kg CO₂e. Holding steady — try "${userData.recommended_action}" for your next win.`;
  }
  return `📈 ${name}, your footprint was ${total} kg this week (up ${formatPct(change)}%). No worries — check out "${userData.recommended_action}" for a quick win.`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function selectTemplateIndex(data: NormalizedInput, templateCount: number): number {
  if (templateCount <= 1) return 0;

  // Use a simple hash of the user name + period for deterministic but varied selection
  let hash = 0;
  const seed = data.name + data.period;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash) % templateCount;
}

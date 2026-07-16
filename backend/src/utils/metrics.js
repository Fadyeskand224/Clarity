// Shared streak / savings / health-recovery math used by the dashboard route
// and the clinician PDF export, so both read from one calculation (BRD 4.7).

export function computeQuitStart(profile, mostRecentSmokingEvent) {
  const quitDate = new Date(profile.quit_date);
  if (!mostRecentSmokingEvent) return quitDate;
  const eventDate = new Date(mostRecentSmokingEvent.occurred_at);
  return eventDate > quitDate ? eventDate : quitDate;
}

export function elapsedDays(since, now = new Date()) {
  const ms = now.getTime() - since.getTime();
  return Math.max(0, ms / 86_400_000);
}

export function computeStreakDays(since, now = new Date()) {
  return Math.floor(elapsedDays(since, now));
}

export function computeMoneySaved(profile, since, now = new Date()) {
  const dailyCigCost =
    (Number(profile.cigarettes_per_day) / Number(profile.cigarettes_per_pack || 20)) *
    Number(profile.cost_per_pack || 0);
  const days = elapsedDays(since, now);
  return Math.round(dailyCigCost * days * 100) / 100;
}

export function progressRingPct(streakDays) {
  // Ring fills grey -> teal over a 90-day horizon (FR-1.2), capping at 100%.
  const HORIZON_DAYS = 90;
  return Math.min(100, Math.round((streakDays / HORIZON_DAYS) * 100));
}

// Health-recovery timeline milestones, commonly cited from CDC/Smokefree.gov
// cessation-benefits timelines (NFR-4: evidence-based content).
export const HEALTH_MILESTONES = [
  { hours: 0.33, label: 'Heart rate drops', description: 'Your heart rate begins to drop back toward normal.' },
  { hours: 12, label: 'Carbon monoxide clears', description: 'Blood carbon monoxide level drops to normal.' },
  {
    hours: 24 * 2,
    label: 'Circulation improves',
    description: 'Circulation and lung function begin to improve; sense of taste and smell start to recover.',
  },
  {
    hours: 24 * 21,
    label: 'Lung function increasing',
    description: 'Lung function continues to increase over the following weeks.',
  },
  {
    hours: 24 * 30,
    label: 'Coughing decreases',
    description: 'Coughing and shortness of breath decrease as cilia regain normal function in the lungs.',
  },
  {
    hours: 24 * 365,
    label: '1 year smoke-free',
    description: 'Excess risk of coronary heart disease is about half that of a smoker.',
  },
  {
    hours: 24 * 365 * 5,
    label: '5 years smoke-free',
    description: 'Stroke risk is reduced to that of a nonsmoker over time.',
  },
  {
    hours: 24 * 365 * 10,
    label: '10 years smoke-free',
    description: 'Lung cancer death rate is about half that of a person who continued smoking.',
  },
];

export function healthMilestonesWithStatus(streakDays) {
  const hoursElapsed = streakDays * 24;
  return HEALTH_MILESTONES.map((m) => ({ ...m, achieved: hoursElapsed >= m.hours }));
}

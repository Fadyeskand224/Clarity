// Guided session library (FR-2.1). Each session's phase cadence matches the
// real technique it's named after (FR-2.2) — pacing lives here as the single
// source of truth for both the orb animation and the spoken/text cues.

export const SESSIONS = [
  {
    id: 'craving_sos',
    title: 'Craving SOS',
    subtitle: 'Right now, immediately',
    durationSeconds: 60,
    urgent: true,
    accent: 'from-rose-500 to-orange-500',
    description:
      'A fast-acting, extended-exhale pattern for when an urge hits hard. The longer exhale helps calm the nervous system quickly.',
    rationale:
      'Cravings are time-limited — they typically peak and begin to fade within a few minutes, even without smoking. This session is built to carry you through that peak.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Breathe in through your nose' },
      { name: 'Hold', seconds: 2, cue: 'Hold gently' },
      { name: 'Exhale', seconds: 6, cue: 'Long breath out through your mouth' },
    ],
  },
  {
    id: 'box_breathing',
    title: 'Box Breathing',
    subtitle: '4-4-4-4 second pattern',
    durationSeconds: 240,
    urgent: false,
    accent: 'from-brand-500 to-brand-700',
    description:
      'Equal-count inhale, hold, exhale, hold — a technique used by clinicians and performance coaches to steady the body under stress.',
    rationale:
      'The equal-count pattern gives your mind a simple rhythm to follow, which is often enough to interrupt a spiral of craving-related thoughts.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Breathe in' },
      { name: 'Hold', seconds: 4, cue: 'Hold' },
      { name: 'Exhale', seconds: 4, cue: 'Breathe out' },
      { name: 'Hold', seconds: 4, cue: 'Hold' },
    ],
  },
  {
    id: 'urge_surfing',
    title: 'Urge Surfing',
    subtitle: 'Ride the wave, extended exhale',
    durationSeconds: 360,
    urgent: false,
    accent: 'from-sky-500 to-brand-600',
    description:
      'A longer session pairing an extended exhale with the idea of "surfing" a craving — noticing it rise, peak, and pass, like a wave.',
    rationale:
      'Urge surfing is a technique from mindfulness-based relapse prevention: instead of fighting a craving, you observe it without acting on it, which research shows shortens how long it holds your attention.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Notice the wave building — breathe in' },
      { name: 'Exhale', seconds: 8, cue: 'Let it crest and pass — long breath out' },
    ],
  },
  {
    id: 'wind_down',
    title: 'Wind Down',
    subtitle: '4-7-8 pattern for evening risk',
    durationSeconds: 300,
    urgent: false,
    accent: 'from-indigo-500 to-violet-600',
    description:
      'A slower 4-7-8 pattern designed for the evening hours, when relapse risk is often highest after a long day.',
    rationale:
      'The extended hold and exhale in 4-7-8 breathing is widely used as a wind-down technique to ease the transition out of a stressful day without reaching for a cigarette.',
    phases: [
      { name: 'Inhale', seconds: 4, cue: 'Breathe in through your nose' },
      { name: 'Hold', seconds: 7, cue: 'Hold' },
      { name: 'Exhale', seconds: 8, cue: 'Slow breath out through your mouth' },
    ],
  },
];

export function getSession(id) {
  return SESSIONS.find((s) => s.id === id);
}

// Orb scale range per phase, so the pulse visually matches the technique:
// grows on Inhale, holds steady, shrinks on Exhale (FR-2.3).
const RESTING_SCALE = 0.6;
const FULL_SCALE = 1.0;

export function getPhaseScaleRanges(phases) {
  let cursor = RESTING_SCALE;
  return phases.map((phase) => {
    const start = cursor;
    let end = start;
    if (phase.name === 'Inhale') end = FULL_SCALE;
    if (phase.name === 'Exhale') end = RESTING_SCALE;
    cursor = end;
    return [start, end];
  });
}

import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import {
  computeQuitStart,
  computeStreakDays,
  computeMoneySaved,
  progressRingPct,
  healthMilestonesWithStatus,
} from '../utils/metrics.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
  const profile = profileResult.rows[0];
  if (!profile) {
    return res.status(404).json({ error: 'Complete onboarding to see your dashboard' });
  }

  const lastEventResult = await pool.query(
    'SELECT * FROM smoking_events WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT 1',
    [req.userId]
  );
  const since = computeQuitStart(profile, lastEventResult.rows[0]);
  const streakDays = computeStreakDays(since);
  const moneySaved = computeMoneySaved(profile, since);

  const latestFagerstrom = await pool.query(
    'SELECT score, dependence_level, created_at FROM fagerstrom_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [req.userId]
  );
  const activeMed = await pool.query(
    'SELECT id, medication_name, medication_type FROM medication_regimens WHERE user_id = $1 AND active = true ORDER BY created_at DESC LIMIT 1',
    [req.userId]
  );

  res.json({
    streakDays,
    quitStart: since,
    moneySaved,
    progressRingPct: progressRingPct(streakDays),
    healthMilestones: healthMilestonesWithStatus(streakDays),
    latestFagerstrom: latestFagerstrom.rows[0] || null,
    activeMedication: activeMed.rows[0] || null,
    profile,
  });
});

export default router;

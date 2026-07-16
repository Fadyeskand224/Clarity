import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { computeQuitStart, computeStreakDays, computeMoneySaved } from '../utils/metrics.js';
import { recommendationForScore } from '../utils/fagerstrom.js';
import { buildClinicianPdf } from '../utils/pdfExport.js';

const router = Router();
router.use(requireAuth);

router.get('/clinician-summary', async (req, res) => {
  const profileResult = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
  const profile = profileResult.rows[0];
  if (!profile) return res.status(404).json({ error: 'Complete onboarding before exporting a summary' });

  const lastEventResult = await pool.query(
    'SELECT * FROM smoking_events WHERE user_id = $1 ORDER BY occurred_at DESC LIMIT 1',
    [req.userId]
  );
  const since = computeQuitStart(profile, lastEventResult.rows[0]);
  const streakDays = computeStreakDays(since);
  const moneySaved = computeMoneySaved(profile, since);

  const fagerstromRow = (
    await pool.query('SELECT * FROM fagerstrom_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [
      req.userId,
    ])
  ).rows[0];
  const fagerstrom = fagerstromRow
    ? { ...fagerstromRow, recommendation: recommendationForScore(fagerstromRow.score).recommendation }
    : null;

  const medication = (
    await pool.query(
      'SELECT * FROM medication_regimens WHERE user_id = $1 AND active = true ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    )
  ).rows[0] || null;

  let adherencePct = 0;
  if (medication) {
    const adherenceRows = await pool.query(
      `SELECT COUNT(*) FILTER (WHERE taken)::int AS taken_count, COUNT(*)::int AS total
       FROM medication_adherence
       WHERE regimen_id = $1 AND log_date >= CURRENT_DATE - 7`,
      [medication.id]
    );
    const { taken_count: taken, total } = adherenceRows.rows[0];
    adherencePct = total > 0 ? Math.round((taken / total) * 100) : 0;
  }

  const recentTriggers = (
    await pool.query(
      "SELECT occurred_at, trigger, mood FROM journal_entries WHERE user_id = $1 AND trigger IS NOT NULL ORDER BY occurred_at DESC LIMIT 5",
      [req.userId]
    )
  ).rows;

  const pdfBuffer = await buildClinicianPdf({
    profile,
    streakDays,
    moneySaved,
    fagerstrom,
    medication,
    adherencePct,
    recentTriggers,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="clarity-clinician-summary.pdf"');
  res.send(pdfBuffer);
});

export default router;

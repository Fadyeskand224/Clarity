import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM medication_regimens WHERE user_id = $1 ORDER BY active DESC, created_at DESC',
    [req.userId]
  );
  res.json({ regimens: result.rows });
});

router.post('/', async (req, res) => {
  const { medicationType, medicationName, doseSchedule, remindersEnabled } = req.body || {};
  if (!medicationType || !medicationName || !doseSchedule) {
    return res.status(400).json({ error: 'medicationType, medicationName, and doseSchedule are required' });
  }
  const result = await pool.query(
    `INSERT INTO medication_regimens (user_id, medication_type, medication_name, dose_schedule, reminders_enabled)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [req.userId, medicationType, medicationName, doseSchedule, Boolean(remindersEnabled)]
  );
  res.status(201).json({ regimen: result.rows[0] });
});

router.put('/:id', async (req, res) => {
  const { medicationName, doseSchedule, remindersEnabled, active } = req.body || {};
  const result = await pool.query(
    `UPDATE medication_regimens SET
       medication_name = COALESCE($1, medication_name),
       dose_schedule = COALESCE($2, dose_schedule),
       reminders_enabled = COALESCE($3, reminders_enabled),
       active = COALESCE($4, active)
     WHERE id = $5 AND user_id = $6
     RETURNING *`,
    [medicationName, doseSchedule, remindersEnabled, active, req.params.id, req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Regimen not found' });
  res.json({ regimen: result.rows[0] });
});

// Daily dose checklist entry — upserted per regimen/day (FR-6.2).
router.post('/:id/adherence', async (req, res) => {
  const { logDate, taken, note } = req.body || {};
  const regimen = await pool.query('SELECT id FROM medication_regimens WHERE id = $1 AND user_id = $2', [
    req.params.id,
    req.userId,
  ]);
  if (regimen.rows.length === 0) return res.status(404).json({ error: 'Regimen not found' });

  const result = await pool.query(
    `INSERT INTO medication_adherence (user_id, regimen_id, log_date, taken, note)
     VALUES ($1, $2, COALESCE($3, CURRENT_DATE), $4, $5)
     ON CONFLICT (regimen_id, log_date) DO UPDATE SET taken = EXCLUDED.taken, note = EXCLUDED.note
     RETURNING *`,
    [req.userId, req.params.id, logDate || null, taken !== false, note || null]
  );
  res.status(201).json({ adherence: result.rows[0] });
});

// Weekly adherence chart data (FR-6.3), styled consistently with the savings chart.
router.get('/adherence/summary', async (req, res) => {
  const days = Math.min(90, Math.max(1, Number(req.query.days) || 7));
  const regimenCount = await pool.query(
    'SELECT COUNT(*)::int AS count FROM medication_regimens WHERE user_id = $1 AND active = true',
    [req.userId]
  );
  const totalRegimens = regimenCount.rows[0].count;

  const logs = await pool.query(
    `SELECT log_date, COUNT(*) FILTER (WHERE taken) ::int AS taken_count, COUNT(*)::int AS logged_count
     FROM medication_adherence
     WHERE user_id = $1 AND log_date >= CURRENT_DATE - $2::int
     GROUP BY log_date
     ORDER BY log_date ASC`,
    [req.userId, days]
  );

  const byDate = new Map(logs.rows.map((r) => [r.log_date.toISOString().slice(0, 10), r]));
  const series = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    const takenCount = row ? row.taken_count : 0;
    const pct = totalRegimens > 0 ? Math.round((takenCount / totalRegimens) * 100) : 0;
    series.push({ date: key, takenCount, totalRegimens, pct: Math.min(100, pct) });
  }

  res.json({ series, totalRegimens });
});

export default router;

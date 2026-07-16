import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM profiles WHERE user_id = $1', [req.userId]);
  if (result.rows.length === 0) return res.status(404).json({ error: 'No profile yet' });
  res.json({ profile: result.rows[0] });
});

// Upsert — used both by the onboarding flow (FR: Section 8 onboarding) and later edits.
router.put('/', async (req, res) => {
  const { quitDate, reasons, cigarettesPerDay, cigarettesPerPack, costPerPack } = req.body || {};

  if (!quitDate || Number.isNaN(Date.parse(quitDate))) {
    return res.status(400).json({ error: 'quitDate is required and must be a valid date' });
  }
  if (typeof cigarettesPerDay !== 'number' || cigarettesPerDay < 0) {
    return res.status(400).json({ error: 'cigarettesPerDay must be a non-negative number' });
  }
  if (typeof costPerPack !== 'number' || costPerPack < 0) {
    return res.status(400).json({ error: 'costPerPack must be a non-negative number' });
  }

  const result = await pool.query(
    `INSERT INTO profiles (user_id, quit_date, reasons, cigarettes_per_day, cigarettes_per_pack, cost_per_pack, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (user_id) DO UPDATE SET
       quit_date = EXCLUDED.quit_date,
       reasons = EXCLUDED.reasons,
       cigarettes_per_day = EXCLUDED.cigarettes_per_day,
       cigarettes_per_pack = EXCLUDED.cigarettes_per_pack,
       cost_per_pack = EXCLUDED.cost_per_pack,
       updated_at = now()
     RETURNING *`,
    [
      req.userId,
      quitDate,
      Array.isArray(reasons) ? reasons : [],
      cigarettesPerDay,
      cigarettesPerPack || 20,
      costPerPack,
    ]
  );
  res.json({ profile: result.rows[0] });
});

export default router;

import { Router } from 'express';
import pool from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { FAGERSTROM_QUESTIONS, FAGERSTROM_DISCLAIMER, scoreFagerstrom } from '../utils/fagerstrom.js';

const router = Router();
router.use(requireAuth);

router.get('/questions', (_req, res) => {
  // Points are omitted client-side to avoid encouraging answer-gaming; scoring
  // happens server-side so the recommendation/PDF pipeline stays authoritative.
  const questions = FAGERSTROM_QUESTIONS.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options.map((o) => o.label),
  }));
  res.json({ questions, disclaimer: FAGERSTROM_DISCLAIMER });
});

router.post('/', async (req, res) => {
  const { answers } = req.body || {};
  let result;
  try {
    result = scoreFagerstrom(answers);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const inserted = await pool.query(
    `INSERT INTO fagerstrom_results (user_id, answers, score, dependence_level)
     VALUES ($1, $2, $3, $4)
     RETURNING id, score, dependence_level, created_at`,
    [req.userId, JSON.stringify(result.answers), result.score, result.dependenceLevel]
  );

  res.status(201).json({
    result: inserted.rows[0],
    recommendation: result.recommendation,
    disclaimer: FAGERSTROM_DISCLAIMER,
  });
});

router.get('/latest', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM fagerstrom_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [req.userId]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'No assessment completed yet' });
  res.json({ result: result.rows[0] });
});

router.get('/history', async (req, res) => {
  const result = await pool.query(
    'SELECT id, score, dependence_level, created_at FROM fagerstrom_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
    [req.userId]
  );
  res.json({ history: result.rows });
});

export default router;

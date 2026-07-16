import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import eventsRoutes from './routes/events.js';
import dashboardRoutes from './routes/dashboard.js';
import fagerstromRoutes from './routes/fagerstrom.js';
import medicationsRoutes from './routes/medications.js';
import journalRoutes from './routes/journal.js';
import breathingRoutes from './routes/breathing.js';
import pdfRoutes from './routes/pdf.js';

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Refusing to start — see backend/.env.example.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/fagerstrom', fagerstromRoutes);
app.use('/api/medications', medicationsRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/breathing-sessions', breathingRoutes);
app.use('/api/pdf', pdfRoutes);

// Centralized error handler so route handlers can stay free of try/catch boilerplate.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Clarity API listening on port ${port}`);
});

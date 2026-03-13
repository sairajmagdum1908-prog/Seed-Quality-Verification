import express from 'express';
import { query, initDb } from './lib/db';

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.get('/all-reports', async (req, res) => {
  await ensureDb();
  try {
    const result = await query(`
      SELECT r.*, s.seed_name, u.username 
      FROM reports r
      JOIN seeds s ON r.seed_id = s.seed_id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.reported_at DESC
    `);
    res.json({ success: true, reports: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/report-fake', async (req, res) => {
  await ensureDb();
  const { seed_id, farmer_id, issue, location } = req.body;
  try {
    await query(`
      INSERT INTO reports (seed_id, user_id, issue, location)
      VALUES ($1, $2, $3, $4)
    `, [seed_id, farmer_id, issue, location || 'Unknown']);
    res.json({ success: true, message: 'Report submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/resolve-report/:id', async (req, res) => {
  await ensureDb();
  const { id } = req.params;
  try {
    await query('UPDATE reports SET status = $1 WHERE id = $2', ['resolved', id]);
    res.json({ success: true, message: 'Report resolved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

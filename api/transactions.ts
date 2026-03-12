import express from 'express';
import { query } from './lib/db';

const app = express();
app.use(express.json());

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*, s.seed_name, u.username as farmer_name 
      FROM transactions t
      JOIN seeds s ON t.seed_id = s.seed_id
      JOIN users u ON t.farmer_id = u.id
      ORDER BY t.timestamp DESC
    `);
    res.json({ success: true, transactions: result.rows });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/transactions', router);

export default app;

import express from 'express';
import { query, initDb } from './lib/db';

const app = express();
app.use(express.json());

const ensureDb = async () => {
  await initDb();
};

const router = express.Router();

router.get('/', async (req, res) => {
  await ensureDb();
  try {
    const totalSeeds = await query('SELECT COUNT(*) as count FROM seeds');
    const totalScans = await query('SELECT COUNT(*) as count FROM scans');
    const fraudulentScans = await query('SELECT COUNT(*) as count FROM scans WHERE is_fraudulent = 1');
    const totalReports = await query('SELECT COUNT(*) as count FROM reports');
    
    const scanHeatmap = await query(`
      SELECT scan_location, COUNT(*) as count 
      FROM scans 
      GROUP BY scan_location 
      ORDER BY count DESC
      LIMIT 10
    `);

    const roleDistribution = await query(`
      SELECT role, COUNT(*) as count 
      FROM users 
      GROUP BY role
    `);
    
    res.json({ 
      success: true, 
      totalSeeds: totalSeeds.rows[0], 
      totalScans: totalScans.rows[0], 
      fraudulentScans: fraudulentScans.rows[0], 
      totalReports: totalReports.rows[0], 
      scanHeatmap: scanHeatmap.rows, 
      roleDistribution: roleDistribution.rows 
    });
  } catch (error: any) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/stats', router);

export default app;

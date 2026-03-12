import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import seedRoutes from './routes/seeds';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import aiRoutes from './routes/ai';
import transactionRoutes from './routes/transactions';
import { GoogleGenAI } from "@google/genai";
import db from './database/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Health Check
  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  // API Router
  const apiRouter = express.Router();
  
  apiRouter.use((req, res, next) => {
    console.log("API request:", req.method, req.url);
    if (req.method === 'POST') console.log('Payload:', JSON.stringify(req.body, null, 2));
    next();
  });

  // Register routes as requested
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/seeds', seedRoutes);
  apiRouter.use('/reports', reportRoutes);
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/ai', aiRoutes);
  apiRouter.use('/transactions', transactionRoutes);

  // Dashboard Stats
  apiRouter.get('/admin/stats', (req, res) => {
    try {
      const totalSeeds = db.prepare('SELECT COUNT(*) as count FROM seeds').get();
      const totalScans = db.prepare('SELECT COUNT(*) as count FROM scans').get();
      const fraudulentScans = db.prepare('SELECT COUNT(*) as count FROM scans WHERE is_fraudulent = 1').get();
      const totalReports = db.prepare('SELECT COUNT(*) as count FROM reports').get();
      
      const scanHeatmap = db.prepare(`
        SELECT scan_location, COUNT(*) as count 
        FROM scans 
        GROUP BY scan_location 
        ORDER BY count DESC
      `).all();

      const roleDistribution = db.prepare(`
        SELECT role, COUNT(*) as count 
        FROM users 
        GROUP BY role
      `).all();
      
      res.json({ status: "success", totalSeeds, totalScans, fraudulentScans, totalReports, scanHeatmap, roleDistribution });
    } catch (error: any) {
      console.error('Stats Error:', error);
      res.status(500).json({ status: "error", message: error.message });
    }
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // API 404 Handler - MUST be after all apiRouter routes but before Vite
  app.all('/api/*', (req, res) => {
    console.warn(`API 404: ${req.method} ${req.url}`);
    res.status(404).json({
      status: "error",
      message: `API Route ${req.method} ${req.url} not found`
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    console.log('Serving static files from:', distPath);
    
    // Serve static assets
    app.use(express.static(distPath));
    
    // SPA fallback
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error('Error sending index.html:', err);
          res.status(500).send('Server Error: index.html not found. Please ensure the app is built.');
        }
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
      status: "error",
      message: err.message || 'Internal Server Error'
    });
  });
}

startServer();

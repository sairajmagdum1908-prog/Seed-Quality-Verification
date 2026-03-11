import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import seedRoutes from './routes/seeds';
import reportRoutes from './routes/reports';
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

  // Gemini AI Analysis
  apiRouter.post('/analyze-seed', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, message: 'Image is required' });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Analyze this seed image. Predict seed quality, possible defects, and authenticity hints. Provide a structured response." },
              { inlineData: { mimeType: "image/jpeg", data: image.split(',')[1] } }
            ]
          }
        ]
      });
      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

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
      
      res.json({ totalSeeds, totalScans, fraudulentScans, totalReports, scanHeatmap });
    } catch (error: any) {
      console.error('Stats Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Mount API Router
  app.use('/api', apiRouter);

  // API 404 Handler - MUST be after all apiRouter routes but before Vite
  app.all('/api/*', (req, res) => {
    console.warn(`API 404: ${req.method} ${req.url}`);
    res.status(404).json({
      success: false,
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
    const distPath = path.join(__dirname, '../dist');
    console.log('Serving static files from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error'
    });
  });
}

startServer();

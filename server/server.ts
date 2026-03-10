import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import seedRoutes from './routes/seeds';
import reportRoutes from './routes/reports';
import { GoogleGenAI } from "@google/genai";
import db from './database/db';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // API Routes
  app.use('/api', authRoutes);
  app.use('/api', seedRoutes);
  app.use('/api', reportRoutes);

  // Gemini AI Analysis
  app.post('/api/analyze-seed', async (req, res) => {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Image is required' });

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
      res.status(500).json({ error: error.message });
    }
  });

  // Extra Features: Dashboard Stats
  app.get('/api/admin/stats', (req, res) => {
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
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

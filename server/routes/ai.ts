import express from 'express';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ status: "error", message: 'Gemini API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: "You are an AI Agri-Bot, an expert agricultural assistant. Provide clear, helpful, and practical advice on planting methods, fertilizer usage, irrigation tips, and pest control. Keep responses concise and farmer-friendly.",
      },
    });

    res.json({ status: "success", response: response.text });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ status: "error", message: 'Failed to get AI response' });
  }
});

export default router;

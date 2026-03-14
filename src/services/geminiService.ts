import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export async function getAgriAdvice(seedType: string, query: string) {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: seedType === "General Farming" 
        ? `Answer the farmer's question: "${query}". Provide practical, easy-to-follow advice about farming, seeds, fertilizers, or the AgriTrust platform.`
        : `A farmer has just verified a genuine packet of ${seedType} seeds. Answer their question: "${query}". Provide practical, easy-to-follow advice in a friendly tone. Keep it concise.`,
      config: {
        systemInstruction: "You are AgriBot, an expert agricultural assistant for the AgriTrust platform. You help farmers with seed quality, fertilizers, modern farming techniques, and platform usage. Provide advice suitable for Indian agriculture.",
      },
    });
    return response.text || "AI service temporarily unavailable. Please try again.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI service temporarily unavailable. Please try again.";
  }
}

export async function analyzeSeedImage(base64Image: string) {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("API Key missing");
    }
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analyze this seed image. Predict seed quality, possible defects, and authenticity hints. Provide a structured response." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image } }
          ]
        }
      ]
    });
    return response.text || "AI service temporarily unavailable. Please try again.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI service temporarily unavailable. Please try again.";
  }
}

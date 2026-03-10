import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAgriAdvice(seedType: string, query: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: seedType === "General Farming" 
        ? `Answer the farmer's question: "${query}". Provide practical, easy-to-follow advice about farming, seeds, fertilizers, or the AgriTrust platform.`
        : `A farmer has just verified a genuine packet of ${seedType} seeds. Answer their question: "${query}". Provide practical, easy-to-follow advice in a friendly tone. Keep it concise.`,
      config: {
        systemInstruction: "You are AgriBot, an expert agricultural assistant for the AgriTrust platform. You help farmers with seed quality, fertilizers, modern farming techniques, and platform usage. Provide advice suitable for Indian agriculture.",
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting to my agricultural knowledge base. Please try again later.";
  }
}

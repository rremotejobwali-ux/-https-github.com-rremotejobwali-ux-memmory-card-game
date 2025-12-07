import { GoogleGenAI, Type } from "@google/genai";
import { ThemeResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateThemeItems = async (theme: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a list of 8 distinct, recognizable emojis related to the theme: "${theme}". 
      Ensure they are visually distinct from each other. Return only the emojis.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of 8 emoji strings",
            },
          },
          required: ["items"],
        },
      },
    });

    const jsonStr = response.text;
    if (!jsonStr) {
        // Fallback if empty response
        return ["🍎", "🍌", "🍇", "🍓", "🍒", "🍑", "🍍", "🥥"];
    }
    
    const parsed = JSON.parse(jsonStr) as ThemeResponse;
    
    // Ensure we have exactly 8 items, fill with defaults if API fails to give enough
    const defaults = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"];
    const items = parsed.items || [];
    
    if (items.length < 8) {
      return [...items, ...defaults.slice(0, 8 - items.length)];
    }
    
    return items.slice(0, 8);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback set in case of API error
    return ["⚡", "🔥", "💧", "❄️", "🌪️", "🌈", "☀️", "🌙"];
  }
};

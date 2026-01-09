import { GoogleGenAI, Type } from "@google/genai";
import { TranslationData, LANGUAGE_KEYS } from "../types";

export const translateText = async (items: string[]): Promise<TranslationData[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  // Filter out empty items just in case
  const validItems = items.filter(item => item.trim() !== '');

  if (validItems.length === 0) {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Dynamically build properties for the schema based on LANGUAGE_KEYS
  const properties: Record<string, any> = {
    key: {
      type: Type.STRING,
      description: "A unique, meaningful key for the translation item in snake_case format (e.g., 'hello_world', 'confirm_button'). Derived from the English meaning.",
    }
  };
  
  LANGUAGE_KEYS.forEach((lang) => {
    properties[lang] = {
      type: Type.STRING,
      description: `The translation of the input text into ${lang.replace('_', ' ')}.`,
    };
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Translate the following list of Korean text items into the specified languages and generate a snake_case key for each.
      
      Input Items: ${JSON.stringify(validItems)}
      
      Requirements:
      1. Output a JSON list where each object corresponds to exactly one input item.
      2. Generate a "key" field: A concise, meaningful snake_case identifier based on the English translation (e.g. "hello_world").
      3. The "Korean" field in the output must match the input item exactly.
      4. Act as a professional native translator for each language.
      5. Preserve the cultural context, nuance, and tone of the original Korean text.
      6. Return ONLY the JSON data.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: properties,
            required: ["key", ...LANGUAGE_KEYS],
          },
        },
        systemInstruction: "You are a specialized multi-lingual translation engine designed to export data for i18n/localization. Your translations must be accurate, culturally sensitive, and formatted perfectly as a JSON list. Treat each element in the input list as a separate translation task.",
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(responseText) as TranslationData[];
    return data;
  } catch (error) {
    console.error("Translation error:", error);
    throw error;
  }
};
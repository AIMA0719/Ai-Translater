import { GoogleGenAI, Type } from "@google/genai";
import { TranslationData, LANGUAGE_KEYS } from "../types";

// Increased retries and delay to handle rate limits better
const MAX_RETRIES = 5;
const BASE_DELAY = 3000; // 3 seconds start delay

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to safely get the API key from various environment configurations
const getApiKey = (): string | undefined => {
  // 1. Check for Vite environment variable (Most likely for Vercel + Vite)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_KEY) {
    // @ts-ignore
    return import.meta.env.VITE_API_KEY;
  }

  // 2. Check for Next.js public variable
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_KEY) {
    return process.env.NEXT_PUBLIC_API_KEY;
  }

  // 3. Check for Create React App variable
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_KEY) {
    return process.env.REACT_APP_API_KEY;
  }

  // 4. Fallback to standard process.env (Node.js / Custom Build)
  // We check typeof process to avoid ReferenceError in pure browser environments
  if (typeof process !== 'undefined' && process.env?.API_KEY) {
    return process.env.API_KEY;
  }

  return undefined;
};

export const translateText = async (items: string[]): Promise<TranslationData[]> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("API Key is missing. Please add 'VITE_API_KEY' to your Vercel Environment Variables.");
  }

  // Filter out empty items just in case
  const validItems = items.filter(item => item.trim() !== '');

  if (validItems.length === 0) {
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: apiKey });

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

  let lastError: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Switched to 'gemini-3-flash-preview' for better rate limits and speed
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
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

    } catch (error: any) {
      lastError = error;
      console.warn(`Translation attempt ${attempt} failed:`, error);

      // Check for rate limit (429) or server overload (503)
      const isRateLimit = error.toString().includes("429") || error.status === 429;
      const isServerOverloaded = error.toString().includes("503") || error.status === 503;

      if ((isRateLimit || isServerOverloaded) && attempt < MAX_RETRIES) {
        // Exponential backoff with jitter: waitTime * 2^(attempt-1)
        const waitTime = BASE_DELAY * Math.pow(2, attempt - 1); 
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }
      
      // If it's not a retryable error, or we ran out of retries, break loop
      break;
    }
  }

  console.error("Final translation error:", lastError);
  
  // Provide user-friendly error messages
  if (lastError.toString().includes("429")) {
    throw new Error("사용량이 많아 요청이 제한되었습니다. 잠시 후(약 1분 뒤) 다시 시도해주세요.");
  }
  if (lastError.toString().includes("503")) {
    throw new Error("AI 서비스가 일시적으로 불안정합니다. 잠시 후 다시 시도해주세요.");
  }

  throw lastError;
};
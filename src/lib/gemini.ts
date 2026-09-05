import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Đổi model ở đây, không cần sửa từng route.
export const GEMINI_MODEL = "gemini-3.6-flash";

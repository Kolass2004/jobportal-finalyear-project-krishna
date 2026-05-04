import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not defined in environment variables.');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Select the flash model (fast and cost-effective)
export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Utility function to generate text using Gemini 2.5 Flash
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating text with Gemini:', error);
    throw new Error('Failed to generate content with AI.');
  }
}

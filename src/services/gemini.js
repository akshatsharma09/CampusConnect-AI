// Gemini API integration
// TODO: Replace with your Google Gemini API key from Google AI Studio
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your API key
const genAI = new GoogleGenerativeAI(API_KEY);

export const getGeminiResponse = async (query, opportunities) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prepare the prompt for Gemini
    const prompt = `
      You are an AI assistant helping college students find relevant opportunities.
      The user query is: "${query}"
      
      Here are the available opportunities in JSON format:
      ${JSON.stringify(opportunities)}
      
      Please analyze the query and return the top 3 most relevant opportunities.
      For each opportunity, provide:
      - The opportunity object
      - A short reason why it matches the query
      
      Return the response as a JSON array of objects with keys: "opportunity" and "reason".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    return JSON.parse(text);
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return [];
  }
};
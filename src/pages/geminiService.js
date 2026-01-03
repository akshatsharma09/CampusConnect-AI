import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const searchOpportunitiesWithAI = async (query, opportunities) => {
  if (!query) return opportunities;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      You are an AI assistant for students.
      User Query: "${query}"
      
      Available Opportunities (JSON):
      ${JSON.stringify(opportunities)}
      
      Task:
      1. Filter the opportunities based on the user's query.
      2. Return the top 3 most relevant matches.
      3. Provide a short "reason" for each match.
      
      Output Format (Strict JSON Array, no markdown):
      [ { "id": "opportunity_id", "reason": "Why this fits" } ]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
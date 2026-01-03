import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY ? API_KEY.length : 0);
console.log('API Key starts with:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'No key');

if (!API_KEY) {
  console.error('❌ No Gemini API key found in environment variables');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Function to get available models
export const getAvailableModels = async () => {
  try {
    // Note: listModels might not be available in this version
    console.log('📋 Using known Gemini models: models/gemini-pro, models/gemini-pro-vision, models/gemini-1.0-pro');
    return ['models/gemini-pro', 'models/gemini-pro-vision', 'models/gemini-1.0-pro'];
  } catch (error) {
    console.error('❌ Error with models:', error);
    return ['models/gemini-pro']; // fallback
  }
};

export const searchOpportunitiesWithAI = async (query, opportunities) => {
  console.log('🔍 Starting AI search for query:', query);
  console.log('📊 Available opportunities:', opportunities.length);

  if (!query) {
    console.log('❌ No query provided');
    return opportunities;
  }

  if (!API_KEY || !genAI) {
    console.error('❌ No Gemini API key found or genAI not initialized');
    return [];
  }

  try {
    console.log('🤖 Calling Gemini API...');
    
    // First, let's see what models are available
    const availableModels = await getAvailableModels();
    console.log('📋 Available Gemini models:', availableModels);
    
    const prompt = `
      You are an AI assistant for college students finding opportunities.
      User Query: "${query}"
      
      Available Opportunities (JSON):
      ${JSON.stringify(opportunities)}
      
      Task:
      1. Analyze the user's query and understand their needs (year, interests, type of opportunity)
      2. Filter and rank the opportunities based on relevance
      3. Return the top 3 most relevant matches
      4. For each match, provide:
         - id: the opportunity id
         - reason: a detailed explanation (2-3 sentences) why this matches their query
         - score: a relevance score from 1-10
      
      Output Format (Strict JSON Array):
      [{"id": "opp_id", "reason": "Detailed explanation here", "score": 9}]
    `;

    // Try different models in order of preference (with full model paths)
    const modelsToTry = ["models/gemini-pro", "models/gemini-pro-vision", "models/gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        console.log('✅ Gemini response:', text);

        const recommendations = JSON.parse(text);
        console.log('📋 Parsed recommendations:', recommendations);

        // Sort by score descending
        return recommendations.sort((a, b) => b.score - a.score);
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError.message);
        continue; // Try next model
      }
    }
    
    // If all models fail, throw the last error
    throw new Error("All Gemini models failed");
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    // Fallback: return all opportunities if AI fails
    return opportunities.slice(0, 3).map(opp => ({
      id: opp.id,
      reason: "AI search unavailable - showing available opportunity",
      score: 5
    }));
  }
};

export const generateQuerySuggestions = async (userProfile = {}) => {
  try {
    const modelsToTry = ["models/gemini-pro", "models/gemini-pro-vision", "models/gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Trying model ${modelName} for suggestions`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `
          Generate 5 helpful search query suggestions for college students looking for opportunities.
          Make them specific and varied. Examples:
          - "Internships for computer science students in their 3rd year"
          - "Workshops on machine learning for beginners"
          - "Hackathons open to all years"
          
          Return as JSON array of strings.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed for suggestions:`, modelError.message);
        continue;
      }
    }
    
    // If all models fail, return fallback
    console.warn("All models failed for suggestions, using fallback");
    return [
      "Internships for computer science students",
      "Workshops on AI and machine learning", 
      "Hackathons for beginners",
      "Tech events in my city",
      "Opportunities for 2nd year students"
    ];
  } catch (error) {
    console.error("❌ Error generating suggestions:", error);
    return [
      "Internships for computer science students",
      "Workshops on AI and machine learning", 
      "Hackathons for beginners",
      "Tech events in my city",
      "Opportunities for 2nd year students"
    ];
  }
};
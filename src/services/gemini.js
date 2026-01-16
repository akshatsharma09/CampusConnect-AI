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

  // ✅ VALIDATION 1: Check query is provided
  if (!query || !query.trim()) {
    console.log('❌ No query provided');
    return [];
  }

  // ✅ VALIDATION 2: Check opportunities exist in database BEFORE calling Gemini
  if (!opportunities || opportunities.length === 0) {
    console.warn('⚠️ No opportunities in database - returning empty');
    return [];
  }

  // ✅ VALIDATION 3: Check API key exists
  if (!API_KEY || !genAI) {
    console.error('❌ No Gemini API key found or genAI not initialized');
    return [];
  }

  try {
    console.log('🤖 Calling Gemini API with context...');
    
    // ✅ VALIDATION 4: Ensure Gemini only receives database context + user query
    // Never pass raw user input alone to avoid injection attacks
    const availableModels = await getAvailableModels();
    console.log('📋 Available Gemini models:', availableModels);
    
    // Strict prompt: ONLY filter from existing opportunities, NEVER generate new ones
    const systemPrompt = `You are a search assistant that ONLY ranks and filters existing opportunities.

CRITICAL RULES:
1. You MUST ONLY return opportunities that exist in the provided database
2. NEVER create, invent, or generate new opportunities
3. NEVER provide information not in the database context
4. Return ONLY valid opportunity IDs that exist in the list
5. If no matches found, return empty array []

Your task:
- Analyze the user query
- Find matching opportunities from the database
- Rank by relevance (top 3 max)
- For each match, explain why it matches`;

    const userMessage = `Query: "${query}"

Database Opportunities:
${JSON.stringify(opportunities, null, 2)}

Match opportunities from the database only. Return JSON array:
[{"id": "exact_id_from_database", "reason": "2-3 sentence explanation", "score": 1-10}]`;

    // Try different models in order of preference
    const modelsToTry = ["models/gemini-pro", "models/gemini-pro-vision", "models/gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🔄 Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.2, // ✅ Low temperature for deterministic results
            topK: 5,
            topP: 0.5,
          }
        });

        const result = await model.generateContent([
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + userMessage }] }
        ]);

        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        console.log('✅ Gemini response:', text);

        // ✅ VALIDATION 5: Parse and verify results
        const recommendations = JSON.parse(text);
        
        if (!Array.isArray(recommendations)) {
          console.warn('⚠️ Gemini response is not an array, treating as empty');
          return [];
        }

        // ✅ VALIDATION 6: Verify all returned IDs actually exist in database
        const validRecommendations = recommendations.filter(rec => {
          const exists = opportunities.some(opp => opp.id === rec.id);
          if (!exists) {
            console.warn(`🚨 Gemini returned non-existent ID: ${rec.id} - FILTERING OUT`);
          }
          return exists;
        });

        console.log(`✅ Valid recommendations: ${validRecommendations.length} (filtered from ${recommendations.length})`);

        // Sort by score descending
        return validRecommendations.sort((a, b) => b.score - a.score);
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed:`, modelError.message);
        continue; // Try next model
      }
    }
    
    // If all models fail, throw the last error
    throw new Error("All Gemini models failed");
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    // ✅ SAFE FALLBACK: Return empty array instead of inventing results
    return [];
  }
};

/**
 * 🧠 SEMANTIC INTENT CLASSIFIER - NO KEYWORDS
 * Uses Gemini to classify if a query is campus-related
 * Returns: "CAMPUS" or "NON_CAMPUS"
 */
export const classifyCampusIntent = async (userMessage) => {
  console.log('🧠 Classifying intent for message:', userMessage);

  if (!userMessage || !userMessage.trim()) {
    return "NON_CAMPUS"; // Default to non-campus for empty messages
  }

  if (!API_KEY || !genAI) {
    console.error('❌ No Gemini API key found for intent classification');
    return "NON_CAMPUS";
  }

  try {
    const modelsToTry = ["models/gemini-pro", "models/gemini-pro-vision", "models/gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1, // ✅ Minimal temperature for consistent classification
            topK: 1,
            topP: 0,
            maxOutputTokens: 20
          }
        });

        const classificationPrompt = `You are a campus query classifier. 
Analyze the following query and determine if it is related to:
- Campus operations or infrastructure
- Placements or recruitment
- Internships or hackathons
- Student life or college events
- Campus rules or academic policies
- How to use campus-related platforms/apps
- Any on-campus or college-organized activities

Query: "${userMessage}"

Respond with ONLY ONE WORD:
- "CAMPUS" if the query is campus-related
- "NON_CAMPUS" if it is not campus-related`;

        const result = await model.generateContent(classificationPrompt);
        const response = result.response.text().trim().toUpperCase();
        
        // Extract classification (handle cases with extra text)
        const classification = response.includes("CAMPUS") && !response.includes("NON_CAMPUS") 
          ? "CAMPUS" 
          : "NON_CAMPUS";
        
        console.log('✅ Intent classified as:', classification);
        return classification;
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed for classification:`, modelError.message);
        continue;
      }
    }
    
    throw new Error("All models failed for intent classification");
  } catch (error) {
    console.error("❌ Intent classification error:", error);
    // Default to NON_CAMPUS for safety
    return "NON_CAMPUS";
  }
};

/**
 * 🔍 SEMANTIC CONTEXT RETRIEVAL - RAG
 * Finds most relevant campus documents for the user query
 * Uses Gemini to semantically rank documents by relevance
 */
export const findRelevantCampusContext = async (userMessage, allCampusDocuments = []) => {
  console.log('🔍 Finding relevant context for:', userMessage);
  console.log('📚 Available documents:', allCampusDocuments.length);

  if (!userMessage || !userMessage.trim()) {
    console.log('⚠️ Empty message, returning empty context');
    return [];
  }

  if (!allCampusDocuments || allCampusDocuments.length === 0) {
    console.log('⚠️ No campus documents available');
    return [];
  }

  if (!API_KEY || !genAI) {
    console.error('❌ No Gemini API key for context retrieval');
    return [];
  }

  try {
    const modelsToTry = ["models/gemini-pro", "models/gemini-pro-vision", "models/gemini-1.0-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1, // ✅ Low temperature for consistent ranking
            topK: 3,
            topP: 0.3,
            maxOutputTokens: 1000
          }
        });

        // Create a numbered list of documents for ranking
        const documentsText = allCampusDocuments
          .map((doc, idx) => `[${idx}] Category: ${doc.category}, Title: ${doc.title}, Content: ${doc.content}`)
          .join('\n\n');

        const rankingPrompt = `You are a semantic search ranker. Analyze the following campus query and select the most relevant documents from the provided list.

Query: "${userMessage}"

Documents:
${documentsText}

Rank the top 3-5 most relevant documents by their index numbers.
Return ONLY a JSON array with indices: [0, 2, 5]
If no documents are relevant, return empty array: []
Example: [1, 3, 7]`;

        const result = await model.generateContent(rankingPrompt);
        const response = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        
        try {
          const indices = JSON.parse(response);
          
          if (!Array.isArray(indices)) {
            console.warn('⚠️ Invalid response format, returning empty');
            return [];
          }

          // Filter to valid indices and get documents
          const relevantDocs = indices
            .filter(idx => Number.isInteger(idx) && idx >= 0 && idx < allCampusDocuments.length)
            .map(idx => allCampusDocuments[idx]);

          console.log(`✅ Found ${relevantDocs.length} relevant documents`);
          return relevantDocs;
        } catch (parseError) {
          console.warn('⚠️ Failed to parse ranking response:', response);
          return [];
        }
      } catch (modelError) {
        console.warn(`⚠️ Model ${modelName} failed for context retrieval:`, modelError.message);
        continue;
      }
    }
    
    throw new Error("All models failed for context retrieval");
  } catch (error) {
    console.error("❌ Context retrieval error:", error);
    return [];
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
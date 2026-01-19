import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateEmbedding, computeSemanticSimilarities } from './vertexAI';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
console.log('Gemini API Key loaded:', API_KEY ? 'Yes' : 'No');
console.log('API Key length:', API_KEY ? API_KEY.length : 0);
console.log('API Key starts with:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'No key');

if (!API_KEY) {
  console.error('No Gemini API key found in environment variables');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Function to get available models
export const getAvailableModels = async () => {
  try {
    // Note: listModels might not be available in this version
    console.log('Using known Gemini models: gemini-1.5-flash-001, gemini-1.0-pro');
    return ['gemini-1.5-flash-001', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-pro'];
  } catch (error) {
    console.error('Error with models:', error);
    return ['gemini-1.5-flash-001']; // fallback
  }
};

export const searchOpportunitiesWithAI = async (query, opportunities) => {
  console.log('Starting AI search for query:', query);
  console.log('Available opportunities:', opportunities.length);

  // Check if query is provided
  if (!query || !query.trim()) {
    console.log('No query provided');
    return [];
  }

  // Make sure we have opportunities in the database
  if (!opportunities || opportunities.length === 0) {
    console.warn('No opportunities in database - returning empty');
    return [];
  }

  // Check if API key is set
  if (!API_KEY || !genAI) {
    console.error('No Gemini API key found or genAI not initialized');
    return [];
  }

  try {
    console.log('Starting hybrid AI search...');

    // Generate query embedding using Vertex AI
    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      console.warn('Failed to generate query embedding, falling back to Gemini only');
    }

    // Compute semantic similarities if embeddings available
    let opportunitiesWithSimilarity = opportunities;
    if (queryEmbedding) {
      opportunitiesWithSimilarity = computeSemanticSimilarities(queryEmbedding, opportunities);
      console.log('Computed semantic similarities for all opportunities');
    }

    // Step 3: Get Gemini recommendations
    const availableModels = await getAvailableModels();
    console.log('Available Gemini models:', availableModels);

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
- Rank by relevance (top 5 max to allow for semantic merging)
- For each match, explain why it matches`;

    const userMessage = `Query: "${query}"

Database Opportunities:
${JSON.stringify(opportunities, null, 2)}

Match opportunities from the database only. Return JSON array:
[{"id": "exact_id_from_database", "reason": "2-3 sentence explanation", "score": 1-10}]`;

    // Try different models in order of preference
    const modelsToTry = ["gemini-1.5-flash-001", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];

    let geminiRecommendations = [];
    for (const modelName of modelsToTry) {
      try {
        console.log('Trying model:', modelName);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.2, // Low temperature for deterministic results
            topK: 5,
            topP: 0.5,
          }
        });

        const result = await model.generateContent(systemPrompt + "\n\n" + userMessage);

        const text = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        console.log('Gemini response:', text);

        // Parse and check the results
        const recommendations = JSON.parse(text);

        if (!Array.isArray(recommendations)) {
          console.warn('Gemini response is not an array, treating as empty');
          continue;
        }

        // Make sure all IDs are real
        geminiRecommendations = recommendations.filter(rec => {
          const exists = opportunities.some(opp => opp.id === rec.id);
          if (!exists) {
            console.warn(`Gemini returned non-existent ID: ${rec.id} - FILTERING OUT`);
          }
          return exists;
        });

        console.log(`Valid Gemini recommendations: ${geminiRecommendations.length} (filtered from ${recommendations.length})`);
        break; // Success, exit loop
      } catch (modelError) {
        console.warn(`Model ${modelName} failed:`, modelError.message);
        continue; // Try next model
      }
    }

    if (geminiRecommendations.length === 0) {
      console.warn('No Gemini recommendations, returning empty');
      return [];
    }

    // For demo, just use Gemini scores
    console.log('Using Gemini-only scores for demo...');
    const mergedRecommendations = geminiRecommendations.map(geminiRec => {
      const opportunity = opportunitiesWithSimilarity.find(opp => opp.id === geminiRec.id);

      // Gemini-only score (normalized 0-1)
      const combinedScore = geminiRec.score / 10;

      // Use Gemini reason only (no semantic enhancement for demo)
      const enhancedReason = geminiRec.reason;

      return {
        opportunityId: geminiRec.id,
        title: opportunity?.title || 'Unknown',
        description: opportunity?.description || 'No description',
        combinedScore: combinedScore,
        explanation: enhancedReason
      };
    });

    // Sort by combined score and return top results
    const finalRecommendations = mergedRecommendations
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, 5); // Return top 5

    console.log(`Final recommendations: ${finalRecommendations.length} (Gemini-only for demo)`);
    return finalRecommendations;
  } catch (error) {
    console.error("Hybrid AI Search Error:", error);
    // SAFE FALLBACK: Return empty array instead of inventing results
    return [];
  }
};

/**
 * Classifies what the user is asking about using AI
 * Returns "OPPORTUNITY", "CAMPUS_INFO", or "NON_CAMPUS"
 */
export const classifyCampusIntent = async (userMessage) => {
  console.log('Classifying intent for message:', userMessage);

  if (!userMessage || !userMessage.trim()) {
    return "NON_CAMPUS"; // Default to non-campus for empty messages
  }

  if (!API_KEY || !genAI) {
    console.error('No Gemini API key found for intent classification');
    return "NON_CAMPUS";
  }

  try {
    const modelsToTry = ["gemini-1.5-flash-001", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1, // Minimal temperature for consistent classification
            topK: 1,
            topP: 0,
            maxOutputTokens: 20
          }
        });

        const classificationPrompt = `You are a campus query classifier.
Analyze the following query and classify it into one of three categories:

OPPORTUNITY: Queries about finding or searching for internships, hackathons, workshops, jobs, placements, or career opportunities.

CAMPUS_INFO: Queries about campus operations, infrastructure, rules, policies, events, student life, how to use platforms, or general campus information.

NON_CAMPUS: Queries that are not related to campus or opportunities at all.

Query: "${userMessage}"

Respond with ONLY ONE WORD:
- "OPPORTUNITY" for opportunity-related queries
- "CAMPUS_INFO" for campus information queries
- "NON_CAMPUS" for non-campus queries`;

        const result = await model.generateContent(classificationPrompt);
        const response = result.response.text().trim().toUpperCase();

        // Extract classification
        let classification = "NON_CAMPUS"; // default
        if (response.includes("OPPORTUNITY")) {
          classification = "OPPORTUNITY";
        } else if (response.includes("CAMPUS_INFO")) {
          classification = "CAMPUS_INFO";
        } else if (response.includes("NON_CAMPUS")) {
          classification = "NON_CAMPUS";
        }

        console.log('Intent classified as:', classification);
        return classification;
      } catch (modelError) {
        console.warn(`Model ${modelName} failed for classification:`, modelError.message);
        continue;
      }
    }

    throw new Error("All models failed for intent classification");
  } catch (error) {
    console.error("Intent classification error:", error);
    // Default to CAMPUS_INFO to allow some response
    return "CAMPUS_INFO";
  }
};

/**
 * Finds the best campus docs for the user's question
 * Uses AI to rank them by how relevant they are
 */
export const findRelevantCampusContext = async (userMessage, allCampusDocuments = []) => {
  console.log('Finding relevant context for:', userMessage);
  console.log('Available documents:', allCampusDocuments.length);

  if (!userMessage || !userMessage.trim()) {
    console.log('Empty message, returning empty context');
    return [];
  }

  if (!allCampusDocuments || allCampusDocuments.length === 0) {
    console.log('No campus documents available');
    return [];
  }

  if (!API_KEY || !genAI) {
    console.error('No Gemini API key for context retrieval');
    // Fall through to keyword search if API key is missing
  }

  // 1. Try Semantic Search with Gemini
  if (API_KEY && genAI) {
  try {
    const modelsToTry = ["gemini-1.5-flash-001", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];
    
    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent ranking
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
            console.warn('Invalid response format from AI');
            continue; // Try next model
          }

          // Filter to valid indices and get documents
          const relevantDocs = indices
            .filter(idx => Number.isInteger(idx) && idx >= 0 && idx < allCampusDocuments.length)
            .map(idx => allCampusDocuments[idx]);

          if (relevantDocs.length > 0) {
            console.log(`Found ${relevantDocs.length} relevant documents via AI`);
            return relevantDocs;
          }
        } catch (parseError) {
          console.warn('Failed to parse ranking response:', response);
          continue;
        }
      } catch (modelError) {
        console.warn(`Model ${modelName} failed for context retrieval:`, modelError.message);
        continue;
      }
    }
  } catch (error) {
    console.error("Context retrieval error:", error);
  }
  }

  // Fallback: Keyword Search
  console.log('AI didn't work, using keyword search instead.');
  const queryTerms = userMessage.toLowerCase().split(/\s+/).filter(word => word.length > 3);

  if (queryTerms.length === 0) return [];

  const fallbackDocs = allCampusDocuments.filter(doc => {
    const content = `${doc.title} ${doc.content} ${doc.category}`.toLowerCase();
    return queryTerms.some(term => content.includes(term));
  });

  console.log(`Keyword fallback found ${fallbackDocs.length} documents`);
  return fallbackDocs.slice(0, 3);
};

export const generateQuerySuggestions = async () => {
  try {
    const modelsToTry = ["gemini-1.5-flash-001", "gemini-1.5-flash", "gemini-1.0-pro", "gemini-pro"];

    for (const modelName of modelsToTry) {
      try {
        console.log('Trying model', modelName, 'for suggestions');
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
        console.warn(`Model ${modelName} failed for suggestions:`, modelError.message);
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
    console.error("Error generating suggestions:", error);
    return [
      "Internships for computer science students",
      "Workshops on AI and machine learning",
      "Hackathons for beginners",
      "Tech events in my city",
      "Opportunities for 2nd year students"
    ];
  }
};

// AI Metrics for Demo Readiness

/**
 * Calculates how many of the top 5 results are actually good
 * Counts as good if score is 7 or higher
 */
export const calculatePrecisionAt5 = (recommendations) => {
  if (!recommendations || recommendations.length === 0) return 0;

  const top5 = recommendations.slice(0, 5);
  const relevant = top5.filter(rec => rec.score >= 7).length;
  return relevant / top5.length;
};

/**
 * Calculates how many relevant items we found in the top 10
 * Relevant means score 7 or higher
 */
export const calculateRecallAt10 = (recommendations, allOpportunities) => {
  if (!recommendations || recommendations.length === 0) return 0;

  const top10 = recommendations.slice(0, 10);
  const retrievedRelevant = top10.filter(rec => rec.score >= 7).length;
  const totalRelevant = allOpportunities.filter(opp => {
    // Find the recommendation score for this opportunity
    const rec = recommendations.find(r => r.id === opp.id);
    return rec && rec.score >= 7;
  }).length;

  return totalRelevant > 0 ? retrievedRelevant / totalRelevant : 0;
};

/**
 * Tracks how long AI calls take
 */
export const trackResponseTime = async (aiFunction, ...args) => {
  const startTime = Date.now();
  try {
    const result = await aiFunction(...args);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`AI Response Time: ${responseTime}ms`);
    return { result, responseTime };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.error(`AI Error after ${responseTime}ms:`, error);
    throw error;
  }
};

/**
 * Summarizes the AI performance metrics
 */
export const getAIMetrics = (recommendations, allOpportunities) => {
  const precisionAt5 = calculatePrecisionAt5(recommendations);
  const recallAt10 = calculateRecallAt10(recommendations, allOpportunities);

  return {
    precisionAt5: (precisionAt5 * 100).toFixed(1) + '%',
    recallAt10: (recallAt10 * 100).toFixed(1) + '%',
    totalRecommendations: recommendations.length,
    averageScore: recommendations.length > 0
      ? (recommendations.reduce((sum, rec) => sum + rec.score, 0) / recommendations.length).toFixed(1)
      : 0
  };
};

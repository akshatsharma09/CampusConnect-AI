import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyCampusIntent, findRelevantCampusContext } from './aiSearch';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ No Gemini API key found for campus chatbot');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * 🤖 CAMPUS-ONLY CHATBOT - AI-DRIVEN, NO KEYWORDS
 *
 * FLOW:
 * 1. User submits query
 * 2. Gemini classifies intent (OPPORTUNITY vs CAMPUS_INFO vs NON_CAMPUS) - NO keywords
 * 3. If NON_CAMPUS → refuse immediately
 * 4. If OPPORTUNITY → search for opportunities and return recommendations
 * 5. If CAMPUS_INFO → retrieve relevant documents semantically (RAG)
 * 6. If no context found → refuse politely
 * 7. If context found → answer using strict system prompt (NO hallucination)
 *
 * Temperature: 0.3 for slightly more natural responses while maintaining strictness
 */
export const askCampusAssistant = async (userMessage, campusContext = [], opportunities = []) => {
  console.log('🤖 Campus Assistant received query:', userMessage);
  console.log('📚 Available campus context:', campusContext.length, 'documents');
  console.log('🎯 Available opportunities:', opportunities.length);

  // ✅ VALIDATION 1: Check message is provided
  if (!userMessage || !userMessage.trim()) {
    return {
      success: false,
      message: "Please ask a question.",
      refusal: false
    };
  }

  // ✅ VALIDATION 2: Check API key
  if (!API_KEY || !genAI) {
    console.error('❌ Gemini API key not found');
    return {
      success: false,
      message: "Campus Assistant is temporarily unavailable. Please try again later.",
      refusal: false
    };
  }

  try {
    // 🧠 STEP 1: AI-BASED INTENT VALIDATION (NO KEYWORDS)
    console.log('🧠 Step 1: Classifying intent semantically...');
    let intent = "CAMPUS_INFO"; // Default to CAMPUS_INFO for demo stability
    try {
      intent = await classifyCampusIntent(userMessage);
    } catch (classificationError) {
      console.warn('⚠️ Intent classification failed, defaulting to CAMPUS_INFO:', classificationError.message);
      intent = "CAMPUS_INFO"; // Skip distinction if causing errors
    }

    // 🚫 STEP 2: REFUSE NON-CAMPUS IMMEDIATELY
    if (intent === "NON_CAMPUS") {
      console.log('🚫 Non-campus query detected, refusing');
      return {
        success: true,
        message: "I can only answer campus-related questions based on available information. Try asking about placements, internships, campus events, rules, or how to use CampusConnect.",
        refusal: true,
        isNonCampus: true
      };
    }

    // 🎯 STEP 3: HANDLE OPPORTUNITY QUERIES
    if (intent === "OPPORTUNITY") {
      console.log('🎯 Opportunity query detected, searching for opportunities...');

      // Import search function dynamically to avoid circular dependency
      const { searchOpportunitiesWithAI } = await import('./aiSearch');

      const recommendations = await searchOpportunitiesWithAI(userMessage, opportunities);

      if (!recommendations || recommendations.length === 0) {
        return {
          success: true,
          message: "I couldn't find any matching opportunities for your query. Try different keywords or check the search bar for available opportunities.",
          refusal: true,
          noOpportunities: true
        };
      }

      // Format recommendations as text response
      const formattedResponse = recommendations
        .map((rec, idx) => `${idx + 1}. **${rec.title}**\n   ${rec.description}\n   *Why recommended:* ${rec.explanation}`)
        .join('\n\n');

      return {
        success: true,
        message: `Here are some opportunities that match your query:\n\n${formattedResponse}`,
        refusal: false,
        isOpportunity: true,
        recommendations: recommendations
      };
    }

    // 🔍 STEP 4: RETRIEVE RELEVANT CONTEXT FOR CAMPUS_INFO (RAG)
    console.log('🔍 Step 2: Retrieving relevant campus context...');
    const relevantContext = await findRelevantCampusContext(userMessage, campusContext);

    // ⚠️ STEP 5: REFUSE IF NO CONTEXT
    if (!relevantContext || relevantContext.length === 0) {
      console.log('⚠️ No relevant campus context found');
      return {
        success: true,
        message: "I don't have information about this topic right now. Please contact the placement office, student affairs, or check the campus portal for more details.",
        refusal: true,
        noContext: true
      };
    }

    // ✅ STEP 6: ANSWER WITH STRICT SYSTEM PROMPT (RAG-BASED)
    console.log('🚀 Step 3: Generating answer with retrieved context...');

    // Build context string from retrieved documents
    const contextString = relevantContext
      .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
      .join('\n\n');

    // 🔐 CRITICAL: STRICT SYSTEM PROMPT - UNCHANGED, REQUIRED
    const systemPrompt = `You are the CampusConnect Assistant.

Rules:
1. Answer ONLY using the provided campus-related context.
2. If the answer is not in the context, respond:
   "I can only answer campus-related questions based on available information."
3. Do NOT use general world knowledge.
4. Do NOT hallucinate.
5. Politely refuse non-campus-related questions.

Context:
${contextString}

Question:`;

    const userPrompt = `${userMessage}

Answer based ONLY on the provided context. Do not add external knowledge or make assumptions.`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
      generationConfig: {
        temperature: 0.3, // ✅ Slightly higher for natural responses, but strict with context
        topK: 5,
        topP: 0.5,
        maxOutputTokens: 500
      }
    });

    // Send to Gemini with strict context
    const result = await model.generateContent(systemPrompt + "\n" + userPrompt);

    const responseText = result.response.text().trim();
    console.log('✅ Campus Assistant response:', responseText);

    // ✅ VALIDATION: Check response is meaningful
    if (!responseText) {
      console.warn('⚠️ Empty response from Gemini');
      return {
        success: true,
        message: "I couldn't generate a response. Please try again.",
        refusal: true
      };
    }

    return {
      success: true,
      message: responseText,
      refusal: false,
      isCampusInfo: true
    };

  } catch (error) {
    console.error("❌ Campus Assistant Error:", error);
    return {
      success: false,
      message: "Campus Assistant encountered an error. Please try again later.",
      refusal: false,
      error: error.message
    };
  }
};

/**
 * Retrieves the AI-formatted campus context for debugging
 */
export const formatCampusContext = (campusDocuments) => {
  return campusDocuments
    .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
    .join('\n\n');
};

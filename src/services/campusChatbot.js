import { GoogleGenerativeAI } from "@google/generative-ai";
import { classifyCampusIntent, findRelevantCampusContext } from './gemini';

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
 * 2. Gemini classifies intent (CAMPUS vs NON_CAMPUS) - NO keywords
 * 3. If NON_CAMPUS → refuse immediately
 * 4. If CAMPUS → retrieve relevant documents semantically (RAG)
 * 5. If no context found → refuse politely
 * 6. If context found → answer using strict system prompt (NO hallucination)
 * 
 * Temperature: 0.3 for slightly more natural responses while maintaining strictness
 */
export const askCampusAssistant = async (userMessage, campusContext = []) => {
  console.log('🤖 Campus Assistant received query:', userMessage);
  console.log('📚 Available campus context:', campusContext.length, 'documents');

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
    const intent = await classifyCampusIntent(userMessage);

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

    // 🔍 STEP 3: RETRIEVE RELEVANT CONTEXT SEMANTICALLY (RAG)
    console.log('🔍 Step 2: Retrieving relevant campus context...');
    const relevantContext = await findRelevantCampusContext(userMessage, campusContext);

    // ⚠️ STEP 4: REFUSE IF NO CONTEXT
    if (!relevantContext || relevantContext.length === 0) {
      console.log('⚠️ No relevant campus context found');
      return {
        success: true,
        message: "I don't have information about this topic right now. Please contact the placement office, student affairs, or check the campus portal for more details.",
        refusal: true,
        noContext: true
      };
    }

    // ✅ STEP 5: ANSWER WITH STRICT SYSTEM PROMPT (RAG-BASED)
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
      model: "models/gemini-pro",
      generationConfig: {
        temperature: 0.3, // ✅ Slightly higher for natural responses, but strict with context
        topK: 5,
        topP: 0.5,
        maxOutputTokens: 500
      }
    });

    // Send to Gemini with strict context
    const result = await model.generateContent([
      { role: "user", parts: [{ text: systemPrompt + "\n" + userPrompt }] }
    ]);

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
      isNonCampus: false
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

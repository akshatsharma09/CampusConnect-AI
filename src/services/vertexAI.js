// Vertex AI Text Embeddings Integration
// Note: In production, this should be moved to a secure backend service
// Client-side authentication with service account keys is not recommended
// Temporarily disabled for browser compatibility - requires backend implementation

const PROJECT_ID = 'campusconnect-ai-e327e';
const LOCATION = 'us-central1';
const MODEL_NAME = 'textembedding-gecko@003';
const API_ENDPOINT = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_NAME}:predict`;

// Auth disabled for browser compatibility
let auth = null;
console.log('⚠️ Vertex AI auth disabled for browser compatibility - implement backend service for production');

/**
 * Generate embedding for text using Vertex AI
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
export const generateEmbedding = async (text) => {
  if (!auth) {
    console.warn('Vertex AI auth not initialized');
    return null;
  }

  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{
          content: text
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Vertex AI API error: ${response.status}`);
    }

    const data = await response.json();
    const embedding = data.predictions[0].embeddings.values;
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
};

/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number} - Similarity score between 0 and 1
 */
export const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Compute similarities between query embedding and opportunity embeddings
 * @param {number[]} queryEmbedding
 * @param {Array} opportunities - Array of opportunities with embedding_vector
 * @returns {Array} - Opportunities with similarity scores
 */
export const computeSemanticSimilarities = (queryEmbedding, opportunities) => {
  return opportunities.map(opp => {
    const similarity = opp.embedding_vector
      ? cosineSimilarity(queryEmbedding, opp.embedding_vector)
      : 0;
    return {
      ...opp,
      semanticSimilarity: similarity
    };
  });
};

/**
 * Batch generate embeddings for opportunities
 * @param {Array} opportunities
 * @returns {Promise<Array>} - Opportunities with embeddings
 */
export const generateOpportunityEmbeddings = async (opportunities) => {
  const results = [];

  for (const opp of opportunities) {
    const text = `${opp.title} ${opp.description || ''} ${opp.domain || ''}`;
    const embedding = await generateEmbedding(text);

    results.push({
      ...opp,
      embedding_vector: embedding
    });

    // Add small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
};

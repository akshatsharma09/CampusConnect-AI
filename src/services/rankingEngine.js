import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Ranks opportunities for students based on their profile, search query, deadlines, and campus fit.
 * Gives clear reasons why each opportunity matches.
 */

export const calculateRankingReasons = async (opportunities, userProfile, query) => {
  console.log('Calculating ranking reasons for', opportunities.length, 'opportunities');
  
  if (!opportunities || opportunities.length === 0) {
    return {};
  }

  if (!API_KEY || !genAI) {
    console.warn('No API key, using fallback ranking');
    return generateFallbackReasons(opportunities, userProfile, query);
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-001",
      generationConfig: {
        temperature: 0.3,
        topK: 5,
        topP: 0.5,
      }
    });

    const profileContext = userProfile ? 
      `Student Profile: Year: ${userProfile.year || 'Not specified'}, Branch: ${userProfile.branch || 'Not specified'}, Skills: ${userProfile.skills?.join(', ') || 'Not specified'}, Interests: ${userProfile.interests?.join(', ') || 'Not specified'}`
      : 'Student Profile: Not available';

    const opportunitiesContext = opportunities.map(opp => 
      `ID: ${opp.id}, Title: ${opp.title}, Type: ${opp.type}, Domain: ${opp.domain}, EligibleYear: ${opp.eligibleYear || 'All'}, Deadline: ${formatDate(opp.deadline)}, CampusVerified: ${opp.campusVerified ? 'Yes' : 'No'}, Description: ${opp.description || 'N/A'}`
    ).join('\n');

    const prompt = `You are an explainable AI ranking system for opportunities.

${profileContext}
User Query: "${query}"

Opportunities to rank:
${opportunitiesContext}

For EACH opportunity, analyze and generate a concise 2-3 sentence ranking reason that highlights:
1. How it matches the student's year/branch
2. Skills/keyword alignment with query
3. If deadline is urgent (within 2 weeks)
4. Campus verification status

Format your response as JSON:
{
  "opportunity_id": {
    "reason": "Clear explanation of why this opportunity is recommended",
    "factors": ["factor1", "factor2", "factor3"]
  }
}

Be concise and user-friendly. Focus on the strongest matching factors.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    
    const reasons = JSON.parse(text);
    console.log('Ranking reasons generated:', Object.keys(reasons).length);
    return reasons;
  } catch (error) {
    console.error('Error generating ranking reasons:', error);
    return generateFallbackReasons(opportunities, userProfile, query);
  }
};

/**
 * Simple ranking when AI isn't available
 */
export const generateFallbackReasons = (opportunities, userProfile, query) => {
  const reasons = {};
  const queryLower = query.toLowerCase();

  opportunities.forEach(opp => {
    const factors = [];
    let score = 0;

    // Check year eligibility
    if (userProfile?.year) {
      const oppYear = opp.eligibleYear?.toLowerCase() || '';
      if (oppYear.includes('all') || oppYear.includes(userProfile.year)) {
        factors.push(`Eligible for ${userProfile.year} year`);
        score += 30;
      }
    }

    // Check branch/domain alignment
    if (userProfile?.branch) {
      const description = `${opp.description || ''} ${opp.domain || ''}`.toLowerCase();
      if (description.includes(userProfile.branch.toLowerCase())) {
        factors.push(`Matches your ${userProfile.branch} branch`);
        score += 20;
      }
    }

    // Check skills match
    if (userProfile?.skills) {
      const oppText = `${opp.title} ${opp.description || ''}`.toLowerCase();
      const matchedSkills = userProfile.skills.filter(skill =>
        oppText.includes(skill.toLowerCase())
      );
      if (matchedSkills.length > 0) {
        factors.push(`Matches your skills: ${matchedSkills.join(', ')}`);
        score += 25;
      }
    }

    // Check deadline urgency
    const deadline = parseDate(opp.deadline);
    if (deadline) {
      const daysUntil = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntil > 0 && daysUntil <= 14) {
        factors.push(`Deadline approaching (${daysUntil} days left)`);
        score += 20;
      }
    }

    // Check campus verification
    if (opp.campusVerified) {
      factors.push('✓ Verified for your campus');
      score += 15;
    }

    // Query keyword matching
    if (queryLower.length > 0) {
      const oppText = `${opp.title} ${opp.description || ''} ${opp.domain || ''}`.toLowerCase();
      const keywordMatches = queryLower.split(/\s+/).filter(word =>
        word.length > 3 && oppText.includes(word)
      );
      if (keywordMatches.length > 0) {
        factors.push(`Matches your search: "${keywordMatches.join(', ')}"`);
        score += 20;
      }
    }

    reasons[opp.id] = {
      reason: generateReasonText(factors, opp),
      factors: factors,
      score: score
    };
  });

  return reasons;
};

/**
 * Makes the reason text easy to read
 */
const generateReasonText = (factors, opportunity) => {
  if (factors.length === 0) {
    return 'Opportunity available for you';
  }

  if (factors.length === 1) {
    return `Recommended: ${factors[0]}`;
  }

  const topFactors = factors.slice(0, 3);
  const factorText = topFactors.join('; ');
  return `Recommended: ${factorText}`;
};

/**
 * Formats dates nicely for display
 */
const formatDate = (deadline) => {
  if (!deadline) return 'No deadline';
  
  try {
    let date;
    if (typeof deadline === 'object' && deadline.seconds) {
      date = new Date(deadline.seconds * 1000);
    } else if (typeof deadline === 'string') {
      date = new Date(deadline);
    } else {
      return 'No deadline';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return 'No deadline';
  }
};

/**
 * Turns date strings into Date objects
 */
const parseDate = (deadline) => {
  try {
    if (typeof deadline === 'object' && deadline.seconds) {
      return new Date(deadline.seconds * 1000);
    } else if (typeof deadline === 'string') {
      return new Date(deadline);
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Keeps only opportunities verified for the user's campus
 */
export const filterByCampus = (opportunities, userCampus) => {
  if (!userCampus) return opportunities;
  return opportunities.filter(opp => 
    !opp.campusVerified || opp.verifiedFor?.includes(userCampus)
  );
};

/**
 * Orders opportunities by how relevant they are
 */
export const sortByRelevance = (opportunities, reasons) => {
  return opportunities.sort((a, b) => {
    const scoreA = reasons[a.id]?.score || 0;
    const scoreB = reasons[b.id]?.score || 0;
    return scoreB - scoreA;
  });
};

import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from './firebase';

const COLLECTION_NAME = 'campus_info';

/**
 * Fetches all campus-related documents from Firestore
 * Used as context for the campus chatbot
 */
export const fetchCampusContext = async () => {
  try {
    const campusRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(campusRef);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('✅ Fetched campus documents:', docs.length);
    if (docs.length > 0) {
      console.log('📚 Loaded topics:', docs.map(d => d.title).slice(0, 5).join(', ') + (docs.length > 5 ? '...' : ''));
    }
    return docs;
  } catch (error) {
    console.error('❌ Error fetching campus context:', error);
    return [];
  }
};

/**
 * Searches campus documents for relevant context
 * Returns documents matching a category or type
 * NOTE: This is a strict category filter, not the Gemini Semantic Search.
 */
export const searchCampusContext = async (category = null) => {
  try {
    const campusRef = collection(db, COLLECTION_NAME);
    let campusQuery = campusRef;

    if (category) {
      campusQuery = query(campusRef, where('category', '==', category));
    }

    const snapshot = await getDocs(campusQuery);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`✅ Fetched ${docs.length} campus documents for category: ${category || 'all'}`);
    return docs;
  } catch (error) {
    console.error('❌ Error searching campus context:', error);
    return [];
  }
};

/**
 * Generates a response from Gemini AI using RAG (Retrieval-Augmented Generation)
 * @param {string} userQuery - The user's question
 * @param {Array} contextDocs - Array of campus documents to use as context
 * @returns {Promise<string>} - The AI response
 */
export const getGeminiResponse = async (userQuery, contextDocs) => {
  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      console.error("❌ Gemini API Key is missing in .env");
      return "Configuration Error: API Key missing.";
    }

    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });

    // Create context string from documents
    const contextText = contextDocs
      .map(doc => `[${doc.category}] ${doc.title}: ${doc.content}`)
      .join('\n\n');

    const prompt = `
      You are the CampusConnect AI Assistant. Use the following campus information to answer the student's question.
      
      Context Information:
      ${contextText}
      
      Student Question: ${userQuery}
      
      Instructions:
      1. Only answer based on the provided context.
      2. If the answer is not in the context, politely say you don't have that information.
      3. Keep answers concise and helpful.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    return "I'm having trouble connecting to the AI right now. Please try again later.";
  }
};

/**
 * Seeds campus database with sample campus information
 * Includes placements, internships, rules, events, etc.
 */
export const seedCampusDatabase = async () => {
  const sampleCampusData = [
    {
      category: 'Placements',
      title: 'Annual Placement Drive 2024',
      content: 'Our campus hosts recruitment drives every semester. Top companies like Google, Microsoft, Amazon, and ICICI Bank visit our campus. The placement office coordinates all activities. Last year, 95% of students were placed with an average package of 8.5 LPA.',
      type: 'info'
    },
    {
      category: 'Placements',
      title: 'Placement Cell Contact',
      content: 'Email: placements@campus.edu | Office: Building A, Room 302 | Phone: +91-98765-43210. Contact them for resume uploads, interview schedules, and placement queries.',
      type: 'contact'
    },
    {
      category: 'Internships',
      title: 'Summer Internship Program',
      content: 'The college facilitates summer internships (June-July). Students are encouraged to apply through the internship portal. Stipends range from 10,000 to 30,000 per month depending on company and role.',
      type: 'info'
    },
    {
      category: 'Internships',
      title: 'Internship Portal Login',
      content: 'Access the internship portal at portal.campus.edu/internships. Username: your roll number. Password: set on first login. All internship opportunities are posted here.',
      type: 'guide'
    },
    {
      category: 'Campus Rules',
      title: 'Hostel Guidelines',
      content: 'Hostel curfew is 10 PM on weekdays and 11 PM on weekends. Visitors are allowed until 6 PM. No outside food is permitted in hostels. Room inspection happens every Sunday.',
      type: 'rules'
    },
    {
      category: 'Campus Rules',
      title: 'Academic Integrity Policy',
      content: 'All academic work must be original. Plagiarism, copying, and cheating will result in strict disciplinary action. First offense: zero in assignment. Repeated offenses may lead to suspension or expulsion.',
      type: 'rules'
    },
    {
      category: 'Campus Events',
      title: 'Annual Tech Fest',
      content: 'TechFest happens in March every year. It includes hackathons, coding competitions, workshops, and guest lectures. Participation is open to all students and some events are inter-college. Registration opens in February.',
      type: 'event'
    },
    {
      category: 'Campus Events',
      title: 'Cultural Fest Schedule',
      content: 'CulturalFest is held in October. Events include dance, drama, music, sports, and food festival. Participation is free for all students. Winners get prizes and participation certificates.',
      type: 'event'
    },
    {
      category: 'Campus Notices',
      title: 'CampusConnect App Guide',
      content: 'CampusConnect is the official platform to find internships, hackathons, and campus events. Download the app or use the web portal. All opportunities are verified by the college.',
      type: 'guide'
    },
    {
      category: 'Campus Notices',
      title: 'Library Hours',
      content: 'Main library is open 8 AM to 10 PM on weekdays and 9 AM to 8 PM on weekends. 24-hour access is available for final year students with special permission from the Head Librarian.',
      type: 'info'
    },
    {
      category: 'How to Use CampusConnect',
      title: 'Searching for Opportunities',
      content: 'Use the search bar to find internships and hackathons. Enter keywords like your year, domain, or type (e.g., "3rd year AI hackathon"). The AI assistant will show matching opportunities. Each opportunity includes deadline, eligibility, and application link.',
      type: 'guide'
    },
    {
      category: 'How to Use CampusConnect',
      title: 'Campus Assistant Help',
      content: 'The Campus Assistant chatbot can help you with placement info, internship guidelines, campus rules, events, and how to use CampusConnect. Ask any campus-related question. For non-campus queries, please visit Google or ask your mentor.',
      type: 'guide'
    },
    {
      category: 'Scholarships',
      title: 'Merit-cum-Means Scholarship 2024',
      content: 'The college offers a 50% tuition waiver for students with a GPA above 8.5 and family income below 5 LPA. Applications open in August. Submit income certificate and grade sheets to the Administrative Block, Counter 4.',
      type: 'info'
    },
    {
      category: 'Transportation',
      title: 'College Bus Routes & Timing',
      content: 'College buses cover 5 main routes: City Center (7:00 AM), North Extension (7:15 AM), South Avenue (7:10 AM), East Gate (7:20 AM), and West End (7:05 AM). Bus passes can be renewed semester-wise at the Transport Office near the main gate.',
      type: 'info'
    },
    {
      category: 'Health & Safety',
      title: 'Campus Health Center Services',
      content: 'The Health Center is located behind the Sports Complex. Open 24/7 for emergencies. A general physician visits Mon-Fri from 4 PM to 6 PM. Basic medicines and first-aid are free for students. Ambulance number: +91-99999-88888.',
      type: 'service'
    },
    {
      category: 'Student Clubs',
      title: 'Robotics Club Registration',
      content: 'The Robotics Club recruits new members at the start of every odd semester. No prior experience required, but a logic test is conducted. The club meets every Wednesday at 5 PM in the Innovation Lab. Contact: robotics@campus.edu.',
      type: 'activity'
    },
    {
      category: 'Examinations',
      title: 'Grading System & Re-evaluation',
      content: 'We follow a 10-point CGPA system. S Grade: >90, A Grade: 80-90, B Grade: 70-80. To pass, a minimum of 40% is required in end-sem exams. Re-evaluation requests must be submitted within 7 days of result declaration with a fee of ₹500 per subject.',
      type: 'rules'
    }
  ];

  try {
    for (const item of sampleCampusData) {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...item,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log('✅ Campus database seeded with', sampleCampusData.length, 'documents');
    console.log("Campus database seeded! Refresh to see new campus info.");
  } catch (error) {
    console.error("❌ Error seeding campus database:", error);
    // TODO: Replace with toast notification
  }
};

// 🛠️ Expose for console debugging
if (typeof window !== 'undefined') {
  window.seedCampus = seedCampusDatabase;
  console.log('🛠️ Debug: window.seedCampus() is available in console');
}

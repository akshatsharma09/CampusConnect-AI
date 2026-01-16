import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
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
    return docs;
  } catch (error) {
    console.error('❌ Error fetching campus context:', error);
    return [];
  }
};

/**
 * Searches campus documents for relevant context
 * Returns documents matching a category or type
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
    alert("Campus database seeded! Refresh to see new campus info.");
  } catch (error) {
    console.error("❌ Error seeding campus database:", error);
    alert("Failed to seed campus database. Check console for details.");
  }
};

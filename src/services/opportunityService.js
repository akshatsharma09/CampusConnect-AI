import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION_NAME = 'opportunities';

export const fetchOpportunities = async () => {
  try {
    const opportunitiesRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(opportunitiesRef);
    const opportunities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
};

export const seedDatabase = async () => {
  const sampleData = [
    {
      title: "Global AI Hackathon",
      type: "Hackathon",
      domain: "Artificial Intelligence",
      eligibleYear: "All Years",
      deadline: "2024-06-15",
      description: "A 48-hour global hackathon to build GenAI solutions.",
      link: "https://example.com/hackathon"
    },
    {
      title: "Frontend Developer Intern",
      type: "Internship",
      domain: "Web Development",
      eligibleYear: "3rd Year",
      deadline: "2024-05-20",
      description: "Summer internship for React developers at TechCorp.",
      link: "https://example.com/internship"
    },
    {
      title: "Machine Learning Workshop",
      type: "Workshop",
      domain: "Data Science",
      eligibleYear: "2nd Year, 3rd Year",
      deadline: "2024-04-30",
      description: "Hands-on workshop covering ML algorithms and Python.",
      link: "https://example.com/ml-workshop"
    },
    {
      title: "Cybersecurity Conference",
      type: "Workshop",
      domain: "Cybersecurity",
      eligibleYear: "All Years",
      deadline: "2024-07-15",
      description: "Annual conference with expert speakers and networking.",
      link: "https://example.com/cyber-conference"
    }
  ];

  try {
    for (const item of sampleData) {
      await addDoc(collection(db, COLLECTION_NAME), item);
    }
    alert("Database seeded with sample data! Refresh the page to see new opportunities.");
  } catch (error) {
    console.error("Error seeding database:", error);
    alert("Failed to seed database. Check console for details.");
  }
};
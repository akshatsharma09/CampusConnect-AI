import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";

const COLLECTION_NAME = "opportunities";

export const fetchOpportunities = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return [];
  }
};

// Helper to seed data for the hackathon demo
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
    }
  ];

  for (const item of sampleData) {
    await addDoc(collection(db, COLLECTION_NAME), item);
  }
  alert("Database seeded with sample data!");
};
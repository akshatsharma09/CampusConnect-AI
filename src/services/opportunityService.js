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
      title: "Global AI Hackathon 2026",
      type: "Hackathon",
      domain: "Artificial Intelligence",
      eligibleYear: "2nd Year, 3rd Year, 4th Year",
      deadline: "2026-02-28",
      description: "A 48-hour global hackathon to build GenAI solutions. Open to all branches. Prizes worth ₹5,00,000.",
      link: "https://example.com/hackathon",
      campusVerified: true,
      verifiedFor: ["CSE", "IT", "ECE"]
    },
    {
      title: "React Frontend Internship @ TechCorp",
      type: "Internship",
      domain: "Web Development",
      eligibleYear: "3rd Year",
      deadline: "2026-02-15",
      description: "Summer internship for React developers at TechCorp. ₹15,000/month. Work with cutting-edge technologies.",
      link: "https://example.com/internship",
      campusVerified: true,
      verifiedFor: ["CSE", "IT"]
    },
    {
      title: "Machine Learning Workshop",
      type: "Workshop",
      domain: "Data Science",
      eligibleYear: "2nd Year, 3rd Year",
      deadline: "2026-01-31",
      description: "Hands-on workshop covering ML algorithms, Python, and TensorFlow. Free for all students. Certificate provided.",
      link: "https://example.com/ml-workshop",
      campusVerified: true,
      verifiedFor: ["CSE", "IT", "ECE"]
    },
    {
      title: "Cybersecurity Bootcamp",
      type: "Workshop",
      domain: "Cybersecurity",
      eligibleYear: "All Years",
      deadline: "2026-02-20",
      description: "Expert-led bootcamp on ethical hacking and network security. Placement assistance for top performers.",
      link: "https://example.com/cyber-conference",
      campusVerified: false
    },
    {
      title: "Backend Developer Internship @ CloudStart",
      type: "Internship",
      domain: "Cloud Computing",
      eligibleYear: "3rd Year, 4th Year",
      deadline: "2026-02-10",
      description: "Build scalable APIs using Node.js and AWS. ₹20,000/month. Internship to FTE conversion possible.",
      link: "https://example.com/backend-internship",
      campusVerified: true,
      verifiedFor: ["CSE", "IT"]
    },
    {
      title: "Data Science Fellowship @ DataCorp",
      type: "Internship",
      domain: "Data Science",
      eligibleYear: "3rd Year, 4th Year",
      deadline: "2026-01-25",
      description: "Work on real-world ML projects. ₹25,000/month + mentorship. Open to CSE and ECE students.",
      link: "https://example.com/data-internship",
      campusVerified: true,
      verifiedFor: ["CSE", "ECE", "IT"]
    },
    {
      title: "Annual Tech Fest 2026 - Hackathon Track",
      type: "Hackathon",
      domain: "General",
      eligibleYear: "All Years",
      deadline: "2026-02-05",
      description: "Campus-wide hackathon with 24 hours to build anything. All projects judged. ₹2,00,000 in prizes.",
      link: "https://example.com/tech-fest",
      campusVerified: true,
      verifiedFor: ["CSE", "IT", "ECE", "ME", "CE", "EE"]
    },
    {
      title: "Mobile App Development Workshop",
      type: "Workshop",
      domain: "Mobile Development",
      eligibleYear: "2nd Year, 3rd Year",
      deadline: "2026-01-20",
      description: "Learn Flutter and React Native. Build and deploy your first app. Guest lecture from Google engineers.",
      link: "https://example.com/mobile-workshop",
      campusVerified: true,
      verifiedFor: ["CSE", "IT"]
    },
    {
      title: "DevOps Internship @ DeployHub",
      type: "Internship",
      domain: "DevOps",
      eligibleYear: "3rd Year, 4th Year",
      deadline: "2026-02-01",
      description: "Learn Docker, Kubernetes, and CI/CD pipelines. ₹18,000/month. Full-time offer for strong candidates.",
      link: "https://example.com/devops-internship",
      campusVerified: true,
      verifiedFor: ["CSE", "IT"]
    },
    {
      title: "Open Source Contribution Program",
      type: "Workshop",
      domain: "Open Source",
      eligibleYear: "All Years",
      deadline: "2026-03-31",
      description: "Contribute to major open-source projects. Mentorship from industry experts. Certificate and stipend for top contributors.",
      link: "https://example.com/opensource",
      campusVerified: false
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
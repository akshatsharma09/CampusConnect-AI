import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export const fetchOpportunities = async () => {
  try {
    const opportunitiesRef = collection(db, 'opportunities');
    const snapshot = await getDocs(opportunitiesRef);
    const opportunities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return opportunities;
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    return [];
  }
};
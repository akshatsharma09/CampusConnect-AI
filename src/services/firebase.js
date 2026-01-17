// Firebase configuration
// TODO: Replace with your Firebase project config from Firebase Console
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCVGxzOqq41dCgFaMxFq8QAIWP38h6v7wc",
  authDomain: "campusconnect-ai-e327e.firebaseapp.com",
  projectId: "campusconnect-ai-e327e",
  storageBucket: "campusconnect-ai-e327e.firebasestorage.app",
  messagingSenderId: "892396954190",
  appId: "1:892396954190:web:fda163027547069164191f"
};

// Validate config
const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingFields = requiredFields.filter(field => !firebaseConfig[field] || firebaseConfig[field].startsWith('your_'));

if (missingFields.length > 0) {
  console.error('Firebase config is incomplete. Missing fields:', missingFields);
  throw new Error('Firebase configuration is incomplete. Please check your .env file.');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
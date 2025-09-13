import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// You'll need to replace these with your actual Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyCD5HIBkzYsnOofQMCW6PjPC_9dayz9JbI",
    authDomain: "unimegle.firebaseapp.com",
    projectId: "unimegle",
    storageBucket: "unimegle.firebasestorage.app",
    messagingSenderId: "938106840865",
    appId: "1:938106840865:web:df6458e9193d296672c060",
    measurementId: "G-VDE8XVZPTY"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Allowed email domains for authentication
export const ALLOWED_EMAIL_DOMAINS = [
  '@adypu.edu.in',
  '@scmspune.ac.in'
];

// Function to validate email domain
export const isAllowedEmail = (email) => {
  return ALLOWED_EMAIL_DOMAINS.some(domain => 
    email.toLowerCase().endsWith(domain.toLowerCase())
  );
};

export default app;

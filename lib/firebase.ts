import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCWj5oJ09fhkbmiN1SyQGwr29raGQRDo20",
  authDomain: "podium-cc849.firebaseapp.com",
  projectId: "podium-cc849",
  storageBucket: "podium-cc849.firebasestorage.app",
  messagingSenderId: "1097917314564",
  appId: "1:1097917314564:web:985c4059af9b5cc78b2751",
  measurementId: "G-M74YLMV922"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
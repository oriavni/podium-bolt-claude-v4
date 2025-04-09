import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App
let firebaseApp;
try {
  // Verify environmental variables are loaded
  console.log("Firebase config from env:", {
    apiKeyPresent: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomainPresent: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectIdPresent: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucketPresent: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    apiKeyPrefix: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });

  if (getApps().length === 0) {
    firebaseApp = initializeApp(firebaseConfig);
    console.log("Firebase app initialized with name:", firebaseApp.name);
    console.log("Firebase configuration:", {
      projectId: firebaseApp.options.projectId,
      storageBucket: firebaseApp.options.storageBucket
    });
  } else {
    firebaseApp = getApps()[0];
    console.log("Using existing Firebase app:", firebaseApp.name);
  }
} catch (error) {
  console.error("Error initializing Firebase app:", error);
  console.error("Firebase config:", {
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey ? "present" : "missing",
  });
  throw error;
}

// Initialize Firebase Services
let firebaseAuth, firebaseDb, firebaseStorage;

try {
  firebaseAuth = getAuth(firebaseApp);
  console.log("Firebase Auth initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase Auth:", error);
  firebaseAuth = null;
}

try {
  firebaseDb = getFirestore(firebaseApp);
  console.log("Firebase Firestore initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firebase Firestore:", error);
  firebaseDb = null;
}

try {
  // Initialize Firebase Storage
  console.log("Initializing Firebase Storage with bucket from config:", firebaseApp.options.storageBucket);
  
  if (!firebaseApp.options.storageBucket) {
    console.warn("Firebase app does not have storageBucket configured in options");
    console.log("Falling back to storage bucket from env:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
  }
  
  // Always use explicit storage bucket from env
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseApp.options.storageBucket;
  console.log("Using storage bucket:", storageBucket);
  
  firebaseStorage = getStorage(firebaseApp);
  if (!firebaseStorage) {
    throw new Error("Firebase Storage returned undefined");
  }

  console.log("Firebase Storage initialized successfully with bucket:", 
    firebaseStorage.bucket || storageBucket);
} catch (error) {
  console.error("Failed to initialize Firebase Storage:", error);
  
  // Try re-initializing with explicit bucket name
  try {
    console.log("Attempting to re-initialize Storage with explicit bucket name");
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || firebaseApp.options.storageBucket;
    console.log("Using explicit bucket name:", storageBucket);
    
    if (!storageBucket) {
      throw new Error("No storage bucket available in config or environment");
    }
    
    firebaseStorage = getStorage(firebaseApp, storageBucket);
    console.log("Firebase Storage initialized with explicit bucket name:", storageBucket);
  } catch (secondError) {
    console.error("Second attempt to initialize Firebase Storage failed:", secondError);
    console.error("Error details:", {
      message: (secondError as Error).message,
      stack: (secondError as Error).stack,
      name: (secondError as Error).name
    });
    firebaseStorage = null;
  }
}

// Export Firebase services
export const app = firebaseApp;
export const auth = firebaseAuth;
export const db = firebaseDb;
export const storage = firebaseStorage;

// Log Firebase configuration
console.log("Firebase configuration:", {
  appName: firebaseApp.name,
  projectId: firebaseApp.options.projectId,
  storageBucket: firebaseApp.options.storageBucket,
  authInitialized: !!firebaseAuth,
  dbInitialized: !!firebaseDb,
  storageInitialized: !!firebaseStorage
});

export default app;
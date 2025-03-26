import * as admin from 'firebase-admin';

/**
 * Initialize the Firebase Admin SDK
 * This is used for server-side authentication and Firestore operations
 */
export function initializeAdminApp() {
  // Check if app is already initialized
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Initialize the app with service account
  try {
    // Get service account credentials from environment variables
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Export getAuth and getFirestore for convenience
export const getAdminAuth = () => {
  const app = initializeAdminApp();
  return admin.auth(app);
};

export const getAdminFirestore = () => {
  const app = initializeAdminApp();
  return admin.firestore(app);
};

export const getAdminStorage = () => {
  const app = initializeAdminApp();
  return admin.storage(app);
};
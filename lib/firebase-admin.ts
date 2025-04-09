import * as admin from 'firebase-admin';

/**
 * Initialize the Firebase Admin SDK
 * This is used for server-side authentication and Firestore operations
 */
export function initializeAdminApp() {
  // Check if app is already initialized
  if (admin.apps.length > 0) {
    console.log('Using existing Firebase Admin app instance');
    return admin.app();
  }

  console.log('Initializing Firebase Admin SDK...');
  
  // In development mode, we can use a mock admin SDK
  if (process.env.NODE_ENV !== 'production') {
    console.log('DEVELOPMENT MODE: Using mock Firebase Admin configuration');
    
    try {
      // For development, we can use a simplified admin setup
      // that doesn't require real service account credentials
      const app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'podium-dev',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
      });
      
      console.log('✅ Development Firebase Admin SDK initialized with:', {
        projectId: app.options.projectId,
        storageBucket: app.options.storageBucket
      });
      
      return app;
    } catch (devError) {
      console.error('❌ Error initializing Development Firebase Admin SDK:', devError);
      console.error('Error details:', {
        message: (devError as Error).message,
        stack: (devError as Error).stack
      });
      
      // In development, we can continue without admin SDK in some cases
      if (process.env.NEXT_PUBLIC_BYPASS_ADMIN_SDK === 'true') {
        console.warn('⚠️ Bypassing Admin SDK initialization failure in development');
        return null as any; // Type assertion to satisfy return type
      }
      
      throw devError;
    }
  }
  
  // For production, we need real credentials
  // Check required environment variables
  const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
  ];
  
  const missingVars = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
    console.error('❌ ' + errorMsg);
    throw new Error(errorMsg);
  }
  
  // Initialize the app with service account
  try {
    // Get service account credentials from environment variables
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    console.log('Admin SDK credentials loaded:', {
      projectId,
      clientEmail: clientEmail ? `${clientEmail.substring(0, 5)}...` : undefined,
      privateKeyAvailable: !!privateKey
    });
    
    const serviceAccount = { projectId, clientEmail, privateKey };
    
    // Get the storage bucket - use the client-side one if admin-specific is not set
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 
                          process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    
    // Initialize the app
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      storageBucket: storageBucket,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully with:', {
      projectId: app.options.projectId,
      storageBucket: app.options.storageBucket || storageBucket
    });
    
    return app;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    throw error;
  }
}

// Export getAuth and getFirestore for convenience
export const getAdminAuth = () => {
  try {
    const app = initializeAdminApp();
    const auth = admin.auth(app);
    return auth;
  } catch (error) {
    console.error('Failed to get admin auth instance:', error);
    throw new Error(`Admin Auth initialization failed: ${(error as Error).message}`);
  }
};

export const getAdminFirestore = () => {
  try {
    const app = initializeAdminApp();
    const firestore = admin.firestore(app);
    return firestore;
  } catch (error) {
    console.error('Failed to get admin firestore instance:', error);
    throw new Error(`Admin Firestore initialization failed: ${(error as Error).message}`);
  }
};

export const getAdminStorage = () => {
  try {
    const app = initializeAdminApp();
    const storage = admin.storage(app);
    
    // Check if storage bucket is configured
    if (!app.options.storageBucket) {
      console.warn('No storage bucket configured in Firebase Admin');
    }
    
    return storage;
  } catch (error) {
    console.error('Failed to get admin storage instance:', error);
    throw new Error(`Admin Storage initialization failed: ${(error as Error).message}`);
  }
};
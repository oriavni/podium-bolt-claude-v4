"use client";

import { useState, useEffect } from 'react';
import { 
  initializeApp, 
  getApps, 
  FirebaseApp 
} from 'firebase/app';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL,
  StorageReference
} from 'firebase/storage';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';

export default function DirectUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);
  const [authState, setAuthState] = useState<string>('checking');
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Function to add log entry
  const log = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };
  
  // Initialize Firebase
  useEffect(() => {
    try {
      log("Initializing Firebase client-side...");
      
      const firebaseConfig = {
        apiKey: "AIzaSyCWj5oJ09fhkbmiN1SyQGwr29raGQRDo20",
        authDomain: "podium-cc849.firebaseapp.com",
        projectId: "podium-cc849",
        storageBucket: "podium-cc849.appspot.com",
        messagingSenderId: "1097917314564",
        appId: "1:1097917314564:web:985c4059af9b5cc78b2751",
        measurementId: "G-M74YLMV922"
      };
      
      // Check if Firebase is already initialized
      let app: FirebaseApp;
      if (getApps().length === 0) {
        log("Creating new Firebase app instance");
        app = initializeApp(firebaseConfig);
      } else {
        log("Using existing Firebase app instance");
        app = getApps()[0];
      }
      
      setFirebaseApp(app);
      
      // Check auth state
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          log(`Authenticated as: ${user.uid} (${user.email || 'unknown email'})`);
          setAuthState('authenticated');
        } else {
          log("Not authenticated");
          setAuthState('unauthenticated');
        }
      });
      
      // Clean up auth listener
      return () => unsubscribe();
    } catch (error) {
      log(`Firebase initialization error: ${(error as Error).message}`);
      console.error("Firebase initialization error:", error);
      setError(`Failed to initialize Firebase: ${(error as Error).message}`);
    }
  }, []);
  
  // Handle email/password sign in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firebaseApp || !email || !password) {
      log("Missing Firebase initialization or credentials");
      return;
    }
    
    try {
      log(`Signing in with email: ${email}...`);
      setAuthState('signing-in');
      
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      log(`Successfully signed in as: ${userCredential.user.email}`);
      setAuthState('authenticated');
    } catch (error) {
      const errorMessage = (error as Error).message;
      log(`Sign-in failed: ${errorMessage}`);
      setError(`Sign-in failed: ${errorMessage}`);
      setAuthState('error');
    }
  };
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      log(`Selected file: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`);
    }
  };
  
  // Try uploading using a simple approach with minimal storage path
  const handleUpload = async () => {
    if (!firebaseApp || !file) {
      log("Firebase not initialized or no file selected");
      return;
    }
    
    if (authState !== 'authenticated') {
      log("Please sign in first");
      return;
    }
    
    try {
      setError(null);
      setUploading(true);
      log(`Starting upload of ${file.name}...`);
      
      // Initialize storage
      const storage = getStorage(firebaseApp);
      
      // Generate a unique path for the file - use public folder for maximum compatibility
      const timestamp = Date.now();
      const storagePath = `public/files/client-${timestamp}-${file.name}`;
      log(`Using storage path: ${storagePath}`);
      
      // Create a reference
      const fileRef: StorageReference = ref(storage, storagePath);
      
      // Upload file
      log("Uploading file to Firebase Storage...");
      const uploadResult = await uploadBytes(fileRef, file);
      log(`Upload successful! Path: ${uploadResult.ref.fullPath}`);
      
      // Get download URL
      log("Getting download URL...");
      const url = await getDownloadURL(fileRef);
      log(`Download URL received: ${url.substring(0, 30)}...`);
      
      setDownloadUrl(url);
      log("UPLOAD COMPLETED SUCCESSFULLY!");
    } catch (error) {
      const errorMessage = (error as Error).message;
      log(`Upload failed: ${errorMessage}`);
      setError(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };
  
  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Direct Firebase Upload Test</h1>
      <p className="text-sm text-gray-600 mb-6">
        This page uses Firebase Storage directly in the browser, bypassing the server completely.
      </p>
      
      {/* Firebase Status */}
      <div className="mb-6 p-4 rounded border bg-gray-50">
        <h2 className="font-semibold mb-2">Firebase Status</h2>
        <p>Firebase App: {firebaseApp ? 'Initialized ✅' : 'Not initialized ❌'}</p>
        <p>Authentication: {authState === 'authenticated' ? 'Signed In ✅' : authState}</p>
        
        {authState === 'unauthenticated' && (
          <form onSubmit={handleSignIn} className="mt-4 space-y-3">
            <div>
              <label className="block text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Sign In
            </button>
          </form>
        )}
        
        {authState === 'signing-in' && (
          <p className="mt-2 text-blue-600">Signing in...</p>
        )}
      </div>
      
      {/* Upload Form */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Upload File</h2>
        
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={authState !== 'authenticated' || uploading}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading || authState !== 'authenticated'}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Directly to Firebase'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Result Display */}
      {downloadUrl && (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded">
          <h2 className="font-semibold mb-2">Upload Success!</h2>
          <p className="mb-2">Your file has been uploaded to Firebase Storage.</p>
          
          <div className="mb-2">
            <p className="font-semibold">Download URL:</p>
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline break-all"
            >
              {downloadUrl}
            </a>
          </div>
          
          {downloadUrl.includes('.mp3') || downloadUrl.includes('.wav') || downloadUrl.includes('.m4a') ? (
            <div className="mt-4">
              <p className="font-semibold mb-2">Audio Preview:</p>
              <audio controls src={downloadUrl} className="w-full" />
            </div>
          ) : downloadUrl.includes('.jpg') || downloadUrl.includes('.png') || downloadUrl.includes('.gif') ? (
            <div className="mt-4">
              <p className="font-semibold mb-2">Image Preview:</p>
              <img src={downloadUrl} alt="Uploaded file" className="max-w-full h-auto max-h-64" />
            </div>
          ) : null}
        </div>
      )}
      
      {/* Log section */}
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-3 rounded-md h-80 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <p className="opacity-50">No logs yet...</p>
          ) : (
            logs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>
      
      {/* Firebase Rules Help */}
      <div className="mb-6 p-4 rounded border bg-gray-50">
        <h2 className="font-semibold mb-2">Firebase Storage Rules Check</h2>
        <p className="mb-2">If uploads are failing, check your Firebase Storage rules in the Firebase Console.</p>
        <p className="mb-2">Ensure your rules allow writes to the 'public/files' path.</p>
        <p className="mb-2">Example rule for testing:</p>
        <pre className="bg-gray-100 p-2 rounded text-sm mb-2">
          {`service firebase.storage {
  match /b/{bucket}/o {
    match /public/files/{filename} {
      allow read, write: if request.auth != null;
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
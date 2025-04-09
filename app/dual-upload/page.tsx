"use client";

import { useState, useEffect } from 'react';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { writeFile } from 'fs/promises';

export default function DualUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [firebaseUrl, setFirebaseUrl] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [firebaseApp, setFirebaseApp] = useState<FirebaseApp | null>(null);

  // Function to add log entry
  const log = (message: string) => {
    setLogs(prev => [`${new Date().toLocaleTimeString()}: ${message}`, ...prev]);
  };

  // Initialize Firebase on component mount
  useEffect(() => {
    try {
      log("Initializing Firebase...");
      
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
      log("Firebase initialized successfully");
    } catch (error) {
      log(`Firebase initialization error: ${(error as Error).message}`);
      console.error("Firebase initialization error:", error);
    }
  }, []);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      log(`Selected file: ${selectedFile.name} (${formatFileSize(selectedFile.size)})`);
    }
  };

  // Upload file to both Firebase and local storage
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setUploading(true);
    setError(null);
    setFirebaseUrl(null);
    setLocalUrl(null);
    log(`Starting upload of ${file.name}...`);

    // Try both uploads in parallel with timeouts
    const firebasePromise = uploadToFirebaseWithTimeout();
    const localPromise = uploadToLocalStorage();

    // Wait for both uploads to complete
    const results = await Promise.allSettled([firebasePromise, localPromise]);
    
    // Handle results
    if (results[0].status === 'fulfilled') {
      log('Firebase upload completed successfully');
    } else {
      log(`Firebase upload failed: ${results[0].reason}`);
    }
    
    if (results[1].status === 'fulfilled') {
      log('Local storage upload completed successfully');
    } else {
      log(`Local storage upload failed: ${results[1].reason}`);
    }

    setUploading(false);
  };
  
  // Upload to Firebase with a timeout
  const uploadToFirebaseWithTimeout = async () => {
    const TIMEOUT = 30000; // 30 seconds timeout
    
    try {
      // Create a promise that rejects after the timeout
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Firebase upload timed out after 30 seconds'));
        }, TIMEOUT);
      });
      
      // Race the actual upload against the timeout
      log('FIREBASE: Starting upload with 30 second timeout...');
      return await Promise.race([uploadToFirebase(), timeoutPromise]);
    } catch (error) {
      log(`FIREBASE: Error or timeout: ${(error as Error).message}`);
      throw error;
    }
  };

  // Upload to Firebase Storage
  const uploadToFirebase = async () => {
    if (!firebaseApp || !file) {
      throw new Error("Firebase not initialized or no file selected");
    }

    log("FIREBASE: Starting upload...");

    try {
      // Initialize storage with explicit bucket
      const storage = getStorage(
        firebaseApp, 
        "podium-cc849.appspot.com"
      );
      
      // Generate a unique path for the file - ensure it's shorter and URL safe
      const timestamp = Date.now();
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_').substring(0, 50);
      const storagePath = `public/files/dual-${timestamp}-${safeFileName}`;
      log(`FIREBASE: Using storage path: ${storagePath}`);
      
      // Create a reference
      const fileRef = ref(storage, storagePath);
      
      // Log reference details
      log(`FIREBASE: Reference created - fullPath: ${fileRef.fullPath}`);
      
      // For large files, show progress updates
      if (file.size > 1024 * 1024) { // > 1MB
        log(`FIREBASE: Large file detected (${formatFileSize(file.size)}), upload may take time...`);
      }
      
      // Upload file
      log("FIREBASE: Uploading to Firebase Storage...");
      
      try {
        // Create a small test file first to validate connectivity
        if (file.size > 1024 * 1024) { // Only for files > 1MB
          log("FIREBASE: Running quick connectivity test first...");
          const testData = new Uint8Array([84, 101, 115, 116]); // "Test"
          const testRef = ref(storage, `public/files/test-${timestamp}.txt`);
          await uploadBytes(testRef, testData);
          log("FIREBASE: Connectivity test passed, proceeding with main upload");
        }
        
        // Try the actual upload
        const uploadResult = await uploadBytes(fileRef, file);
        log(`FIREBASE: Upload complete: ${uploadResult.ref.fullPath}`);
        
        // Get download URL
        const url = await getDownloadURL(fileRef);
        log(`FIREBASE: Got download URL: ${url.substring(0, 40)}...`);
        
        setFirebaseUrl(url);
        log("FIREBASE: UPLOAD SUCCESSFUL ✓");
        
        return url;
      } catch (uploadError) {
        log(`FIREBASE: Direct upload failed: ${(uploadError as Error).message}`);
        
        // If file is large, suggest breaking it into smaller chunks
        if (file.size > 5 * 1024 * 1024) { // > 5MB
          log("FIREBASE: Consider breaking large files into smaller parts for better reliability");
        }
        
        throw uploadError;
      }
    } catch (error) {
      log(`FIREBASE: Upload failed: ${(error as Error).message}`);
      
      // Provide more details about the error
      console.error("Firebase Storage Error:", error);
      
      // Specific user-friendly message
      let userMessage = `Firebase upload failed: ${(error as Error).message}`;
      
      // Check for common error types
      const errorMessage = (error as Error).message.toLowerCase();
      if (errorMessage.includes("cors")) {
        userMessage = "Firebase upload failed: CORS policy blocking access to Firebase Storage";
      } else if (errorMessage.includes("timeout") || errorMessage.includes("network")) {
        userMessage = "Firebase upload failed: Network connectivity or timeout issue";
      } else if (errorMessage.includes("unauthorized") || errorMessage.includes("permission")) {
        userMessage = "Firebase upload failed: Unauthorized access - check Firebase Storage rules";
      }
      
      setError(userMessage);
      throw new Error(userMessage);
    }
  };

  // Upload to local storage via API
  const uploadToLocalStorage = async () => {
    if (!file) return;

    log("LOCAL: Starting upload...");

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', 'files');
      
      // Send to special local storage endpoint
      log("LOCAL: Sending to local storage API...");
      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      log(`LOCAL: Upload complete: ${data.file.path}`);
      
      // Update UI with local URL
      setLocalUrl(data.file.url);
      log("LOCAL: UPLOAD SUCCESSFUL ✓");
      
      return data.file.url;
    } catch (error) {
      log(`LOCAL: Upload failed: ${(error as Error).message}`);
      throw error;
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
      <h1 className="text-2xl font-bold mb-4">Dual Upload Test</h1>
      <p className="text-sm text-gray-600 mb-6">
        This page attempts to upload files to both Firebase Storage and local storage simultaneously.
      </p>
      
      {/* Upload Form */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Upload File</h2>
        
        <div className="mb-4">
          <input
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            className="border p-2 w-full rounded"
          />
        </div>
        
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload to Both Storages'}
        </button>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Results Display */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Firebase Result */}
        <div className={`p-4 border rounded ${firebaseUrl ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <h2 className="font-semibold mb-2">Firebase Storage</h2>
          
          {firebaseUrl ? (
            <>
              <p className="text-green-600 font-medium mb-2">✓ Upload Successful</p>
              <p className="text-sm font-medium mb-1">Download URL:</p>
              <a 
                href={firebaseUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {firebaseUrl}
              </a>
            </>
          ) : (
            <p className="text-gray-500 italic">No upload completed</p>
          )}
        </div>
        
        {/* Local Storage Result */}
        <div className={`p-4 border rounded ${localUrl ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
          <h2 className="font-semibold mb-2">Local Storage</h2>
          
          {localUrl ? (
            <>
              <p className="text-green-600 font-medium mb-2">✓ Upload Successful</p>
              <p className="text-sm font-medium mb-1">File URL:</p>
              <a 
                href={localUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {localUrl}
              </a>
            </>
          ) : (
            <p className="text-gray-500 italic">No upload completed</p>
          )}
        </div>
      </div>
      
      {/* Audio/Image Preview */}
      {(firebaseUrl || localUrl) && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold mb-2">File Preview</h2>
          
          {/* Use local URL as fallback if Firebase fails */}
          {file && file.type.startsWith('audio/') && (
            <div className="mt-2">
              <p className="font-medium text-sm mb-1">Audio Preview:</p>
              <audio 
                controls 
                src={firebaseUrl || localUrl || ''} 
                className="w-full"
              />
            </div>
          )}
          
          {file && file.type.startsWith('image/') && (
            <div className="mt-2">
              <p className="font-medium text-sm mb-1">Image Preview:</p>
              <img 
                src={firebaseUrl || localUrl || ''} 
                alt="Uploaded file"
                className="max-w-full h-auto rounded max-h-64"
              />
            </div>
          )}
        </div>
      )}
      
      {/* Log Output */}
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
      
      {/* Firebase Configuration */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="font-semibold mb-2">Firebase Configuration</h2>
        <p className="text-sm mb-2">
          Make sure your Firebase Storage rules allow public write access:
        </p>
        <pre className="bg-gray-200 p-2 rounded text-xs overflow-auto">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
}
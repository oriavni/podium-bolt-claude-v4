"use client";

import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState<string>('Ready');
  const [error, setError] = useState<string | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [configInfo, setConfigInfo] = useState<any>(null);

  // Function to add logs
  const log = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 23)}: ${message}`]);
  };

  // Check Firebase config on mount
  useEffect(() => {
    if (app) {
      const config = {
        initialized: !!app,
        name: app.name,
        options: {
          apiKey: app.options.apiKey ? "present" : "missing",
          projectId: app.options.projectId,
          storageBucket: app.options.storageBucket,
          authDomain: app.options.authDomain
        }
      };
      setConfigInfo(config);
      log(`Firebase initialized with project: ${app.options.projectId}`);
    } else {
      log("Firebase app not initialized");
      setError("Firebase app not initialized");
    }
  }, []);

  // Test direct upload to Firebase Storage
  const handleDirectUpload = async () => {
    try {
      setStatus('Testing direct upload...');
      setError(null);
      setUploadUrl(null);
      log("Starting direct Firebase Storage upload test");

      // Create a small test file
      const testData = new Uint8Array([84, 101, 115, 116, 32, 102, 105, 108, 101]); // "Test file"
      const file = new File([testData], 'test.txt', { type: 'text/plain' });
      log(`Created test file: ${file.name}, size: ${file.size} bytes`);

      // Initialize Storage
      const storage = getStorage(app);
      log("Got Firebase Storage instance");

      // Create reference with a timestamp to avoid cache issues
      const timestamp = Date.now();
      const path = `public/test/direct-${timestamp}.txt`;
      const fileRef = ref(storage, path);
      log(`Created storage reference: ${path}`);

      // Upload the file with timeout and error handling
      log("Starting upload...");
      
      // Add a timeout to detect if the upload is hanging
      const uploadPromise = uploadBytes(fileRef, file);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Upload timeout - operation took too long"));
        }, 15000); // 15 second timeout
      });
      
      try {
        // Race the upload against the timeout
        log("Waiting for upload (timeout: 15s)...");
        const uploadResult = await Promise.race([uploadPromise, timeoutPromise]) as any;
        log(`Upload successful to path: ${uploadResult.ref.fullPath}`);
        return uploadResult;
      } catch (uploadError) {
        log(`Upload error: ${(uploadError as Error).message}`);
        if ((uploadError as Error).message.includes('timeout')) {
          log("Upload seems to be hanging. This could be due to network issues or CORS configuration.");
          log("Trying alternative upload method...");
          
          // Try an alternative method - sometimes creating a new storage instance helps
          log("Re-initializing storage with explicit bucket...");
          const altStorage = getStorage(app, app.options.storageBucket);
          const altRef = ref(altStorage, path);
          
          log("Starting upload with alternative method...");
          const altUploadResult = await uploadBytes(altRef, file);
          log(`Alternative upload successful to path: ${altUploadResult.ref.fullPath}`);
          return altUploadResult;
        } else {
          // Re-throw the original error if it's not a timeout
          throw uploadError;
        }
      }

      // Get download URL
      const uploadResult = await uploadPromise;
      const url = await getDownloadURL(uploadResult.ref);
      log(`Got download URL: ${url.substring(0, 50)}...`);
      setUploadUrl(url);
      setStatus('Direct upload successful!');
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
      setStatus('Direct upload failed');
      console.error("Direct upload error:", err);
    }
  };

  // Test API endpoint
  const handleApiTest = async () => {
    try {
      setStatus('Testing API endpoint...');
      setError(null);
      setUploadUrl(null);
      log("Starting API test upload");

      const response = await fetch('/api/upload/test');
      const data = await response.json();
      
      log(`API response: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data.success) {
        setUploadUrl(data.file.url);
        setStatus('API test successful!');
        log(`API test succeeded, file uploaded to: ${data.file.path}`);
      } else {
        setError(data.error);
        setStatus('API test failed');
        log(`API test failed: ${data.error}`);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
      setStatus('API test failed');
      console.error("API test error:", err);
    }
  };

  // Test simple upload endpoint
  const handleSimpleUploadTest = async () => {
    try {
      setStatus('Testing simple upload endpoint...');
      setError(null);
      setUploadUrl(null);
      log("Starting simple upload test");

      // Create a test form with a file
      const testData = new Uint8Array([84, 101, 115, 116, 32, 102, 105, 108, 101]); // "Test file"
      const file = new File([testData], 'simple-test.txt', { type: 'text/plain' });
      log(`Created test file: ${file.name}, size: ${file.size} bytes`);

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/simple', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      log(`Simple upload response: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data.success) {
        setUploadUrl(data.file.url);
        setStatus('Simple upload successful!');
        log(`Simple upload succeeded, file uploaded to: ${data.file.path}`);
      } else {
        setError(data.error);
        setStatus('Simple upload failed');
        log(`Simple upload failed: ${data.error}`);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
      setStatus('Simple upload failed');
      console.error("Simple upload error:", err);
    }
  };
  
  // Test local storage (no Firebase)
  const handleLocalStorageTest = async () => {
    try {
      setStatus('Testing local storage (no Firebase)...');
      setError(null);
      setUploadUrl(null);
      log("Starting local storage test");

      // Create a test form with a file
      const testData = new Uint8Array([84, 101, 115, 116, 32, 102, 105, 108, 101]); // "Test file"
      const file = new File([testData], 'local-test.txt', { type: 'text/plain' });
      log(`Created test file: ${file.name}, size: ${file.size} bytes`);

      const formData = new FormData();
      formData.append('file', file);
      
      log("Sending file to local storage endpoint...");
      const response = await fetch('/api/upload/local', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      log(`Local storage response: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data.success) {
        setUploadUrl(data.file.url);
        setStatus('Local storage upload successful!');
        log(`File saved locally to: ${data.file.path}`);
        log(`Access at: ${window.location.origin}${data.file.url}`);
      } else {
        setError(data.error);
        setStatus('Local storage upload failed');
        log(`Local storage upload failed: ${data.error}`);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
      setStatus('Local storage upload failed');
      console.error("Local storage error:", err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Firebase Storage Test Page</h1>
      
      {/* Firebase Config Information */}
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Firebase Configuration</h2>
        {configInfo ? (
          <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
            {JSON.stringify(configInfo, null, 2)}
          </pre>
        ) : (
          <p>Loading configuration...</p>
        )}
      </div>
      
      {/* Test Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          onClick={handleDirectUpload}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Direct Upload
        </button>
        
        <button 
          onClick={handleApiTest}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test API Endpoint
        </button>
        
        <button 
          onClick={handleSimpleUploadTest}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Simple Upload
        </button>
        
        <button 
          onClick={handleLocalStorageTest}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Local Storage (No Firebase)
        </button>
      </div>
      
      {/* Status and Errors */}
      <div className="mb-6">
        <div className="text-lg mb-2">
          Status: <span className={status.includes('successful') ? 'text-green-600 font-bold' : 'font-bold'}>{status}</span>
        </div>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 mb-4">
            Error: {error}
          </div>
        )}
        
        {uploadUrl && (
          <div className="p-3 bg-green-100 border border-green-300 rounded mb-4">
            <div className="mb-2 font-semibold">File uploaded successfully!</div>
            <div className="text-sm break-all">
              <a href={uploadUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {uploadUrl}
              </a>
            </div>
          </div>
        )}
      </div>
      
      {/* Logs */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="opacity-50">No logs yet. Run a test to see logs.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
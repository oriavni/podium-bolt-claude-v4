"use client";

import { useState, useRef } from 'react';

export default function UploadTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add a log message with timestamp
  const log = (message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs(prev => [...prev, `${timestamp} ${message}`]);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      log(`Selected file: ${selectedFile.name} (${selectedFile.size} bytes, ${selectedFile.type})`);
    }
  };

  // Upload file to local API
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setResponse(null);
      log(`Starting upload of ${file.name}...`);

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // For audio files, add the fileType parameter
      if (file.type.startsWith('audio/')) {
        formData.append('fileType', 'audio');
        log('Added fileType: audio to form data');
      } else if (file.type.startsWith('image/')) {
        formData.append('fileType', 'image');
        log('Added fileType: image to form data');
      }

      // Send the file to our API
      log('Sending request to /api/upload...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // Get the response text first to help with debugging
      const responseText = await res.text();
      log(`Response received (${responseText.length} chars)`);
      
      if (!res.ok) {
        log(`HTTP Error ${res.status}: ${responseText.substring(0, 100)}...`);
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      // Parse the JSON response
      let data;
      try {
        data = JSON.parse(responseText);
        log(`Upload successful! Response parsed.`);
      } catch (parseError) {
        log(`Error parsing response as JSON: ${responseText.substring(0, 100)}...`);
        throw new Error(`Failed to parse response: ${(parseError as Error).message}`);
      }
      setResponse(data);
      
      if (data.url) {
        log(`File URL: ${data.url}`);
      }
      
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // Test with a small test file
  const handleTestUpload = async () => {
    try {
      setUploading(true);
      setError(null);
      setResponse(null);
      log('Creating test text file...');
      
      // Create a small text file
      const testContent = 'This is a test file created at ' + new Date().toISOString();
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      log(`Created test file: ${testFile.name} (${testFile.size} bytes)`);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('fileType', 'files'); // Generic file type
      
      // Send to API
      log('Sending test file to /api/upload...');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error(`Test upload failed with status: ${res.status}`);
      }
      
      const data = await res.json();
      log(`Test upload successful! Response received.`);
      setResponse(data);
      
      if (data.url) {
        log(`Test file URL: ${data.url}`);
      }
      
    } catch (err) {
      const errorMessage = (err as Error).message;
      log(`ERROR: ${errorMessage}`);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Upload Test Page</h1>
      
      <div className="mb-6 p-4 border rounded-md bg-gray-50">
        <p className="mb-2 text-sm">This page tests file uploads directly to the Next.js API route, which should store files locally.</p>
        <div className="flex gap-2 text-sm">
          <span className="font-semibold">Environment:</span> 
          <span>{process.env.NODE_ENV || 'unknown'}</span>
        </div>
        <div className="flex gap-2 text-sm">
          <span className="font-semibold">Local Storage:</span> 
          <span>{process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true' ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4 mb-4">
          <button 
            onClick={handleTestUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Test File'}
          </button>
          
          <div className="text-sm">
            <p>Creates and uploads a simple text file to test basic functionality</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Select File:</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="block w-full text-sm border rounded p-2"
            />
          </div>
          
          {file && (
            <div className="text-sm bg-gray-100 p-2 rounded">
              <div><span className="font-semibold">Name:</span> {file.name}</div>
              <div><span className="font-semibold">Size:</span> {file.size} bytes</div>
              <div><span className="font-semibold">Type:</span> {file.type}</div>
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Selected File'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-300 rounded text-red-800">
          <div className="font-semibold mb-1">Error:</div>
          <div>{error}</div>
        </div>
      )}
      
      {response && (
        <div className="mb-6 p-3 bg-green-100 border border-green-300 rounded">
          <div className="font-semibold mb-1">Upload Result:</div>
          {response.url && (
            <div className="mb-2">
              <div className="font-semibold text-sm">File URL:</div>
              <a 
                href={response.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {response.url}
              </a>
            </div>
          )}
          <details>
            <summary className="cursor-pointer text-sm">View full response</summary>
            <pre className="text-xs bg-gray-50 p-2 mt-2 rounded overflow-auto max-h-60">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-3 rounded font-mono text-sm h-60 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="opacity-50">No logs yet. Upload a file to see logs.</div>
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
"use client";

import { useState } from 'react';
import { useAuthContext } from '@/components/auth/auth-provider';
import { useUserRole } from './use-user-role';

export interface FileUploadResult {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: string;
  userId?: string;
  songId?: string;
}

export interface UploadOptions {
  fileType?: 'audio' | 'image';
  songId?: string;
  onProgress?: (progress: number) => void;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();
  const { role } = useUserRole();
  
  const uploadFile = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<FileUploadResult | null> => {
    console.log("🚀 Starting file upload:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      lastModified: new Date(file.lastModified).toISOString(),
      options
    });
    
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Validate the file object more thoroughly
      if (!file) {
        console.error("❌ File is null or undefined");
        throw new Error("No file provided");
      }
      
      if (!(file instanceof File)) {
        console.error("❌ Provided object is not a File instance:", typeof file, file.constructor?.name);
        throw new Error("Invalid file object provided - not a File instance");
      }
      
      if (file.size === 0) {
        console.error("❌ File has zero bytes");
        throw new Error("File is empty (0 bytes)");
      }
      
      // Create FormData
      console.log("📦 Creating FormData for upload");
      const formData = new FormData();
      
      console.log("📎 Appending file to FormData:", file.name);
      formData.append('file', file);
      
      // Log FormData contents for debugging
      console.log("📋 FormData entries:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`- ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
        } else {
          console.log(`- ${key}: ${value}`);
        }
      }
      
      if (options.fileType) {
        console.log("📎 Appending fileType:", options.fileType);
        formData.append('fileType', options.fileType);
      }
      
      if (options.songId) {
        console.log("📎 Appending songId:", options.songId);
        formData.append('songId', options.songId);
      }
      
      // Add user ID if available
      if (user?.uid) {
        console.log("Appending userId:", user.uid);
        formData.append('userId', user.uid);
      }
      
      // Add user role if available
      if (role) {
        console.log("Appending userRole:", role);
        formData.append('userRole', role);
      }
      
      // Upload using XMLHttpRequest to track progress
      console.log("Setting up XHR upload request");
      return await new Promise<FileUploadResult | null>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            console.log(`Upload progress: ${progressPercent}%`);
            setProgress(progressPercent);
            
            if (options.onProgress) {
              options.onProgress(progressPercent);
            }
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          console.log(`XHR load complete, status: ${xhr.status}`);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log("Upload successful, parsing response");
            try {
              const response = JSON.parse(xhr.responseText);
              console.log("Upload response:", response);
              resolve(response);
            } catch (err) {
              console.error("Error parsing response:", err);
              setError("Failed to parse server response");
              reject(new Error("Failed to parse server response"));
            }
          } else {
            console.error(`Upload failed with status ${xhr.status}`);
            let errorMessage = 'Upload failed';
            
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error || errorMessage;
              console.error("Server error:", errorMessage);
            } catch (err) {
              console.error("Failed to parse error response:", err);
            }
            
            setError(errorMessage);
            reject(new Error(errorMessage));
          }
          
          setIsUploading(false);
        });
        
        // Handle error
        xhr.addEventListener('error', (event) => {
          console.error("❌ XHR ERROR EVENT - Upload failed:", event);
          let errorMessage = 'Network error occurred during upload';
          
          // Add detailed error info
          console.error("❌ Upload Error Details:");
          console.error("- XHR status:", xhr.status);
          console.error("- XHR response:", xhr.responseText);
          console.error("- XHR ready state:", xhr.readyState);
          console.error("- XHR headers:", xhr.getAllResponseHeaders());
          console.error("- Browser online status:", navigator.onLine);
          
          // Check for CORS issues
          if (xhr.status === 0) {
            console.error("- Possible CORS issue or network error (status 0)");
            errorMessage = 'Network error or CORS issue - check console for details';
          }
          
          // Add file details to error for context
          console.error("- File details:", {
            name: file.name,
            type: file.type,
            size: file.size,
            sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + " MB"
          });
          
          setError(errorMessage);
          setIsUploading(false);
          reject(new Error(errorMessage));
        });
        
        // Handle abort
        xhr.addEventListener('abort', () => {
          console.warn("XHR upload aborted");
          const errorMessage = 'Upload was aborted';
          setError(errorMessage);
          setIsUploading(false);
          reject(new Error(errorMessage));
        });
        
        console.log("Opening XHR connection to /api/upload");
        // Open connection and send the request
        xhr.open('POST', '/api/upload', true);
        
        console.log("Sending form data to server");
        xhr.send(formData);
      });
    } catch (err) {
      setIsUploading(false);
      const errorMessage = (err as Error).message || 'An unknown error occurred';
      setError(errorMessage);
      console.error('Upload error:', err);
      return null;
    }
  };
  
  // Function to get user-specific files
  const getUserFiles = async (fileType?: 'audio' | 'image'): Promise<FileUploadResult[]> => {
    if (!user?.uid) {
      setError('User is not authenticated');
      return [];
    }
    
    try {
      // Construct query params
      const params = new URLSearchParams();
      params.append('userId', user.uid);
      if (fileType) {
        params.append('fileType', fileType);
      }
      
      // Fetch files from API
      const response = await fetch(`/api/files?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user files');
      }
      
      return await response.json();
    } catch (err) {
      const errorMessage = (err as Error).message || 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching user files:', err);
      return [];
    }
  };
  
  return {
    uploadFile,
    getUserFiles,
    isUploading,
    progress,
    error,
    // Additional metadata
    isAuthenticated: !!user,
    userId: user?.uid,
    userRole: role
  };
}
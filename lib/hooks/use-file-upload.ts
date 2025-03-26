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
    setIsUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.fileType) {
        formData.append('fileType', options.fileType);
      }
      
      if (options.songId) {
        formData.append('songId', options.songId);
      }
      
      // Add user ID if available
      if (user?.uid) {
        formData.append('userId', user.uid);
      }
      
      // Add user role if available
      if (role) {
        formData.append('userRole', role);
      }
      
      // Upload using XMLHttpRequest to track progress
      return await new Promise<FileUploadResult | null>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progressPercent = Math.round((event.loaded / event.total) * 100);
            setProgress(progressPercent);
            
            if (options.onProgress) {
              options.onProgress(progressPercent);
            }
          }
        });
        
        // Handle completion
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            let errorMessage = 'Upload failed';
            
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage = errorResponse.error || errorMessage;
            } catch (_) {
              // Ignore parsing error
            }
            
            setError(errorMessage);
            reject(new Error(errorMessage));
          }
          
          setIsUploading(false);
        });
        
        // Handle error
        xhr.addEventListener('error', () => {
          const errorMessage = 'Network error occurred during upload';
          setError(errorMessage);
          setIsUploading(false);
          reject(new Error(errorMessage));
        });
        
        // Handle abort
        xhr.addEventListener('abort', () => {
          const errorMessage = 'Upload was aborted';
          setError(errorMessage);
          setIsUploading(false);
          reject(new Error(errorMessage));
        });
        
        // Open connection and send the request
        xhr.open('POST', '/api/upload', true);
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
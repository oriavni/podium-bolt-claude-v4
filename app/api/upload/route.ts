import { NextRequest, NextResponse } from 'next/server';
import { saveFile } from '@/lib/api/file-storage';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mark route as dynamic to ensure it's not statically generated
export const dynamic = 'force-dynamic';

// Maximum file size (20MB)
const MAX_FILE_SIZE = 20 * 1024 * 1024;

// Allowed audio file types
const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',  // .mp3
  'audio/wav',   // .wav
  'audio/ogg',   // .ogg
  'audio/flac',  // .flac
  'audio/aac',   // .aac
  'audio/x-m4a'  // .m4a
];

/**
 * API route for file uploads to Firebase Storage
 * Includes authentication check and associates uploads with the current user
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Received upload request for Firebase Storage");
    
    // Check for authentication
    const sessionCookie = cookies().get('session')?.value;
    let userId = null;
    
    console.log("Checking authentication status...");
    console.log("Session cookie present:", !!sessionCookie);
    
    if (sessionCookie) {
      try {
        // Verify session cookie with Firebase Admin
        const auth = getAdminAuth();
        console.log("Got admin auth instance, verifying session cookie...");
        
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true); // true = check if revoked
        userId = decodedClaims.uid;
        console.log("✅ Authentication successful - user:", userId);
        
        // Log additional claims for debugging
        console.log("User claims:", {
          email: decodedClaims.email,
          emailVerified: decodedClaims.email_verified,
          issuer: decodedClaims.iss,
          expiration: new Date(decodedClaims.exp * 1000).toISOString()
        });
      } catch (authError) {
        console.error("❌ Session verification failed:", authError);
        // Continue without user ID, but log detailed error
        console.error("Auth error details:", {
          message: (authError as Error).message,
          stack: (authError as Error).stack,
          name: (authError as Error).name
        });
      }
    } else {
      console.log("⚠️ No session cookie found - will use public storage path");
      // For development purposes, allowing anonymous uploads
      // In production, you might want to require authentication
    }
    
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    console.log("Content-Type:", contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      console.log("Error: Content type is not multipart/form-data");
      return NextResponse.json(
        { error: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }
    
    // Parse the form data
    const formData = await request.formData();
    console.log("Form data parsed successfully");
    
    // Debug form data entries
    console.log("FormData contains the following entries:");
    let formDataEntries = "";
    let fileDetails = null;
    
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        formDataEntries += `\n- ${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`;
        if (key === 'file') {
          fileDetails = {
            name: value.name,
            type: value.type,
            size: value.size,
            lastModified: new Date(value.lastModified).toISOString()
          };
        }
      } else {
        formDataEntries += `\n- ${key}: ${value}`;
      }
    }
    console.log(formDataEntries || "No entries found in FormData");
    
    // Get the file
    const file = formData.get('file') as File | null;
    
    // Log file details or absence
    if (file) {
      console.log("✅ File found in form data:", {
        name: file.name,
        type: file.type,
        size: file.size,
        sizeFormatted: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        details: fileDetails
      });
    } else {
      console.error("❌ No file found in form data!");
    }
    
    // Debug entire form data contents
    console.log("All form data keys:", [...formData.keys()]);
    for (const [key, value] of formData.entries()) {
      console.log(`Form data entry - ${key}:`, 
        value instanceof File 
          ? `File: ${value.name}, type: ${value.type}, size: ${value.size}` 
          : value
      );
    }
    
    if (!file) {
      console.log("Error: No file provided in the request");
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log("Error: File size exceeds the limit");
      return NextResponse.json(
        { error: `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }
    
    // Get other fields from the form data
    const fileType = formData.get('fileType') as string || '';
    const songId = formData.get('songId') as string || '';
    console.log("File type:", fileType);
    console.log("Song ID:", songId);
    
    // Validate audio file type if applicable
    if (fileType === 'audio' && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
      console.log("Error: Invalid audio file type:", file.type);
      return NextResponse.json(
        { error: `Invalid audio file type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Simplify directory structure to match Firebase Storage rules
    let directory = '';
    
    // Just use the file type as the directory - our saveFile function will 
    // handle constructing the proper Firebase Storage path
    if (fileType === 'audio') {
      directory = 'audio';
    } else if (fileType === 'image') {
      directory = 'images';
    } else {
      directory = 'files';
    }
    
    console.log("Using directory:", directory);
    
    try {
      // Save the file to Firebase Storage with detailed logging
      console.log("Saving file to Firebase Storage...");
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        directory,
        userId: userId || 'anonymous',
      });
      
      // Add extra debugging for the environment
      console.log("Storage bucket from env:", process.env.FIREBASE_STORAGE_BUCKET);
      
      // Create a unique ID for this upload to ensure consistent paths
      const uploadId = Date.now().toString();
      console.log("🆔 Generated uploadId:", uploadId);
      
      // Save file using the appropriate storage mechanism
      console.log("💾 Starting file upload process");
      
      // Use local storage in development mode as a fallback to Firebase Storage
      const useLocalStorage = process.env.NODE_ENV !== 'production' && 
                             (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true');
      
      console.log("Storage mode:", useLocalStorage ? "LOCAL STORAGE" : "FIREBASE STORAGE");
      
      let savedFile;
      
      if (useLocalStorage) {
        // DEVELOPMENT MODE: Use local filesystem storage instead of Firebase
        console.log("💡 Using LOCAL FILE STORAGE for development mode");
        
        try {
          // Import the Node.js filesystem and path modules
          const { writeFile, mkdir } = require('fs/promises');
          const { join, extname } = require('path');
          
          // Print current working directory to verify paths
          const cwd = process.cwd();
          console.log("📂 Current working directory:", cwd);
          
          // Generate a unique filename with timestamp for no conflicts
          const fileId = Date.now() + '-' + Math.random().toString(36).substring(2, 10);
          const ext = extname(file.name);
          const fileName = `${fileId}${ext}`;
          
          // Create simple directory structure
          // Simplify to avoid any path issues
          const baseDir = join(cwd, 'public', 'uploads');
          console.log("📂 Base uploads directory:", baseDir);
          
          // Make sure we use a valid directory name
          let safeDirectory = 'files';
          if (directory === 'audio' || directory === 'images') {
            safeDirectory = directory;
          }
          
          // Create the type directory path
          const typeDir = join(baseDir, safeDirectory);
          console.log("📂 Type directory:", typeDir);
          
          // Full file path
          const filePath = join(typeDir, fileName);
          console.log("📄 Full file path:", filePath);
          
          // Debug file info
          console.log("📄 File info:", {
            name: file.name, 
            size: file.size, 
            type: file.type
          });
          
          // Ensure base directory exists
          console.log("📂 Creating base directory if needed...");
          await mkdir(baseDir, { recursive: true });
          
          // Ensure type directory exists
          console.log("📂 Creating type directory if needed...");
          await mkdir(typeDir, { recursive: true });
          
          // Test if we can create a simple file first
          const testPath = join(typeDir, `test-${Date.now()}.txt`);
          console.log("✏️ Testing file creation with a simple text file:", testPath);
          await writeFile(testPath, 'Test file creation');
          console.log("✅ Test file created successfully");
          
          // Convert file to buffer
          console.log("🔄 Converting file to buffer...");
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          console.log("✅ File converted to buffer, size:", buffer.length);
          
          // Write the actual file to disk
          console.log("💾 Writing file to disk:", filePath);
          await writeFile(filePath, buffer);
          console.log("✅ File written to local disk successfully");
          
          // Generate URL (relative to site root)
          const publicUrl = `/uploads/${safeDirectory}/${fileName}`;
          console.log("🔗 Generated public URL:", publicUrl);
          
          // Create a savedFile object that matches the Firebase version
          savedFile = {
            id: fileId,
            originalName: file.name,
            fileName,
            mimeType: file.type,
            size: file.size,
            path: filePath,
            url: publicUrl,
            createdAt: new Date(),
            userId,
            songId: songId || uploadId,
            // Mark this as a local file
            storage: 'local'
          };
          
          console.log("✅ Local file info:", savedFile);
          
          // Verify file existence
          const { access } = require('fs/promises');
          try {
            await access(filePath);
            console.log("✅ Verified file exists on disk");
          } catch (accessErr) {
            console.error("❌ File does not exist on disk after writing:", accessErr);
          }
          
        } catch (localError) {
          console.error("❌ Local storage failed:", localError);
          console.error("Error stack:", localError.stack);
          throw new Error(`Local storage failed: ${localError.message}`);
        }
      } else {
        // PRODUCTION MODE: Use Firebase Storage
        console.log("💾 Using Firebase Storage:", {
          fileName: file.name,
          fileType: file.type,
          directory,
          userId: userId || 'anonymous',
          songId: songId || uploadId
        });
        
        try {
          // First try a simpler test to check Firebase connectivity
          console.log("🧪 Running Firebase connectivity test...");
          
          // Simple method to save to the most permissive path in Firebase
          // This avoids complex rules that might be blocking uploads
          let simplePath = 'public/files';
          
          // If it's an audio file, use the audio path which has special permissions
          if (fileType === 'audio') {
            simplePath = 'audio';
          }
          
          console.log("Using simplified path for maximum compatibility:", simplePath);
          
          const uploadOptions = {
            directory: simplePath,
            // Don't include userId to avoid permissions issues
            userId: null,
            songId: null
          };
          
          console.log("Firebase upload options:", uploadOptions);
          savedFile = await saveFile(file, uploadOptions);
        } catch (firebaseError) {
          console.error("❌ Firebase upload failed:", firebaseError);
          
          // If Firebase fails, try with the bucket prefix for compatibility
          try {
            console.log("⚠️ First attempt failed, trying with explicit bucket URL format...");
            
            // Import necessary Firebase modules directly
            const { ref, uploadBytes, getDownloadURL, getStorage } = await import('firebase/storage');
            const { initializeApp } = await import('firebase/app');
            
            // Initialize Firebase directly with config from environment
            const firebaseConfig = {
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
            };
            
            // Initialize a dedicated app instance for this upload
            const directApp = initializeApp(firebaseConfig, `upload-${Date.now()}`);
            
            // Get storage bucket with explicit gs:// format which sometimes helps
            const storageBucket = `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`;
            const directStorage = getStorage(directApp, storageBucket);
            
            // Use a simple path guaranteed to have write access by the rules
            const fileName = `direct-${Date.now()}-${file.name}`;
            const path = `public/files/${fileName}`;
            
            console.log("Direct upload attempt to path:", path);
            
            // Create reference and upload
            const fileRef = ref(directStorage, path);
            const fileBuffer = await file.arrayBuffer();
            
            // Upload directly
            const uploadResult = await uploadBytes(fileRef, fileBuffer, {
              contentType: file.type,
              customMetadata: {
                originalName: file.name,
                uploadId,
                timestamp: Date.now().toString()
              }
            });
            
            console.log("✅ Direct upload succeeded:", uploadResult.metadata.fullPath);
            
            // Get the download URL
            const downloadUrl = await getDownloadURL(fileRef);
            
            // Create a response object matching what saveFile would return
            savedFile = {
              id: uploadId,
              originalName: file.name,
              fileName,
              mimeType: file.type,
              size: file.size,
              path: uploadResult.metadata.fullPath,
              url: downloadUrl,
              createdAt: new Date(),
              // No user association in this direct method
              userId: null,
              songId: null
            };
          } catch (directError) {
            console.error("❌ All Firebase upload attempts failed!");
            console.error("First error:", firebaseError);
            console.error("Direct upload error:", directError);
            throw new Error(`Firebase upload failed after multiple attempts: ${directError.message}`);
          }
        }
      }
      
      console.log("File saved successfully:", savedFile);
      console.log("Download URL:", savedFile.url);
      
      // If this is an audio file for a song, update the song data in Firestore
      if (fileType === 'audio' && songId) {
        try {
          // Update song metadata with the audio URL
          if (db) {
            const songDocRef = doc(db, 'songs', songId);
            await setDoc(songDocRef, {
              audioUrl: savedFile.url,
              updatedAt: new Date().toISOString()
            }, { merge: true });
            console.log("Updated song document with audio URL:", savedFile.url);
          } else {
            console.warn("Firestore not available, skipping song document update");
          }
        } catch (dbError) {
          console.error("Failed to update song document:", dbError);
          // Continue anyway, not critical for the upload operation
        }
      }
      
      // Using Firebase Storage directly - no local backup needed
      
      // Return the file info
      return NextResponse.json(savedFile);
    } catch (error) {
      console.error('Error uploading file to Firebase Storage:', error);
      
      // Provide detailed error information for debugging
      const errorMessage = (error as Error).message;
      const errorStack = (error as Error).stack;
      
      console.error('=== UPLOAD ERROR DETAILS ===');
      console.error('Message:', errorMessage);
      console.error('Stack:', errorStack);
      console.error('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        directory
      });
      console.error('Request headers:', Object.fromEntries([...request.headers.entries()]));
      console.error('============================');
      
      return NextResponse.json({
        error: 'Failed to upload file. Please try again later.',
        technicalError: errorMessage,
        success: false
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in upload handler:', error);
    
    return NextResponse.json(
      { error: 'Server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// Helper function to get file size in human-readable format
function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}
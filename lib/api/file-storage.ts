import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  getMetadata,
  StorageReference,
  uploadBytesResumable,
  getStorage
} from 'firebase/storage';
import { storage, app as firebaseApp } from '@/lib/firebase';

// Create a reference to Firebase Storage
const createStorageRef = (path: string): StorageReference => {
  try {
    // Check if storage is properly initialized 
    if (!storage) {
      throw new Error("Firebase Storage is not initialized");
    }
    
    if (typeof storage.ref !== 'function') {
      throw new Error("Firebase Storage ref function is not available");
    }
    
    // Create a proper Firebase Storage reference
    return ref(storage, path);
  } catch (error) {
    console.error("[file-storage] Error creating storage reference:", error);
    throw error; // Let the caller handle the error
  }
};

// Log storage initialization to help debug issues
console.log("[file-storage] Firebase Storage initialization:", {
  initialized: !!storage,
  hasRefMethod: storage && typeof storage.ref === 'function',
  bucket: firebaseApp.options.storageBucket,
  env: process.env.NODE_ENV
});

// File size limit (20MB in bytes)
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

// Interface for file metadata
export interface StoredFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  createdAt: Date;
  userId?: string;
  songId?: string;
}

// Function to save a file to Firebase Storage
export async function saveFile(
  file: File | Buffer | ArrayBuffer,
  options: {
    fileName?: string;
    mimeType?: string;
    directory?: string;
    userId?: string;
    songId?: string;
  } = {}
): Promise<StoredFile> {
  try {
    console.log("[file-storage] Starting saveFile function with Firebase Storage");
    console.log("[file-storage] File type:", file.constructor.name);
    console.log("[file-storage] Options:", options);
    
    // Generate a unique ID for this file
    const fileId = uuidv4();
    console.log("[file-storage] Generated UUID:", fileId);
    
    // Determine file details
    let originalName = '';
    let ext = '';
    let mimeType = options.mimeType || 'application/octet-stream';
    let size = 0;
    let fileBuffer: ArrayBuffer;
    
    // Handle different input types
    if (file instanceof File) {
      originalName = file.name;
      mimeType = file.type;
      ext = path.extname(file.name);
      size = file.size;
      
      // Check if audio file and validate mime type
      if (options.directory?.includes('audio') && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
        throw new Error(`Invalid audio file type. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}`);
      }
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      // Convert File to ArrayBuffer
      fileBuffer = await file.arrayBuffer();
      
      console.log("[file-storage] File object details:", { 
        name: file.name, 
        type: file.type, 
        size: file.size, 
        extension: ext 
      });
    } else if (file instanceof ArrayBuffer) {
      if (!options.fileName) {
        throw new Error('fileName is required when uploading an ArrayBuffer');
      }
      
      originalName = options.fileName;
      ext = path.extname(options.fileName);
      mimeType = options.mimeType || getMimeType(options.fileName);
      size = file.byteLength;
      fileBuffer = file;
      
      // Size validation
      if (size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      console.log("[file-storage] ArrayBuffer details:", { size, extension: ext });
    } else {
      // Assume it's a Buffer
      if (!options.fileName) {
        throw new Error('fileName is required when uploading a Buffer');
      }
      
      originalName = options.fileName;
      ext = path.extname(options.fileName);
      mimeType = options.mimeType || getMimeType(options.fileName);
      size = file.length;
      fileBuffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
      
      // Size validation
      if (size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      console.log("[file-storage] Buffer details:", { size, extension: ext });
    }
    
    // Create a unique filename
    const fileName = `${fileId}${ext}`;
    console.log("[file-storage] Generated filename:", fileName);
    
    // Determine the storage path that matches Firebase rules
    let storagePath = '';
    
    // If a specific directory is provided and it's 'audio' or 'images'
    if (options.directory === 'audio') {
      // For audio files, match the pattern in Firebase rules: audio/{fileName}
      // According to rules at line 141, audio files use a simple pattern: audio/{fileName}
      storagePath = `audio/${fileName}`;
    } else if (options.directory === 'images') {
      // For cover images, use covers/[songId or uuid]/filename format
      const songIdSegment = options.songId || fileId;
      storagePath = `covers/${songIdSegment}/${fileName}`;
    } else if (options.userId) {
      // For user-specific uploads with other directory types
      storagePath = `users/${options.userId}/${options.directory || 'files'}/${fileName}`;
    } else {
      // Fallback to public directory for any other case
      storagePath = `public/${options.directory || 'files'}/${fileName}`;
    }
    
    console.log("[file-storage] Final storage path (matching Firebase rules):", storagePath);
    
    console.log("[file-storage] Firebase Storage path:", storagePath);
    
    // Create a reference to the file path in Firebase Storage using our safe method
    console.log("[file-storage] Creating storage reference with path:", storagePath);
    
    // Verify storage access is available
    if (!storage) {
      console.warn("[file-storage] Firebase storage is not initialized. Using fallback implementation.");
    }
    
    // Create a reference to Firebase Storage, handling potential errors
    let storageRef;
    try {
      // Get Firebase Storage reference with detailed error handling
      if (!storage) {
        console.error("[file-storage] CRITICAL ERROR: Firebase Storage is not initialized");
        
        // Check if Firebase app is initialized
        if (!firebaseApp) {
          throw new Error("Firebase app is not initialized - check your environment variables");
        }
        
        // In development, try to re-initialize storage with bucket from env
        if (process.env.NODE_ENV !== 'production') {
          console.log("[file-storage] DEVELOPMENT MODE: Attempting to re-initialize Storage");
          const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
          
          if (!storageBucket) {
            throw new Error("No Firebase Storage bucket configured in environment variables");
          }
          
          console.log("[file-storage] Re-initializing Storage with bucket:", storageBucket);
          const newStorage = getStorage(firebaseApp, storageBucket);
          
          if (!newStorage) {
            throw new Error("Failed to re-initialize Firebase Storage");
          }
          
          // Create reference using re-initialized storage
          storageRef = ref(newStorage, storagePath);
          console.log("[file-storage] Created storage reference with re-initialized Storage");
          return;
        } else {
          throw new Error("Firebase Storage is not initialized");
        }
      }
      
      storageRef = createStorageRef(storagePath);
      console.log("[file-storage] Successfully created storage reference for:", storagePath);
    } catch (refError) {
      console.error("[file-storage] Failed to create storage reference:", refError);
      
      // In development mode, try with a fallback approach using a direct path
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log("[file-storage] DEVELOPMENT MODE: Trying alternative storage reference method");
          // Try direct initialization
          const directStorage = getStorage(firebaseApp);
          storageRef = ref(directStorage, storagePath);
          console.log("[file-storage] Successfully created alternative storage reference");
        } catch (altError) {
          console.error("[file-storage] Alternative storage reference also failed:", altError);
          throw new Error(`Failed to create Firebase Storage reference: ${(refError as Error).message}, Alternative also failed: ${(altError as Error).message}`);
        }
      } else {
        throw new Error(`Failed to create Firebase Storage reference: ${(refError as Error).message}`);
      }
    }
    
    // Print reference details for debugging
    console.log("[file-storage] Storage reference created:", {
      path: storageRef.fullPath,
      bucket: storageRef.bucket,
      name: storageRef.name
    });
    
    // Upload the file to Firebase Storage
    console.log("[file-storage] Uploading to Firebase Storage...");
    let uploadResult;
    try {
      // Additional check before upload
      if (!storageRef) {
        throw new Error("Storage reference is null or undefined");
      }
      
      // Double check storage configuration
      console.log("[file-storage] Pre-upload check - Storage reference path:", storageRef.fullPath);
      console.log("[file-storage] Pre-upload check - Storage reference bucket:", storageRef.bucket);
      
      // Create the metadata object with standard CORS headers
      const metadata = {
        contentType: mimeType,
        customMetadata: {
          originalName,
          fileId,
          ...(options.userId && { userId: options.userId }),
          ...(options.songId && { songId: options.songId }),
          // Add extra metadata to help with debugging
          uploadTimestamp: Date.now().toString(),
          environment: process.env.NODE_ENV || 'unknown',
          appVersion: '1.0.0'
        }
      };
      
      // Try Firebase upload methods - start with resumable upload which is more reliable
      console.log("[file-storage] Starting upload using uploadBytesResumable...");
      
      try {
        const uploadTask = uploadBytesResumable(storageRef, fileBuffer, metadata);
        
        // Set up progress monitoring
        uploadTask.on('state_changed',
          (snapshot) => {
            // Track progress updates
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`[file-storage] Upload progress: ${progress.toFixed(2)}%`);
          },
          (error) => {
            // Handle unsuccessful uploads
            console.error("[file-storage] Upload error in progress monitoring:", error);
          }
        );
        
        // Wait for completion
        uploadResult = await uploadTask;
        console.log("[file-storage] Resumable upload completed successfully!");
      } catch (resumableError) {
        // If resumable upload fails, try the regular upload
        console.error("[file-storage] Resumable upload failed, falling back to direct upload:", resumableError);
        
        // Fallback to standard upload method with retries
        const maxRetries = 3;
        let retryCount = 0;
        let lastError = null;
        
        while (retryCount < maxRetries) {
          try {
            console.log(`[file-storage] Direct upload attempt ${retryCount + 1}/${maxRetries}`);
            
            uploadResult = await uploadBytes(storageRef, fileBuffer, metadata);
            
            console.log("[file-storage] Direct upload successful");
            break; // Exit the retry loop on success
          } catch (error) {
            lastError = error;
            console.error(`[file-storage] Direct upload attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            
            if (retryCount >= maxRetries) {
              throw lastError;
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }
      }
      
      if (!uploadResult) {
        throw new Error("Upload failed after retries");
      }
    } catch (uploadError) {
      console.error("[file-storage] Upload failed after all retries:", uploadError);
      // Provide more context about the error
      const errorMessage = (uploadError as Error).message || "Unknown error";
      const errorStack = (uploadError as Error).stack || "";
      console.error("[file-storage] Error details:", {
        message: errorMessage,
        stack: errorStack,
        storagePath,
        fileSize: fileBuffer.byteLength
      });
      throw new Error(`Upload to Firebase failed: ${errorMessage}`);
    }
    
    console.log("[file-storage] File uploaded successfully:", uploadResult.metadata.fullPath);
    
    // Get download URL with error handling
    let downloadUrl;
    
    try {
      // Get the public download URL from Firebase
      downloadUrl = await getDownloadURL(storageRef);
      console.log("[file-storage] Got Firebase download URL:", downloadUrl);
    } catch (urlError) {
      console.error("[file-storage] Failed to get Firebase download URL:", urlError);
      throw urlError; // Let the caller handle the error
    }
    
    // Return the file metadata
    const fileInfo: StoredFile = {
      id: fileId,
      originalName: originalName,
      fileName,
      mimeType,
      size,
      path: uploadResult.metadata.fullPath,
      url: downloadUrl || '',  // Provide empty string as fallback
      createdAt: new Date(),
      userId: options.userId,
      songId: options.songId
    };
    
    console.log("[file-storage] Returning file info:", fileInfo);
    return fileInfo;
  } catch (error) {
    console.error('Failed to save file:', error);
    throw new Error('Failed to save file: ' + (error as Error).message);
  }
}

// Function to retrieve a file from Firebase Storage by path
export async function getFile(
  fileIdOrPath: string, 
  directory?: string
): Promise<StoredFile | null> {
  try {
    console.log("[file-storage] Getting file metadata for:", fileIdOrPath);
    
    // Check if input is a full path or just an ID
    const isFullPath = fileIdOrPath.includes('/');
    let filePath = fileIdOrPath;
    
    if (!isFullPath && directory) {
      // Construct path from ID and directory
      filePath = directory + '/' + fileIdOrPath;
      console.log("[file-storage] Constructed path from ID and directory:", filePath);
    }
    
    // Check if Firebase Storage is properly initialized
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }
    
    // Create a reference to the file
    const fileRef = ref(storage, filePath);
    console.log("[file-storage] Created storage reference for path:", filePath);
    
    // Get the file metadata
    const metadata = await getMetadata(fileRef);
    console.log("[file-storage] Retrieved metadata successfully");
    
    // Get the download URL for the file
    const downloadUrl = await getDownloadURL(fileRef);
    console.log("[file-storage] Got Firebase download URL:", downloadUrl);
    
    // Extract relevant information from the metadata
    const originalName = metadata.customMetadata?.originalName || metadata.name;
    const fileId = metadata.customMetadata?.fileId || metadata.name.split('.')[0];
    
    // Create the StoredFile object
    const fileInfo: StoredFile = {
      id: fileId,
      originalName: originalName,
      fileName: metadata.name,
      mimeType: metadata.contentType,
      size: metadata.size,
      path: metadata.fullPath,
      url: downloadUrl,
      createdAt: new Date(metadata.timeCreated),
      userId: metadata.customMetadata?.userId,
      songId: metadata.customMetadata?.songId
    };
    
    console.log("[file-storage] Returning file info:", fileInfo);
    return fileInfo;
  } catch (error) {
    console.error('[file-storage] Failed to get file:', error);
    return null;
  }
}

// Function to delete a file from Firebase Storage
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    console.log("[file-storage] Deleting file:", filePath);
    
    // Check if Firebase Storage is properly initialized
    if (!storage) {
      throw new Error("Firebase Storage not initialized");
    }
    
    // Create a reference to the file
    const fileRef = ref(storage, filePath);
    
    // Delete the file with retry mechanism for reliability
    const maxRetries = 2;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`[file-storage] Delete attempt ${retryCount + 1}/${maxRetries + 1}`);
        await deleteObject(fileRef);
        console.log("[file-storage] File deleted successfully");
        return true;
      } catch (deleteError) {
        console.error(`[file-storage] Delete attempt ${retryCount + 1} failed:`, deleteError);
        retryCount++;
        
        if (retryCount > maxRetries) {
          throw deleteError;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    return false;
  } catch (error) {
    console.error('[file-storage] Failed to delete file:', error);
    throw error;
  }
}

// Helper to determine MIME type from file extension
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.flac': 'audio/flac',
    '.m4a': 'audio/x-m4a',
    '.aac': 'audio/aac',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}
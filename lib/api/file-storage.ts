import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define the storage directory
const STORAGE_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure the storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  try {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
    console.log(`Created storage directory: ${STORAGE_DIR}`);
  } catch (error) {
    console.error(`Failed to create storage directory: ${error}`);
  }
}

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

// Function to save a file
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
    console.log("[file-storage] Starting saveFile function");
    console.log("[file-storage] File type:", file.constructor.name);
    console.log("[file-storage] Options:", options);
    
    // Generate a unique ID for this file
    const fileId = uuidv4();
    console.log("[file-storage] Generated UUID:", fileId);
    
    // Determine the file extension
    let ext = '';
    let originalName = '';
    let mimeType = options.mimeType || 'application/octet-stream';
    
    if (file instanceof File) {
      originalName = file.name;
      mimeType = file.type;
      ext = path.extname(file.name);
      console.log("[file-storage] File object details:", { 
        name: file.name, 
        type: file.type, 
        size: file.size, 
        extension: ext 
      });
    } else if (options.fileName) {
      originalName = options.fileName;
      ext = path.extname(options.fileName);
      console.log("[file-storage] Using provided file name:", originalName);
    }
    
    // Create a unique filename
    const fileName = `${fileId}${ext}`;
    console.log("[file-storage] Generated filename:", fileName);
    
    // Determine the directory
    const directory = options.directory 
      ? path.join(STORAGE_DIR, options.directory) 
      : STORAGE_DIR;
    console.log("[file-storage] Target directory:", directory);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(directory)) {
      console.log("[file-storage] Creating directory:", directory);
      fs.mkdirSync(directory, { recursive: true });
    }
    
    // Full file path
    const filePath = path.join(directory, fileName);
    console.log("[file-storage] Full file path:", filePath);
    
    // Convert File/Buffer to Buffer for writing
    let buffer: Buffer;
    
    try {
      console.log("[file-storage] Converting file to buffer");
      
      if (file instanceof File) {
        console.log("[file-storage] Converting File to ArrayBuffer");
        const arrayBuffer = await file.arrayBuffer();
        console.log("[file-storage] File converted to ArrayBuffer, size:", arrayBuffer.byteLength);
        buffer = Buffer.from(arrayBuffer);
      } else if (file instanceof ArrayBuffer) {
        console.log("[file-storage] Converting ArrayBuffer to Buffer");
        buffer = Buffer.from(file);
      } else {
        console.log("[file-storage] Using provided Buffer");
        buffer = file;
      }
      
      console.log("[file-storage] Buffer created, size:", buffer.length);
    } catch (err) {
      console.error("[file-storage] Error converting file to buffer:", err);
      throw err;
    }
    
    // Write the file
    try {
      console.log("[file-storage] Writing file to disk");
      fs.writeFileSync(filePath, buffer);
      console.log("[file-storage] File written successfully");
      
      // Verify the file was written
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        console.log("[file-storage] File verification: exists, size:", stats.size);
      } else {
        console.error("[file-storage] File verification failed: file does not exist after writing");
      }
    } catch (err) {
      console.error("[file-storage] Error writing file:", err);
      throw err;
    }
    
    // Calculate relative path for URL
    const relativePath = path.relative(process.cwd(), filePath);
    const publicUrl = `/uploads/${path.relative(STORAGE_DIR, filePath)}`;
    console.log("[file-storage] Generated URL:", publicUrl);
    
    // Return the file metadata
    const fileInfo: StoredFile = {
      id: fileId,
      originalName: originalName || fileName,
      fileName,
      mimeType,
      size: buffer.length,
      path: relativePath,
      url: publicUrl,
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

// Function to retrieve a file
export function getFile(fileId: string, directory?: string): StoredFile | null {
  const dir = directory ? path.join(STORAGE_DIR, directory) : STORAGE_DIR;
  
  // Check if directory exists
  if (!fs.existsSync(dir)) {
    return null;
  }
  
  // List all files in the directory
  const files = fs.readdirSync(dir);
  
  // Find files that start with the given ID
  const matchingFile = files.find(file => file.startsWith(fileId));
  
  if (!matchingFile) {
    return null;
  }
  
  const filePath = path.join(dir, matchingFile);
  const fileStats = fs.statSync(filePath);
  
  const relativePath = path.relative(process.cwd(), filePath);
  const publicUrl = `/uploads/${path.relative(STORAGE_DIR, filePath)}`;
  
  // Return the file info
  return {
    id: fileId,
    originalName: matchingFile,
    fileName: matchingFile,
    mimeType: getMimeType(matchingFile),
    size: fileStats.size,
    path: relativePath,
    url: publicUrl,
    createdAt: fileStats.birthtime,
  };
}

// Function to delete a file
export function deleteFile(fileId: string, directory?: string): boolean {
  const file = getFile(fileId, directory);
  
  if (!file) {
    return false;
  }
  
  try {
    const fullPath = path.join(process.cwd(), file.path);
    fs.unlinkSync(fullPath);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
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
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}
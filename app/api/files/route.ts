import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { StoredFile } from '@/lib/api/file-storage';

/**
 * API endpoint to retrieve files for a specific user
 * GET /api/files?userId=123&fileType=audio
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    const fileType = searchParams.get('fileType');
    
    // Check for authentication
    const sessionCookie = cookies().get('session')?.value;
    let authenticatedUserId = null;
    
    if (sessionCookie) {
      try {
        // Verify session cookie with Firebase Admin
        const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
        authenticatedUserId = decodedClaims.uid;
        console.log("Authenticated user:", authenticatedUserId);
      } catch (authError) {
        console.error("Session verification failed:", authError);
      }
    }
    
    // Security check: Only allow a user to access their own files unless admin
    if (requestedUserId && authenticatedUserId !== requestedUserId) {
      // Check if user is an admin
      if (authenticatedUserId) {
        // TODO: Check admin status from Firestore
        // For now, reject non-matching user IDs
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    // Determine the directory to scan
    const storageDir = path.join(process.cwd(), 'public', 'uploads');
    let targetDir: string;
    
    if (requestedUserId) {
      // User-specific files
      if (fileType) {
        targetDir = path.join(storageDir, 'users', requestedUserId, fileType);
      } else {
        targetDir = path.join(storageDir, 'users', requestedUserId);
      }
    } else {
      // Public files
      if (fileType) {
        targetDir = path.join(storageDir, fileType);
      } else {
        targetDir = storageDir;
      }
    }
    
    // Check if the directory exists
    if (!fs.existsSync(targetDir)) {
      return NextResponse.json([]);
    }
    
    // Get all files recursively
    const files = getAllFiles(targetDir);
    
    // Convert to StoredFile format
    const fileInfos = files.map(filePath => {
      const stats = fs.statSync(filePath);
      const fileId = path.basename(filePath).split('.')[0];
      const relativePath = path.relative(process.cwd(), filePath);
      const publicUrl = `/uploads/${path.relative(storageDir, filePath)}`;
      
      return {
        id: fileId,
        originalName: path.basename(filePath),
        fileName: path.basename(filePath),
        mimeType: getMimeType(filePath),
        size: stats.size,
        path: relativePath,
        url: publicUrl,
        createdAt: stats.birthtime.toISOString(),
        userId: requestedUserId,
      };
    });
    
    return NextResponse.json(fileInfos);
  } catch (error) {
    console.error('Error retrieving files:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve files: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string, fileList: string[] = []) {
  if (!fs.existsSync(dirPath)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively scan subdirectories
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Determine MIME type from file extension
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  
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
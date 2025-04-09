import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminAuth, getAdminStorage } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { StoredFile } from '@/lib/api/file-storage';
import { storage, app as firebaseApp } from '@/lib/firebase';

// Mark route as dynamic to ensure it's not statically generated
export const dynamic = 'force-dynamic';

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
    const firebasePath = searchParams.get('path');
    
    // Handle direct Firebase storage path requests
    if (firebasePath) {
      console.log("Attempting to serve file from Firebase path:", firebasePath);
      
      try {
        // First try using the admin SDK
        try {
          const adminStorage = getAdminStorage();
          if (adminStorage) {
            try {
              const file = adminStorage.bucket().file(firebasePath);
              const [exists] = await file.exists();
              
              if (exists) {
                console.log("File exists in Firebase Storage admin SDK");
                
                // Generate a signed URL
                const [signedUrl] = await file.getSignedUrl({
                  action: 'read',
                  expires: Date.now() + 15 * 60 * 1000, // 15 minutes
                });
                
                // Redirect to the signed URL
                return NextResponse.redirect(signedUrl);
              }
            } catch (err) {
              console.error("Admin SDK file access error:", err);
            }
          }
        } catch (err) {
          console.error("Admin storage error:", err);
        }
        
        // Then try using the client SDK
        if (storage && typeof storage.ref === 'function') {
          try {
            const storageRef = storage.ref(firebasePath);
            const downloadUrl = await storageRef.getDownloadURL();
            
            console.log("Got download URL from client SDK:", downloadUrl);
            return NextResponse.redirect(downloadUrl);
          } catch (err) {
            console.error("Client SDK file access error:", err);
          }
        }
        
        // Finally, try to serve from local filesystem as fallback
        const localPath = path.join(process.cwd(), 'public', 'uploads', firebasePath);
        if (fs.existsSync(localPath)) {
          console.log("Serving file from local filesystem:", localPath);
          
          const fileBuffer = fs.readFileSync(localPath);
          const stats = fs.statSync(localPath);
          const mimeType = getMimeType(localPath);
          
          return new Response(fileBuffer, {
            status: 200,
            headers: {
              'Content-Type': mimeType,
              'Content-Length': stats.size.toString(),
              'Content-Disposition': `inline; filename="${path.basename(localPath)}"`,
            }
          });
        }
        
        // If all attempts fail
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      } catch (error) {
        console.error("Error serving file:", error);
        return NextResponse.json(
          { error: 'Error serving file: ' + (error as Error).message },
          { status: 500 }
        );
      }
    }
    
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
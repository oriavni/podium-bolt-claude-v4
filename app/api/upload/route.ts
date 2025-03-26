import { NextRequest, NextResponse } from 'next/server';
import { saveFile, StoredFile } from '@/lib/api/file-storage';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/lib/firebase-admin';

/**
 * API route for file uploads
 * Includes authentication check and associates uploads with the current user
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Received upload request");
    
    // Check for authentication
    const sessionCookie = cookies().get('session')?.value;
    let userId = null;
    
    if (sessionCookie) {
      try {
        // Verify session cookie with Firebase Admin
        const decodedClaims = await getAdminAuth().verifySessionCookie(sessionCookie);
        userId = decodedClaims.uid;
        console.log("Authenticated user:", userId);
      } catch (authError) {
        console.error("Session verification failed:", authError);
        // Continue without user ID
      }
    } else {
      console.log("No session cookie found");
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
    console.log("Form data parsed");
    
    // Get the file
    const file = formData.get('file') as File | null;
    console.log("File from form data:", file ? `${file.name} (${file.size} bytes)` : "No file");
    
    if (!file) {
      console.log("Error: No file provided in the request");
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Get other fields from the form data
    const fileType = formData.get('fileType') as string || '';
    const songId = formData.get('songId') as string || '';
    console.log("File type:", fileType);
    console.log("Song ID:", songId);
    
    // Determine the directory based on file type and user
    let directory = '';
    
    if (userId) {
      // Group files by user ID if authenticated
      if (fileType === 'audio') {
        directory = `users/${userId}/audio`;
      } else if (fileType === 'image') {
        directory = `users/${userId}/images`;
      } else {
        directory = `users/${userId}/misc`;
      }
    } else {
      // Use generic directories for unauthenticated uploads
      if (fileType === 'audio') {
        directory = 'audio';
      } else if (fileType === 'image') {
        directory = 'images';
      }
    }
    
    console.log("Using directory:", directory || "root");
    
    try {
      // Save the file using our normal method
      console.log("Saving file using saveFile...");
      const savedFile = await saveFile(file, {
        directory,
        userId,
        songId
      });
      
      console.log("File saved successfully:", savedFile);
      
      // Return the file info
      return NextResponse.json(savedFile);
    } catch (saveError) {
      console.error("Error in primary save method:", saveError);
      
      // Fall back to a direct file save
      console.log("Attempting fallback direct file save...");
      
      // Import necessary modules for fallback
      const fs = require('fs');
      const path = require('path');
      const { v4: uuidv4 } = require('uuid');
      
      // Determine the directory path
      const storageDir = path.join(process.cwd(), 'public', 'uploads');
      const targetDir = directory ? path.join(storageDir, directory) : storageDir;
      
      // Ensure directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Get file data
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate filename
      const fileId = uuidv4();
      const ext = path.extname(file.name);
      const fileName = `${fileId}${ext}`;
      const filePath = path.join(targetDir, fileName);
      
      // Write file
      fs.writeFileSync(filePath, buffer);
      console.log("Fallback save successful:", filePath);
      
      // Generate URL
      const relativePath = path.relative(process.cwd(), filePath);
      const dirName = path.relative(storageDir, targetDir);
      const publicUrl = `/uploads/${dirName}/${fileName}`;
      
      // Create response
      const fileInfo = {
        id: fileId,
        originalName: file.name,
        fileName,
        mimeType: file.type,
        size: buffer.length,
        path: relativePath,
        url: publicUrl,
        createdAt: new Date(),
        userId,
        songId
      };
      
      console.log("Returning file info from fallback:", fileInfo);
      return NextResponse.json(fileInfo);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload file: ' + (error as Error).message },
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
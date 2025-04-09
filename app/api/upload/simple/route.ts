import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Simple, direct file upload API endpoint
 * This is a minimal implementation for troubleshooting Firebase Storage issues
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting simplified file upload process");
    
    // Initialize Firebase directly within this endpoint
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    console.log("Firebase config:", {
      apiKeyExists: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });
    
    // Initialize Firebase directly
    const firebaseApp = initializeApp(firebaseConfig, 'simple-upload');
    console.log("Firebase app initialized:", firebaseApp.name);
    
    // Parse request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log("Received file:", {
      name: file.name,
      type: file.type,
      size: file.size
    });
    
    // Generate a UUID for this file
    const fileId = uuidv4();
    const fileName = `${fileId}-${file.name}`;
    
    // Use the most permissive path based on Firebase rules
    const storagePath = `public/files/${fileName}`;
    console.log("Using storage path:", storagePath);
    
    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Initialize Storage directly with explicit bucket name
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    console.log("Using storage bucket:", storageBucket);
    const storage = getStorage(firebaseApp, storageBucket);
    
    // Create reference
    const fileRef = ref(storage, storagePath);
    console.log("Created storage reference:", fileRef.fullPath);
    
    // Upload file with retry logic
    console.log("Uploading file...");
    let uploadResult;
    
    try {
      uploadResult = await uploadBytes(fileRef, fileBuffer, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          fileId,
          timestamp: Date.now().toString()
        }
      });
    } catch (uploadError) {
      console.error("First upload attempt failed:", uploadError);
      console.log("Trying alternative upload method with explicit URL...");
      
      // Try with a different approach - sometimes URL format matters
      const fullBucketUrl = `gs://${storageBucket}`;
      console.log("Using full bucket URL:", fullBucketUrl);
      
      // Re-initialize storage with the explicit gs:// URL
      const altStorage = getStorage(firebaseApp, fullBucketUrl);
      const altRef = ref(altStorage, storagePath);
      
      // Try upload again
      console.log("Retrying upload with alternative storage reference");
      uploadResult = await uploadBytes(altRef, fileBuffer, {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          fileId,
          timestamp: Date.now().toString(),
          retry: "true"
        }
      });
    }
    
    console.log("Upload successful:", uploadResult.metadata.fullPath);
    
    // Get download URL
    const downloadUrl = await getDownloadURL(fileRef);
    console.log("Generated download URL:", downloadUrl);
    
    // Return file info
    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        originalName: file.name,
        fileName,
        mimeType: file.type,
        size: file.size,
        path: uploadResult.metadata.fullPath,
        url: downloadUrl,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Simplified upload failed:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      trace: (error as Error).stack
    }, { status: 500 });
  }
}
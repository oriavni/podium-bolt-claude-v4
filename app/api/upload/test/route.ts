import { NextRequest, NextResponse } from 'next/server';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { app } from '@/lib/firebase';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Test endpoint for troubleshooting Firebase Storage connectivity
 * This performs a direct test upload without using abstractions
 */
export async function GET(request: NextRequest) {
  console.log("⚡ Running Firebase Storage test upload...");
  
  try {
    // Create a simple text file
    const testData = new Uint8Array([84, 101, 115, 116, 32, 102, 105, 108, 101]); // "Test file"
    const fileName = `test-${Date.now()}.txt`;
    
    // Log environment info
    console.log("Environment:", process.env.NODE_ENV);
    console.log("Firebase app initialized:", !!app);
    console.log("Storage bucket from env:", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
    
    if (!app) {
      throw new Error("Firebase app is not initialized");
    }
    
    // Create a direct Firebase Storage reference with explicit bucket
    console.log("Trying to get Firebase Storage instance...");
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    console.log("Using storage bucket:", storageBucket);
    
    const storage = getStorage(app, storageBucket);
    console.log("Got storage instance:", !!storage);
    
    // Create a storage reference for the test file
    const storagePath = `public/test/${fileName}`;
    console.log("Creating storage reference for path:", storagePath);
    const fileRef = ref(storage, storagePath);
    console.log("Storage reference created:", fileRef.fullPath);
    
    // Upload the test file
    console.log("Uploading test file...");
    const snapshot = await uploadBytes(fileRef, testData, {
      contentType: 'text/plain',
      customMetadata: {
        test: 'true',
        timestamp: Date.now().toString(),
      }
    });
    console.log("Upload completed. Path:", snapshot.ref.fullPath);
    
    // Get the download URL
    console.log("Getting download URL...");
    const downloadUrl = await getDownloadURL(fileRef);
    console.log("Download URL obtained:", downloadUrl);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: "Test upload successful",
      file: {
        name: fileName,
        path: snapshot.ref.fullPath,
        url: downloadUrl,
        size: testData.length,
        type: 'text/plain',
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error("❌ Firebase Storage test failed:", error);
    
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      stack: (error as Error).stack,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
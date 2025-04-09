import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { initializeApp } from 'firebase/app';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to test Firebase Storage initialization and connectivity
 */
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 DEBUG: Testing Firebase configuration and connectivity");
    
    // Configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    };
    
    // Log environment
    console.log("📊 Environment:", process.env.NODE_ENV);
    console.log("📊 Config values present:", {
      apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      appName: 'debug-api-test-' + Date.now()
    });
    
    // Initialize Firebase
    console.log("🔄 Initializing Firebase app...");
    const app = initializeApp(firebaseConfig, 'debug-api-test-' + Date.now());
    console.log("✅ Firebase app initialized:", app.name);
    
    // Initialize Storage with regular bucket
    console.log("🔄 Initializing Storage with regular bucket...");
    const regularBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    console.log("🪣 Regular bucket:", regularBucket);
    const regularStorage = getStorage(app, regularBucket);
    
    // Test path construction
    const testPath = 'public/debug-test.txt';
    console.log("📄 Creating test reference for path:", testPath);
    const testRef = ref(regularStorage, testPath);
    console.log("✅ Reference created:", {
      fullPath: testRef.fullPath,
      bucket: testRef.bucket,
      name: testRef.name
    });
    
    // Test upload with minimal content
    console.log("🔄 Testing minimal upload to Firebase Storage...");
    
    // Create a small text file
    const testData = new Uint8Array([
      84, 101, 115, 116, 32, 102, 105, 108, 101, 32,    // "Test file "
      102, 114, 111, 109, 32, 100, 101, 98, 117, 103    // "from debug"
    ]);
    
    try {
      // Attempt upload
      console.log("🔄 Uploading test file...");
      const result = await uploadBytes(testRef, testData, {
        contentType: 'text/plain',
        customMetadata: {
          purpose: 'debug',
          timestamp: Date.now().toString()
        }
      });
      
      console.log("✅ Upload successful!", {
        path: result.metadata.fullPath,
        size: result.metadata.size,
        contentType: result.metadata.contentType
      });
      
      // Get download URL
      console.log("🔄 Getting download URL...");
      const url = await getDownloadURL(testRef);
      console.log("✅ Got download URL:", url.substring(0, 50) + '...');
      
      return NextResponse.json({
        success: true,
        message: "Firebase Storage test successful",
        details: {
          fileUploaded: testPath,
          downloadUrl: url,
          uploadTime: new Date().toISOString()
        }
      });
    } catch (uploadError) {
      console.error("❌ Upload test failed:", uploadError);
      
      // Try with gs:// format bucket
      try {
        console.log("🔄 Trying with gs:// format bucket...");
        const gsBucket = `gs://${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}`;
        console.log("🪣 GS bucket:", gsBucket);
        
        const gsStorage = getStorage(app, gsBucket);
        const gsRef = ref(gsStorage, testPath + '.gs');
        
        console.log("🔄 Uploading with gs:// bucket...");
        const gsResult = await uploadBytes(gsRef, testData, {
          contentType: 'text/plain'
        });
        
        console.log("✅ GS upload successful!", {
          path: gsResult.metadata.fullPath
        });
        
        const gsUrl = await getDownloadURL(gsRef);
        
        return NextResponse.json({
          success: true,
          message: "Firebase Storage test successful with gs:// format",
          details: {
            fileUploaded: testPath + '.gs',
            downloadUrl: gsUrl,
            uploadTime: new Date().toISOString()
          }
        });
      } catch (gsError) {
        console.error("❌ GS bucket method also failed:", gsError);
        
        return NextResponse.json({
          success: false,
          message: "All Firebase Storage tests failed",
          errors: {
            regular: uploadError.message,
            gsBucket: gsError.message
          }
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error("❌ CRITICAL ERROR:", error);
    
    return NextResponse.json({
      success: false,
      message: "Firebase setup or configuration error",
      error: (error as Error).message,
      stack: (error as Error).stack
    }, { status: 500 });
  }
}
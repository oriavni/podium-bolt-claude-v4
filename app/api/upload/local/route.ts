import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, dirname, basename, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Local file storage for development
 * This endpoint bypasses Firebase entirely and uses local file system storage
 */
export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Starting local file storage upload (Firebase bypass)");
    
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
    
    // Generate a unique filename
    const fileId = uuidv4();
    const ext = extname(file.name);
    const fileName = `${fileId}${ext}`;
    
    // Create directory path for uploads in public folder
    const directory = join(process.cwd(), 'public', 'uploads');
    const filePath = join(directory, fileName);
    
    console.log("Saving file to:", filePath);
    
    // Ensure directory exists
    await mkdir(directory, { recursive: true });
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Write file to disk
    await writeFile(filePath, buffer);
    console.log("File written to disk successfully");
    
    // Generate URL (relative to site root)
    const publicUrl = `/uploads/${fileName}`;
    
    // Return file info
    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        originalName: file.name,
        fileName,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        url: publicUrl,
        createdAt: new Date().toISOString(),
        // Note that this is a local file, not Firebase
        storage: 'local'
      }
    });
  } catch (error) {
    console.error("❌ Local upload failed:", error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
      trace: (error as Error).stack
    }, { status: 500 });
  }
}
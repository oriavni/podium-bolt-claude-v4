import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Cookie expiration time (14 days in seconds)
const EXPIRES_IN = 60 * 60 * 24 * 14;

/**
 * API endpoint to create a session cookie from a Firebase ID token
 * This allows server-side authentication with Firebase Auth
 */
export async function POST(request: NextRequest) {
  try {
    // Get the ID token from the request body
    const { idToken } = await request.json();
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }
    
    // Verify the ID token and create a session cookie
    const expiresIn = EXPIRES_IN * 1000; // Convert to milliseconds for the Firebase SDK
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });
    
    // Set the cookie
    cookies().set({
      name: 'session',
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: EXPIRES_IN,
      path: '/',
      sameSite: 'strict',
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session: ' + (error as Error).message },
      { status: 401 }
    );
  }
}

/**
 * API endpoint to clear the session cookie (logout)
 */
export async function DELETE() {
  cookies().delete('session');
  return NextResponse.json({ success: true });
}
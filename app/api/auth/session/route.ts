import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// Cookie expiration time (14 days in seconds)
const EXPIRES_IN = 60 * 60 * 24 * 14;

/**
 * API endpoint to create a session cookie from a Firebase ID token
 * This allows server-side authentication with Firebase Auth
 */
export async function POST(request: NextRequest) {
  console.log('POST /api/auth/session - Create session cookie');
  
  try {
    // Get the ID token from the request body with better error handling
    let idToken: string;
    
    try {
      const body = await request.json();
      idToken = body.idToken;
      console.log('Request body parsed, idToken length:', idToken?.length);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body: ' + (parseError as Error).message },
        { status: 400 }
      );
    }
    
    if (!idToken) {
      console.error('No idToken provided in request');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // DEVELOPMENT MODE: Skip Firebase admin authentication and use a mock session
    if (process.env.NODE_ENV !== 'production') {
      console.log('DEVELOPMENT MODE: Using mock session cookie with token info:', {
        idTokenLength: idToken?.length,
        idTokenPrefix: idToken?.substring(0, 10),
        idTokenSuffix: idToken?.substring(idToken.length - 10),
      });
      
      // Create a mock session cookie for development that includes the Firebase ID token
      // for better simulation of real authentication flow
      const mockSessionCookie = `mock_session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${idToken?.substring(0, 20)}`;
      
      // Extract uid from the token if possible (for better development experience)
      let uid = 'dev-user-123';
      try {
        // Very crude parsing, just to get something that looks like user ID
        const tokenData = JSON.parse(atob(idToken.split('.')[1]));
        if (tokenData.user_id || tokenData.sub) {
          uid = tokenData.user_id || tokenData.sub;
          console.log('Extracted user ID from token:', uid);
        }
      } catch (e) {
        console.log('Could not extract user ID from token, using default:', uid);
      }
      
      // Set the cookie
      cookies().set({
        name: 'session',
        value: mockSessionCookie,
        httpOnly: true,
        secure: false,
        maxAge: EXPIRES_IN,
        path: '/',
        sameSite: 'lax',
      });
      
      // Also set a uid cookie for development convenience
      cookies().set({
        name: 'uid',
        value: uid,
        httpOnly: false, // Make it accessible to client JS
        secure: false,
        maxAge: EXPIRES_IN,
        path: '/',
        sameSite: 'lax',
      });
      
      console.log('Mock session cookie set in response for user:', uid);
      return NextResponse.json({ success: true, uid });
    }
    
    // PRODUCTION MODE: Use real Firebase Admin authentication
    // Get the admin auth instance
    let auth;
    try {
      auth = getAdminAuth();
      console.log('Got admin auth instance');
    } catch (authError) {
      console.error('Failed to get admin auth:', authError);
      return NextResponse.json(
        { error: 'Server authentication error: ' + (authError as Error).message },
        { status: 500 }
      );
    }
    
    // Verify the ID token and create a session cookie
    try {
      const expiresIn = EXPIRES_IN * 1000; // Convert to milliseconds for the Firebase SDK
      console.log('Creating session cookie with expiration:', expiresIn, 'ms');
      
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      console.log('Session cookie created successfully, length:', sessionCookie.length);
      
      // Set the cookie
      cookies().set({
        name: 'session',
        value: sessionCookie,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: EXPIRES_IN,
        path: '/',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      });
      
      console.log('Session cookie set in response');
      return NextResponse.json({ success: true });
    } catch (sessionError) {
      console.error('Failed to create session cookie:', sessionError);
      return NextResponse.json(
        { error: 'Failed to create session: ' + (sessionError as Error).message },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Unexpected error creating session:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error as Error).message },
      { status: 500 }
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

/**
 * API endpoint to check the current session
 */
export async function GET() {
  console.log('GET /api/auth/session - Checking session');
  
  try {
    // Get the session cookie
    const sessionCookie = cookies().get('session')?.value;
    
    if (!sessionCookie) {
      console.log('No session cookie found');
      return NextResponse.json({ authenticated: false });
    }
    
    console.log('Session cookie found, length:', sessionCookie.length);
    
    // DEVELOPMENT MODE: Accept mock session cookie
    if (process.env.NODE_ENV !== 'production' && sessionCookie.startsWith('mock_session_')) {
      console.log('DEVELOPMENT MODE: Using mock session authentication');
      
      // Try to get the UID from the cookie we set in development mode
      const uidCookie = cookies().get('uid')?.value;
      const uid = uidCookie || 'mock-user-123';
      
      // Try to extract embedded user ID from the session cookie if possible
      let extractedUserId = uid;
      try {
        if (sessionCookie.includes('_')) {
          const cookieParts = sessionCookie.split('_');
          // Check if the cookie has our Firebase token prefix
          const potentialToken = cookieParts[cookieParts.length - 1];
          if (potentialToken && potentialToken.length > 10) {
            // Very simplistic check
            console.log('Found potential token embedded in cookie');
          }
        }
      } catch (e) {
        console.log('Error extracting user info from session cookie:', e);
      }
      
      console.log('Using development user ID:', uid);
      
      // Return mock user info
      return NextResponse.json({
        authenticated: true,
        user: {
          uid: uid,
          email: `${uid}@example.com`,
          emailVerified: true,
          displayName: `Test User (${uid})`,
          photoURL: `https://i.pravatar.cc/150?u=${uid}@example.com`,
        }
      });
    }
    
    // PRODUCTION MODE: Verify with Firebase Admin
    // Get auth instance
    let auth;
    try {
      auth = getAdminAuth();
    } catch (authError) {
      console.error('Failed to get admin auth for session check:', authError);
      return NextResponse.json(
        { error: 'Server authentication error', authenticated: false },
        { status: 500 }
      );
    }
    
    // Verify the session cookie
    try {
      // Force check if revoked is true
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      
      console.log('Session cookie verified successfully for user:', decodedClaims.uid);
      
      // Return user info
      return NextResponse.json({
        authenticated: true,
        user: {
          uid: decodedClaims.uid,
          email: decodedClaims.email,
          emailVerified: decodedClaims.email_verified,
          displayName: decodedClaims.name,
          photoURL: decodedClaims.picture,
        }
      });
    } catch (verifyError) {
      console.error('Invalid session cookie:', verifyError);
      
      // Delete the invalid cookie
      cookies().delete('session');
      console.log('Deleted invalid session cookie');
      
      return NextResponse.json({ 
        authenticated: false,
        error: 'Session expired or invalid'
      });
    }
  } catch (error) {
    console.error('Unexpected error checking session:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error as Error).message, authenticated: false },
      { status: 500 }
    );
  }
}
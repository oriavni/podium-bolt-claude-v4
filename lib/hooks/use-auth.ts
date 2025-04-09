"use client";

import { useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing server-side session first
    const checkServerSession = async () => {
      try {
        console.log('Checking server-side session...');
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Server session check result:', { authenticated: data.authenticated });
        } else {
          console.warn('Failed to check server session:', response.status);
        }
      } catch (error) {
        console.error('Error checking server session:', error);
      }
    };
    
    // Run the session check
    checkServerSession();
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      console.log('Firebase auth state changed:', authUser ? 'User authenticated' : 'No user');
      setUser(authUser);
      
      if (authUser) {
        // User is signed in, create a session cookie
        try {
          console.log('Getting ID token for session cookie...');
          // Force token refresh to ensure we have the latest one
          const idToken = await getIdToken(authUser, true);
          console.log('Got fresh ID token, creating session cookie...');
          await createSessionCookie(idToken);
        } catch (error) {
          console.error("Error creating session cookie:", error);
          // Continue anyway, as client-side auth will still work
        }
      } else {
        // User is signed out, clear the session cookie
        try {
          console.log('User signed out, clearing session cookie...');
          await fetch('/api/auth/session', {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (error) {
          console.error("Error clearing session cookie:", error);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (!result?.user) {
        throw new Error("No user returned from authentication");
      }
      
      // Create a session cookie for server-side authentication
      try {
        const idToken = await getIdToken(result.user);
        await createSessionCookie(idToken);
      } catch (error) {
        console.error("Error creating session cookie:", error);
        // Continue anyway, as client-side auth will still work
      }
      
      return result.user;
    } catch (error: any) {
      console.error("Sign in error:", error);
      throw error; // Preserve the original Firebase error for proper error handling
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (!result?.user) {
        throw new Error("No user returned from authentication");
      }
      
      // Create a session cookie for server-side authentication
      try {
        const idToken = await getIdToken(result.user);
        await createSessionCookie(idToken);
      } catch (error) {
        console.error("Error creating session cookie:", error);
        // Continue anyway, as client-side auth will still work
      }
      
      return result.user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error; // Preserve the original Firebase error for proper error handling
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('userRole');
      
      // Clear session cookie
      try {
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
      } catch (error) {
        console.error("Error clearing session cookie:", error);
        // Continue anyway
      }
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Redirect to home page to fully reset app state
      window.location.href = '/';
    } catch (error: any) {
      console.error("Sign out error:", error);
      throw error;
    }
  };
  
  // Helper function to create a session cookie
  const createSessionCookie = async (idToken: string) => {
    console.log('Creating session cookie with idToken length:', idToken.length);
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        // Add these options for better error handling
        credentials: 'include',
        cache: 'no-store',
      });
      
      console.log('Session cookie creation response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        console.error('Failed to create session cookie:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData.error || 'Unknown error'
        });
        
        throw new Error(errorData.error || 'Failed to create session');
      }
      
      console.log('Session cookie created successfully');
      return true;
    } catch (error) {
      console.error('Error creating session cookie:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}
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
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (authUser) {
        // User is signed in, create a session cookie
        try {
          const idToken = await getIdToken(authUser);
          await createSessionCookie(idToken);
        } catch (error) {
          console.error("Error creating session cookie:", error);
          // Continue anyway, as client-side auth will still work
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
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to create session');
    }
    
    return true;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  };
}
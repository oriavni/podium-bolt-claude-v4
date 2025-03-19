"use client";

import { useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
      return result.user;
    } catch (error: any) {
      console.error("Sign up error:", error);
      throw error; // Preserve the original Firebase error for proper error handling
    }
  };

  const signOut = async () => {
    try {
      // Clear local storage first
      localStorage.removeItem('userRole');
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Redirect to home page to fully reset app state
      window.location.href = '/';
    } catch (error: any) {
      console.error("Sign out error:", error);
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
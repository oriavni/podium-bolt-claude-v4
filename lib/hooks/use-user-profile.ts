"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/components/auth/auth-provider';
import type { UserProfile } from '@/lib/types';

export function useUserProfile() {
  const { user } = useAuthContext();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const userDocRef = doc(db, 'user_profiles', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<UserProfile, 'id'>;
          setProfile({
            id: user.uid,
            ...userData
          });
          
          // Update last seen time
          await setDoc(userDocRef, {
            lastSeenAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // Profile doesn't exist
          setProfile(null);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const updateProfile = async (profileData: Partial<Omit<UserProfile, 'id'>>) => {
    if (!user?.uid) {
      return { success: false, error: new Error('User not logged in') };
    }
    
    try {
      setError(null);
      const userDocRef = doc(db, 'user_profiles', user.uid);
      
      // Add metadata
      await setDoc(userDocRef, { 
        ...profileData,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      
      // Update local state
      if (profile) {
        setProfile({ ...profile, ...profileData });
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error updating user profile:", err);
      const error = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(error);
      return { success: false, error };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
}
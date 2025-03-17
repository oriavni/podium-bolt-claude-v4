"use client";

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/components/auth/auth-provider';
import type { UserRole } from '@/lib/types';

export function useUserRole() {
  const { user } = useAuthContext();
  const [role, setRole] = useState<UserRole>("fan");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserRole() {
      if (!user?.uid) {
        setRole("fan");
        setLoading(false);
        return;
      }

      try {
        // Always check localStorage first, which is updated on signup and role change
        const storedRole = localStorage.getItem('userRole') as UserRole | null;
        
        // If we have a stored role, use it and sync to Firestore if needed
        if (storedRole) {
          console.log('Using role from localStorage:', storedRole);
          setRole(storedRole);
          
          // Make sure Firestore is in sync with localStorage
          const userDocRef = doc(db, 'user_profiles', user.uid);
          await setDoc(userDocRef, {
            role: storedRole,
            lastSeenAt: new Date().toISOString()
          }, { merge: true });
          
          setLoading(false);
          return;
        }

        // If no localStorage role, try to get it from Firestore
        const userDocRef = doc(db, 'user_profiles', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const firestoreRole = userData.role as UserRole;
          console.log('Using role from Firestore:', firestoreRole);
          
          // Set state and localStorage
          setRole(firestoreRole);
          localStorage.setItem('userRole', firestoreRole);
          
          // Update last seen time
          await setDoc(userDocRef, {
            lastSeenAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // Create a default profile if none exists
          console.log('No profile found, creating default fan profile');
          const defaultRole: UserRole = "fan";
          await setDoc(userDocRef, {
            role: defaultRole,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            verified: false,
            followerCount: 0,
            followingCount: 0,
            songCount: 0,
            bio: null,
            avatarUrl: user.photoURL,
            website: null,
            location: null,
            socialLinks: {}
          });
          
          setRole(defaultRole);
          localStorage.setItem('userRole', defaultRole);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserRole();
  }, [user]);

  const updateUserRole = async (newRole: UserRole) => {
    if (!user?.uid) return false;
    
    try {
      const userDocRef = doc(db, 'user_profiles', user.uid);
      await setDoc(userDocRef, { 
        role: newRole,
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      
      setRole(newRole);
      localStorage.setItem('userRole', newRole);
      return true;
    } catch (error) {
      console.error("Error updating user role:", error);
      return false;
    }
  };

  return {
    role,
    loading,
    updateUserRole,
    isMusician: role === "musician",
    isProfessional: role === "professional",
    isAdmin: role === "admin",
    isFan: role === "fan",
    isMedia: role === "media",
    isInfluencer: role === "influencer"
  };
}
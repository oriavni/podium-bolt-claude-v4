"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/hooks/use-auth";
import { AlertCircle } from "lucide-react";
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserRole } from '@/lib/types';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("fan");
  const [mediaOutlet, setMediaOutlet] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Force loading state to reset when dialog closes
  useEffect(() => {
    if (!open) {
      setLoading(false);
    }
  }, [open]);
  const { signIn, signUp } = useAuth();

  const getErrorMessage = (error: any): string => {
    if (error?.code === 'auth/email-already-in-use') {
      return "This email is already registered. Please sign in instead.";
    }
    if (error?.code === 'auth/invalid-email') {
      return "Please enter a valid email address.";
    }
    if (error?.code === 'auth/weak-password') {
      return "Password should be at least 6 characters long.";
    }
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password') {
      return "Invalid email or password.";
    }
    return error?.message || "An error occurred. Please try again.";
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setDisplayName("");
    setMediaOutlet("");
    setError(null);
  };

  // Use a non-async function to ensure proper loading state management
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Use a safety timeout to ensure loading state is never stuck for more than 10 seconds
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
    }, 10000);

    // Create or sign in the user
    if (isSignUp) {
      // First create the user
      signUp(email, password)
        .then(userCredential => {
          // Set role in localStorage immediately
          localStorage.setItem('userRole', role);
          
          // Then create the user profile in Firestore
          return setDoc(doc(db, 'user_profiles', userCredential.uid), {
            role,
            displayName: displayName || email.split('@')[0],
            email: userCredential.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
            verified: false,
            followerCount: 0,
            followingCount: 0,
            songCount: 0,
            bio: null,
            avatarUrl: null,
            website: null,
            location: null,
            socialLinks: {},
            ...(role === 'media' && { 
              mediaOutlet,
              approvedByAdmin: false
            })
          }).catch(profileError => {
            console.error("Error creating profile:", profileError);
            // Continue anyway
            return userCredential;
          });
        })
        .then(() => {
          // Success - close the dialog
          resetForm();
          clearTimeout(safetyTimeout);
          setLoading(false);
          onOpenChange(false);
        })
        .catch(error => {
          console.error("Auth error:", error);
          setError(getErrorMessage(error));
          clearTimeout(safetyTimeout);
          setLoading(false);
        });
    } else {
      // Sign in
      signIn(email, password)
        .then(() => {
          resetForm();
          clearTimeout(safetyTimeout);
          setLoading(false);
          onOpenChange(false);
        })
        .catch(error => {
          console.error("Auth error:", error);
          setError(getErrorMessage(error));
          clearTimeout(safetyTimeout);
          setLoading(false);
        });
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          {isSignUp && (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should we call you?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <select
                  id="role"
                  className="w-full h-10 px-3 rounded-md border bg-background"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                >
                  <option value="fan">Music Fan (Crowd)</option>
                  <option value="musician">Musician (Creator)</option>
                  <option value="professional">Industry Pro (Gatekeeper)</option>
                  <option value="influencer">Influencer (Trendsetter)</option>
                  <option value="media">Media Person (Publisher)</option>
                </select>
              </div>

              {role === 'media' && (
                <div className="space-y-2">
                  <Label htmlFor="mediaOutlet">Media Outlet</Label>
                  <Input
                    id="mediaOutlet"
                    value={mediaOutlet}
                    onChange={(e) => setMediaOutlet(e.target.value)}
                    placeholder="Name of publication, blog, etc."
                    required={role === 'media'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Media accounts require admin approval before full access is granted.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
            onClick={() => {
              // This prevents the button from appearing stuck if form validation fails
              if (loading) setTimeout(() => setLoading(false), 5000);
            }}
          >
            {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={toggleMode}
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
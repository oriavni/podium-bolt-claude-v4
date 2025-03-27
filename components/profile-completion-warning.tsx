"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { useUserProfile } from "@/lib/hooks/use-user-profile";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Info, CheckCircle } from "lucide-react";
import { profileRequirements } from "@/lib/types";

interface ProfileCompletionWarningProps {
  showDialog?: boolean;
  redirectUrl?: string;
  blockedAction?: string;
}

export function ProfileCompletionWarning({
  showDialog = false,
  redirectUrl = "/profile/setup",
  blockedAction = "this action"
}: ProfileCompletionWarningProps) {
  const { user } = useAuthContext();
  const { role } = useUserRole();
  const { profile } = useUserProfile();
  const [isDialogOpen, setIsDialogOpen] = useState(showDialog);
  const [showBanner, setShowBanner] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if profile is incomplete
    if (user && profile && !profile.profileCompleted) {
      setShowBanner(true);
      
      // Show dialog if specified
      if (showDialog) {
        setIsDialogOpen(true);
      }
    } else {
      setShowBanner(false);
      setIsDialogOpen(false);
    }
  }, [user, profile, showDialog]);

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    if (!profile) return 0;
    
    const requiredFields = profileRequirements[role].filter(field => field.required);
    const completedFields = requiredFields.filter(field => {
      const value = profile[field.field as keyof typeof profile];
      return value && (
        typeof value === 'string' ? value.trim() !== '' : 
        Array.isArray(value) ? value.length > 0 : 
        typeof value === 'object' ? Object.values(value).some(v => v && v !== '') : 
        true
      );
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  // Get missing fields
  const getMissingFields = () => {
    if (!profile) return [];
    
    const requiredFields = profileRequirements[role].filter(field => field.required);
    return requiredFields.filter(field => {
      const value = profile[field.field as keyof typeof profile];
      return !value || (
        typeof value === 'string' ? value.trim() === '' : 
        Array.isArray(value) ? value.length === 0 : 
        typeof value === 'object' ? !Object.values(value).some(v => v && v !== '') : 
        false
      );
    });
  };

  // Handle redirect to complete profile
  const handleCompleteProfile = () => {
    setIsDialogOpen(false);
    router.push(redirectUrl);
  };

  // Don't render anything if there's no issue
  if (!showBanner && !isDialogOpen) {
    return null;
  }

  const completionPercentage = calculateCompletion();
  const missingFields = getMissingFields();

  return (
    <>
      {showBanner && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950 dark:border-amber-700 mb-6">
          <div className="flex gap-2">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <AlertTitle>Complete your profile</AlertTitle>
          </div>
          <AlertDescription className="flex flex-col gap-2 mt-2">
            <p>
              Your profile is {completionPercentage}% complete. 
              {profile?.approvalStatus === 'pending' 
                ? " Once approved, you'll need to complete your profile to access all features."
                : " Complete your profile to unlock all platform features."}
            </p>
            <div className="flex items-center w-full mt-1">
              <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{completionPercentage}%</span>
            </div>
            <div className="flex justify-end">
              <Button 
                size="sm" 
                variant="secondary"
                className="mt-2"
                onClick={handleCompleteProfile}
              >
                Complete Profile
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Complete Your Profile
            </DialogTitle>
            <DialogDescription>
              You're almost ready! Complete your profile to unlock full platform access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex items-center w-full mb-4">
              <div className="w-full bg-muted rounded-full h-2.5 mr-2">
                <div 
                  className="bg-amber-500 h-2.5 rounded-full" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              <span className="text-xs font-medium">{completionPercentage}%</span>
            </div>
            
            <p className="mb-4">
              {profile?.approvalStatus === 'pending' 
                ? "Your account is awaiting approval. In the meantime, you can complete your profile."
                : `You need to complete your profile before you can ${blockedAction}.`}
            </p>
            
            {missingFields.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="font-medium">Missing information:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {missingFields.map(field => (
                    <li key={field.field} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>{field.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between flex-row">
            <Button 
              type="button" 
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
            >
              Later
            </Button>
            <Button 
              type="button"
              onClick={handleCompleteProfile}
            >
              Complete Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function ApprovalPendingPage() {
  const { user } = useAuthContext();
  const { role } = useUserRole();
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected'>("pending");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'user_profiles', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If the user is approved or doesn't need approval, redirect them
          if (userData.approvalStatus === 'approved' || 
              userData.approvedByAdmin === true || 
              (!['professional', 'media', 'influencer'].includes(userData.role))) {
            router.push('/profile/setup');
            return;
          }
          
          // Set the approval status
          setApprovalStatus(userData.approvalStatus || 'pending');
        }
      } catch (error) {
        console.error("Error checking approval status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkApprovalStatus();
  }, [user, router]);

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-64 bg-secondary rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl">Account Approval</CardTitle>
          <CardDescription>
            {approvalStatus === 'pending' 
              ? "Your account is pending approval from our administrative team." 
              : approvalStatus === 'approved'
              ? "Your account has been approved!"
              : "Your account application was not approved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {approvalStatus === 'pending' ? (
            <div className="flex flex-col items-center py-8 text-center space-y-4">
              <div className="rounded-full bg-amber-100 p-4 mb-2">
                <Clock className="h-12 w-12 text-amber-600" />
              </div>
              <h2 className="text-xl font-semibold">Your account is under review</h2>
              <p className="text-muted-foreground max-w-md">
                Our team is reviewing your {role} account information. 
                This process typically takes 1-2 business days. 
                We'll notify you by email when your account is approved.
              </p>
              <div className="mt-6 space-y-4 w-full max-w-xs">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Return to Home Page
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/contact')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          ) : approvalStatus === 'approved' ? (
            <div className="flex flex-col items-center py-8 text-center space-y-4">
              <div className="rounded-full bg-green-100 p-4 mb-2">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold">Your account has been approved!</h2>
              <p className="text-muted-foreground max-w-md">
                Congratulations! Your {role} account has been approved 
                and you now have full access to Podium. Complete your profile to get started.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={() => router.push('/profile/setup')}
                >
                  Complete Your Profile
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center space-y-4">
              <div className="rounded-full bg-destructive/10 p-4 mb-2">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Account Not Approved</h2>
              <p className="text-muted-foreground max-w-md">
                Unfortunately, we were unable to approve your {role} account at this time. 
                This could be due to incomplete information or other verification issues.
              </p>
              <div className="mt-6 space-y-4 w-full max-w-xs">
                <Button 
                  variant="default" 
                  className="w-full"
                  onClick={() => router.push('/contact')}
                >
                  Contact Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  Return to Home Page
                </Button>
              </div>
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <CardDescription>
              <strong>Note:</strong> If you haven't received any updates after 48 hours, please contact our support team.
            </CardDescription>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
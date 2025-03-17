"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useUserRole } from "@/lib/hooks/use-user-role";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import MusicProDashboard from "@/components/dashboard/music-pro-dashboard";
import CreatorDashboard from "@/components/dashboard/creator-dashboard";
import InfluencerDashboard from "@/components/dashboard/influencer-dashboard";
import CrowdDashboard from "@/components/dashboard/crowd-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { role, updateUserRole, loading } = useUserRole();
  const [updateMessage, setUpdateMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Handle role switching (persists to Firebase)
  const handleRoleChange = async (newRole: string) => {
    if (!updateUserRole) return;
    
    const success = await updateUserRole(newRole as any);
    
    if (success) {
      setUpdateMessage({
        type: 'success',
        text: `Your role has been updated to ${newRole}. Your dashboard view has changed accordingly.`
      });
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setUpdateMessage(null);
      }, 5000);
    } else {
      setUpdateMessage({
        type: 'error',
        text: 'There was an error updating your role. Please try again.'
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in to view your dashboard</h1>
          <p>You need to be signed in to access your personalized dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Map role to dashboard component
  const getDashboardForRole = () => {
    switch(role) {
      case 'admin':
        return <AdminDashboard />;
      case 'professional':
        return <MusicProDashboard />;
      case 'musician':
        return <CreatorDashboard />;
      case 'influencer':
      case 'media':
        return <InfluencerDashboard />;
      case 'fan':
      default:
        return <CrowdDashboard />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Status message */}
      {updateMessage && (
        <Alert 
          className={`mb-6 ${updateMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {updateMessage.type === 'success' ? 'Success!' : 'Error!'}
          </AlertTitle>
          <AlertDescription>
            {updateMessage.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Role switcher */}
      <div className="mb-6 p-4 bg-secondary/30 rounded-lg backdrop-blur-sm">
        <h3 className="font-medium mb-2">View Dashboard As:</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={role === 'admin' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </Button>
          <Button 
            variant={role === 'professional' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => handleRoleChange('professional')}
          >
            Music Pro
          </Button>
          <Button 
            variant={role === 'musician' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => handleRoleChange('musician')}
          >
            Creator
          </Button>
          <Button 
            variant={role === 'influencer' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => handleRoleChange('influencer')}
          >
            Influencer
          </Button>
          <Button 
            variant={role === 'fan' ? 'default' : 'secondary'}
            size="sm"
            className="rounded-full"
            onClick={() => handleRoleChange('fan')}
          >
            Crowd
          </Button>
        </div>
      </div>

      {/* Render the appropriate dashboard */}
      {getDashboardForRole()}
    </div>
  );
}
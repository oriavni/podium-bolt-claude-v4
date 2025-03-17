"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Volume2, Bell, Shield, Eye, Moon, Sun } from "lucide-react";

interface UserSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSettingsDialog({ open, onOpenChange }: UserSettingsDialogProps) {
  const [autoplayPreviews, setAutoplayPreviews] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoplayPreviews') !== 'false';
    }
    return true;
  });
  
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  const handleAutoplayChange = (checked: boolean) => {
    setAutoplayPreviews(checked);
    localStorage.setItem('autoplayPreviews', checked.toString());
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Audio Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Audio Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay-previews" className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  Autoplay Song Previews
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically play 20-second previews when hovering over songs
                </p>
              </div>
              <Switch
                id="autoplay-previews"
                checked={autoplayPreviews}
                onCheckedChange={handleAutoplayChange}
              />
            </div>
          </div>
          
          {/* Other Settings (for UI completeness) */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Display Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode" className="flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Dark Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Notification Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Push Notifications
                </Label>
                <p className="text-xs text-muted-foreground">
                  Receive notifications for new activity
                </p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Privacy Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacy-mode" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Private Listening Mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Hide your listening activity from other users
                </p>
              </div>
              <Switch
                id="privacy-mode"
                checked={privacyMode}
                onCheckedChange={setPrivacyMode}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
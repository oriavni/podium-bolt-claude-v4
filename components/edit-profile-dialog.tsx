"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface EditProfileDialogProps {
  profile: {
    name: string;
    bio?: string;
    avatar_url?: string;
    location?: string;
    website?: string;
    social_links?: {
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedData: any) => void;
}

export function EditProfileDialog({
  profile,
  open,
  onOpenChange,
  onSave
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    name: profile.name,
    bio: profile.bio || "",
    location: profile.location || "",
    website: profile.website || "",
    social_links: {
      twitter: profile.social_links?.twitter || "",
      instagram: profile.social_links?.instagram || "",
      youtube: profile.social_links?.youtube || ""
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement with Supabase
      onSave(formData);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  bio: e.target.value
                }))}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: e.target.value
                }))}
                placeholder="City, Country"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  website: e.target.value
                }))}
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="grid gap-4">
            <h3 className="text-sm font-medium">Social Links</h3>
            
            <div className="grid gap-2">
              <Label htmlFor="twitter">Twitter Username</Label>
              <Input
                id="twitter"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: {
                    ...prev.social_links,
                    twitter: e.target.value
                  }
                }))}
                placeholder="username"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instagram">Instagram Username</Label>
              <Input
                id="instagram"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: {
                    ...prev.social_links,
                    instagram: e.target.value
                  }
                }))}
                placeholder="username"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="youtube">YouTube Channel</Label>
              <Input
                id="youtube"
                value={formData.social_links.youtube}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_links: {
                    ...prev.social_links,
                    youtube: e.target.value
                  }
                }))}
                placeholder="channel"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.name.trim() || isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
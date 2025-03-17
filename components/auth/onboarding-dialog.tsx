"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/hooks/use-auth";
import { AlertCircle } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '@/lib/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface OnboardingStep {
  title: string;
  fields: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required?: boolean;
    showIf?: (data: any) => boolean;
  }[];
}

const STEPS: OnboardingStep[] = [
  {
    title: "Tell us about yourself",
    fields: [
      {
        name: "displayName",
        label: "Display Name",
        type: "text",
        placeholder: "How should we call you?",
        required: true
      },
      {
        name: "role",
        label: "I am a...",
        type: "select",
        required: true,
        options: [
          { value: "musician", label: "Musician" },
          { value: "professional", label: "Industry Professional" },
          { value: "fan", label: "Music Fan" },
          { value: "media", label: "Media Person" }
        ]
      },
      {
        name: "mediaOutlet",
        label: "Media Outlet",
        type: "text",
        placeholder: "Name of publication, blog, etc.",
        required: true,
        showIf: (data) => data.role === 'media'
      }
    ]
  },
  {
    title: "Complete your profile",
    fields: [
      {
        name: "bio",
        label: "Bio",
        type: "textarea",
        placeholder: "Tell us about yourself..."
      },
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "City, Country"
      }
    ]
  }
];

export function OnboardingDialog({ open, onOpenChange }: OnboardingDialogProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: "",
    role: "fan" as UserRole,
    bio: "",
    location: "",
    mediaOutlet: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      setFormData({
        displayName: "",
        role: "fan",
        bio: "",
        location: "",
        mediaOutlet: ""
      });
      setError(null);
    }
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    const stepFields = STEPS[step].fields;
    const requiredFields = stepFields.filter(field => 
      field.required && (!field.showIf || field.showIf(formData))
    );
    
    for (const field of requiredFields) {
      const value = formData[field.name as keyof typeof formData];
      if (!value || value.trim() === "") {
        setError(`${field.label} is required`);
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!user) {
      setError("No authenticated user found");
      return;
    }
    
    if (!validateStep(currentStep)) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: user.id,
            role: formData.role,
            display_name: formData.displayName,
            bio: formData.bio || null,
            location: formData.location || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_seen_at: new Date().toISOString(),
            verified: false,
            follower_count: 0,
            following_count: 0,
            song_count: 0,
            ...(formData.role === 'media' && {
              mediaOutlet: formData.mediaOutlet,
              approvedByAdmin: false
            })
          }
        ]);

      if (error) throw error;
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      setError(error.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{currentStepData.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>

          <div className="space-y-4">
            {currentStepData.fields.map((field) => {
              // Skip fields that shouldn't be shown based on current form data
              if (field.showIf && !field.showIf(formData)) {
                return null;
              }
              
              return (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.type === "select" ? (
                    <select
                      id={field.name}
                      className="w-full h-10 px-3 rounded-md border bg-background"
                      value={formData[field.name as keyof typeof formData]}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <Textarea
                      id={field.name}
                      placeholder={field.placeholder}
                      value={formData[field.name as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={formData[field.name as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
            
            {formData.role === 'media' && currentStep === 0 && (
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-md text-sm">
                <p>Media accounts require admin approval before full access is granted. You'll be notified once your account is approved.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button 
            className={currentStep === 0 ? "w-full" : ""}
            onClick={handleNext}
            disabled={loading}
          >
            {loading ? "Saving..." : isLastStep ? "Complete Setup" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
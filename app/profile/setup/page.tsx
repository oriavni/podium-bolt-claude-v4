"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/auth-provider";
import { useUserRole } from "@/lib/hooks/use-user-role";
import { useUserProfile } from "@/lib/hooks/use-user-profile";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Upload,
  Trash
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { profileRequirements, type UserRole } from "@/lib/types";

// Create a form schema based on role
const createFormSchema = (role: UserRole) => {
  const baseSchema = {
    displayName: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    location: z.string().optional(),
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    socialLinks: z.object({
      twitter: z.string().optional().or(z.literal("")),
      instagram: z.string().optional().or(z.literal("")),
      youtube: z.string().optional().or(z.literal("")),
      tiktok: z.string().optional().or(z.literal("")),
      facebook: z.string().optional().or(z.literal(""))
    }).optional()
  };

  if (role === "musician") {
    return z.object({
      ...baseSchema,
      genres: z.array(z.string()).min(1, "Select at least one genre"),
      instruments: z.array(z.string()).optional(),
    });
  } else if (role === "professional") {
    return z.object({
      ...baseSchema,
      professionalTitle: z.string().min(2, "Professional title is required"),
      company: z.string().optional(),
      services: z.array(z.object({
        name: z.string().min(2, "Service name is required"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        price: z.number().min(0, "Price must be a positive number"),
        currency: z.string().default("USD"),
        isPublic: z.boolean().default(true)
      })).optional(),
      availableForWork: z.boolean().default(true)
    });
  } else if (role === "media") {
    return z.object({
      ...baseSchema,
      mediaOutlet: z.string().min(2, "Media outlet name is required")
    });
  } else if (role === "influencer") {
    return z.object({
      ...baseSchema,
      audience: z.string().min(2, "Audience description is required"),
      reachStats: z.array(z.object({
        platform: z.string().min(2, "Platform name is required"),
        followers: z.number().min(0, "Followers must be a positive number"),
        avgEngagement: z.number().min(0, "Engagement must be a positive number")
      })).optional()
    });
  }

  // Default schema for fans and admins
  return z.object(baseSchema);
};

export default function ProfileSetupPage() {
  const { user } = useAuthContext();
  const { role, isMusician, isProfessional, isMedia, isInfluencer } = useUserRole();
  const { profile, updateProfile } = useUserProfile();
  const [activeTab, setActiveTab] = useState("basic");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { uploadFile, isUploading } = useFileUpload();
  const router = useRouter();

  // Create form steps based on role
  const profileSteps = [
    { id: "basic", label: "Basic Info" },
    ...(isMusician ? [{ id: "music", label: "Music Profile" }] : []),
    ...(isProfessional ? [{ id: "services", label: "Services" }] : []),
    ...(isMedia ? [{ id: "media", label: "Media Details" }] : []),
    ...(isInfluencer ? [{ id: "audience", label: "Audience" }] : []),
    { id: "socials", label: "Social Media" },
    { id: "photo", label: "Profile Photo" }
  ];

  // Initialize form with dynamic schema based on role
  const form = useForm({
    resolver: zodResolver(createFormSchema(role)),
    defaultValues: {
      displayName: profile?.displayName || user?.displayName || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      socialLinks: profile?.socialLinks || {
        twitter: "",
        instagram: "",
        youtube: "",
        tiktok: "",
        facebook: ""
      },
      ...(isMusician && {
        genres: profile?.genres || [],
        instruments: profile?.instruments || []
      }),
      ...(isProfessional && {
        professionalTitle: profile?.professionalTitle || "",
        company: profile?.company || "",
        services: profile?.services || [],
        availableForWork: profile?.availableForWork !== undefined ? profile.availableForWork : true
      }),
      ...(isMedia && {
        mediaOutlet: profile?.mediaOutlet || ""
      }),
      ...(isInfluencer && {
        audience: profile?.audience || "",
        reachStats: profile?.reachStats || []
      })
    }
  });
  
  // Handle avatar file selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setAvatarPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // First upload avatar if provided
      let avatarUrl = profile?.avatarUrl;
      
      if (avatarFile) {
        const result = await uploadFile(avatarFile, { fileType: 'image' });
        if (result) {
          avatarUrl = result.url;
        }
      }
      
      // Update profile in Firestore
      const profileData = {
        ...data,
        avatarUrl,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      };
      
      await updateProfile(profileData);
      
      // Redirect to dashboard or profile page
      router.push('/dashboard');
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigate to next step
  const nextStep = () => {
    if (currentStep < profileSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setActiveTab(profileSteps[currentStep + 1].id);
    }
  };
  
  // Navigate to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setActiveTab(profileSteps[currentStep - 1].id);
    }
  };
  
  // Update active tab when step changes
  useEffect(() => {
    setActiveTab(profileSteps[currentStep].id);
  }, [currentStep, profileSteps]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user && !profile?.id) {
      router.push('/');
    }
  }, [user, profile, router]);
  
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

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Let's set up your {role} profile to get the most out of Podium
        </p>
      </div>
      
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile completion required</AlertTitle>
        <AlertDescription>
          {isMusician ? 
            "You need to complete your profile before you can upload songs or launch campaigns." : 
            isProfessional || isMedia || isInfluencer ? 
            "You need to complete your profile to offer services and interact with musicians." : 
            "Complete your profile to get personalized music recommendations."}
        </AlertDescription>
      </Alert>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Profile Setup ({currentStep + 1}/{profileSteps.length})</CardTitle>
                  <CardDescription>
                    {currentStep === 0 
                      ? "Let's start with the basics" 
                      : currentStep === profileSteps.length - 1 
                      ? "Almost done!" 
                      : `Step ${currentStep + 1} of ${profileSteps.length}`}
                  </CardDescription>
                </div>
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                  {avatarPreview || profile?.avatarUrl ? (
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarPreview || profile?.avatarUrl || ""} alt="Profile" />
                      <AvatarFallback>
                        {profile?.displayName?.[0] || form.getValues("displayName")?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <span className="text-5xl text-muted-foreground">
                      {profile?.displayName?.[0] || form.getValues("displayName")?.[0] || "U"}
                    </span>
                  )}
                </div>
              </div>
              
              <Tabs 
                value={activeTab} 
                onValueChange={tab => {
                  setActiveTab(tab);
                  setCurrentStep(profileSteps.findIndex(step => step.id === tab));
                }}
                className="mt-6"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {profileSteps.map((step, index) => (
                    <TabsTrigger 
                      key={step.id} 
                      value={step.id}
                      className="flex items-center gap-2"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs">
                        {index + 1}
                      </div>
                      <span className="hidden sm:inline">{step.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="How should others know you?" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem className="col-span-1 md:col-span-2">
                          <FormLabel>Bio *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell others about yourself..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="City, Country" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourwebsite.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                {isMusician && (
                  <TabsContent value="music" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="genres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Music Genres *</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => {
                                  const currentGenres = form.getValues("genres") || [];
                                  if (!currentGenres.includes(value)) {
                                    form.setValue("genres", [...currentGenres, value]);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select genres" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical", "Country", "Folk", "Metal", "Indie", "Other"].map(genre => (
                                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {form.getValues("genres")?.map((genre, index) => (
                                <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                                  {genre}
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4 rounded-full"
                                    onClick={() => {
                                      const currentGenres = form.getValues("genres") || [];
                                      form.setValue("genres", currentGenres.filter(g => g !== genre));
                                    }}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="instruments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instruments</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={(value) => {
                                  const currentInstruments = form.getValues("instruments") || [];
                                  if (!currentInstruments.includes(value)) {
                                    form.setValue("instruments", [...currentInstruments, value]);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select instruments" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["Guitar", "Piano", "Drums", "Bass", "Violin", "Saxophone", "Trumpet", "Flute", "Voice", "Synthesizer", "Other"].map(instrument => (
                                    <SelectItem key={instrument} value={instrument}>{instrument}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {form.getValues("instruments")?.map((instrument, index) => (
                                <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                                  {instrument}
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-4 w-4 rounded-full"
                                    onClick={() => {
                                      const currentInstruments = form.getValues("instruments") || [];
                                      form.setValue("instruments", currentInstruments.filter(i => i !== instrument));
                                    }}
                                  >
                                    <Trash className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                )}
                
                {isProfessional && (
                  <TabsContent value="services" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="professionalTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Professional Title *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Producer, A&R, Manager" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Company or organization name" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="availableForWork"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Available for Work</FormLabel>
                              <FormDescription>
                                Show that you're accepting new clients
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Services section - will be a more complex UI with add/remove capabilities */}
                    <div className="pt-6 border-t mt-6">
                      <h3 className="font-medium mb-4">Services Offered</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add the services you provide to musicians. You can add more later.
                      </p>
                      
                      {/* Simple service input for now - would be expanded in real application */}
                      <div className="space-y-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="serviceName">Service Name</Label>
                                <Input 
                                  id="serviceName" 
                                  placeholder="e.g. Music Production"
                                  className="mt-1" 
                                />
                              </div>
                              <div>
                                <Label htmlFor="servicePrice">Price</Label>
                                <Input 
                                  id="servicePrice" 
                                  placeholder="Price"
                                  type="number"
                                  className="mt-1" 
                                />
                              </div>
                              <div className="col-span-1 md:col-span-2">
                                <Label htmlFor="serviceDescription">Description</Label>
                                <Textarea 
                                  id="serviceDescription" 
                                  placeholder="Describe what this service includes..."
                                  className="mt-1" 
                                />
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button type="button" variant="outline">Add Service</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                {isMedia && (
                  <TabsContent value="media" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="mediaOutlet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Media Outlet *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Name of publication, blog, podcast, etc." 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                )}
                
                {isInfluencer && (
                  <TabsContent value="audience" className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="audience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Audience Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe who follows you and what type of content they engage with..." 
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Platform stats section - would be expanded in real application */}
                      <div className="pt-6 border-t mt-6">
                        <h3 className="font-medium mb-4">Platform Reach</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Add your social media platforms and their stats.
                        </p>
                        
                        <Card>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <Label htmlFor="platform">Platform</Label>
                                <Select>
                                  <SelectTrigger id="platform">
                                    <SelectValue placeholder="Select platform" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="tiktok">TikTok</SelectItem>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="twitter">Twitter/X</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="followers">Followers</Label>
                                <Input 
                                  id="followers" 
                                  placeholder="Number of followers"
                                  type="number"
                                  className="mt-1" 
                                />
                              </div>
                              <div>
                                <Label htmlFor="engagement">Avg. Engagement (%)</Label>
                                <Input 
                                  id="engagement" 
                                  placeholder="Engagement rate"
                                  type="number"
                                  className="mt-1" 
                                />
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button type="button" variant="outline">Add Platform</Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                )}
                
                <TabsContent value="socials" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                                @
                              </span>
                              <Input 
                                placeholder="username" 
                                className="rounded-l-none"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter/X</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                                @
                              </span>
                              <Input 
                                placeholder="username" 
                                className="rounded-l-none"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Channel name or URL" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="socialLinks.tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                                @
                              </span>
                              <Input 
                                placeholder="username" 
                                className="rounded-l-none"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="photo" className="space-y-4 mt-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-32 h-32 relative">
                      {avatarPreview || profile?.avatarUrl ? (
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={avatarPreview || profile?.avatarUrl || ""} alt="Profile" />
                          <AvatarFallback>
                            {profile?.displayName?.[0] || form.getValues("displayName")?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-5xl text-muted-foreground">
                            {profile?.displayName?.[0] || form.getValues("displayName")?.[0] || "U"}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center space-y-2">
                      <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md transition-colors">
                          <Upload className="h-4 w-4" />
                          <span>Upload Photo</span>
                        </div>
                        <input
                          id="avatar"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </Label>
                      
                      <p className="text-sm text-muted-foreground">
                        Square image recommended, at least 500x500 pixels
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardHeader>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              
              {currentStep < profileSteps.length - 1 ? (
                <Button 
                  type="button"
                  onClick={nextStep}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={isSubmitting || isUploading}
                >
                  {isSubmitting || isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Profile
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
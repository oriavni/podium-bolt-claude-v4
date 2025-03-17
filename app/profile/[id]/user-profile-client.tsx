"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  Heart, 
  Clock, 
  Users, 
  Settings, 
  Edit2, 
  Calendar, 
  MapPin, 
  Link2, 
  BarChart,
  MessageSquare,
  Award,
  Star,
  Verified,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Globe
} from "lucide-react";
import { UserBadge } from "@/components/user-badge";
import { SongButton } from "@/components/song-button";
import { sampleSongs } from "@/app/data/sample-songs";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  mediaOutlet?: string;
  approvedByAdmin?: boolean;
  verified: boolean;
  coverImage?: string;
  professionalTitle?: string;
  company?: string;
  credentials?: string[];
  genres?: string[];
  instruments?: string[];
  social_links?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    website?: string;
  };
  stats: {
    songs: number;
    followers: number;
    following: number;
    likes: number;
    supportedSongs?: number;
  };
  joined_date: string;
}

interface UserProfileClientProps {
  userId: string;
}

export function UserProfileClient({ userId }: UserProfileClientProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userSongs, setUserSongs] = useState<any[]>([]);
  const [supportedSongs, setSupportedSongs] = useState<any[]>([]);

  useEffect(() => {
    // In a real app, we would fetch the user profile from Supabase
    // For now, we'll use mock data based on the ID
    
    // Simulate API call
    setTimeout(() => {
      // Generate a mock profile based on the ID
      const mockProfiles: Record<string, UserProfile> = {
        "musician-1": {
          id: "musician-1",
          role: "musician",
          name: "John Musician",
          email: "john@example.com",
          bio: "Electronic music producer and songwriter based in LA with over 10 years of experience. Specializing in ambient and downtempo electronic music with influences from classical and jazz.",
          avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&q=80",
          coverImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1400&h=400&q=80",
          location: "Los Angeles, CA",
          website: "https://johnmusician.com",
          verified: true,
          genres: ["Electronic", "Ambient", "Downtempo"],
          instruments: ["Synthesizer", "Piano", "Guitar"],
          social_links: {
            twitter: "johnmusician",
            instagram: "john.musician",
            youtube: "johnmusicianofficial",
            facebook: "johnmusicianofficial"
          },
          stats: {
            songs: 24,
            followers: 1234,
            following: 567,
            likes: 8901
          },
          joined_date: "2023-01-15"
        },
        "professional-1": {
          id: "professional-1",
          role: "professional",
          name: "Sarah Johnson",
          email: "sarah@example.com",
          bio: "A&R Director at Universal Music Group with a track record of discovering and developing platinum-selling artists. Specialized in pop and R&B genres.",
          avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&q=80",
          coverImage: "https://images.unsplash.com/photo-1516223725307-6f76b9ec8742?w=1400&h=400&q=80",
          location: "New York, NY",
          website: "https://sarahjohnson.com",
          verified: true,
          professionalTitle: "A&R Director",
          company: "Universal Music Group",
          credentials: ["15+ Years Experience", "Multi-Platinum Artists", "Grammy Committee Member"],
          social_links: {
            twitter: "sarahjohnson",
            instagram: "sarah.johnson",
            linkedin: "sarahjohnsonmusic"
          },
          stats: {
            songs: 0,
            followers: 2345,
            following: 345,
            likes: 567,
            supportedSongs: 284
          },
          joined_date: "2023-02-20"
        },
        "fan-1": {
          id: "fan-1",
          role: "fan",
          name: "Music Fan",
          email: "fan@example.com",
          bio: "Passionate music enthusiast with eclectic taste spanning from classical to electronic.",
          avatar_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=128&h=128&q=80",
          location: "Chicago, IL",
          verified: false,
          social_links: {
            twitter: "musicfan",
            instagram: "music.fan"
          },
          stats: {
            songs: 0,
            followers: 45,
            following: 230,
            likes: 789
          },
          joined_date: "2023-03-10"
        },
        "media-1": {
          id: "media-1",
          role: "media",
          name: "Jane Reporter",
          email: "jane@musicmag.com",
          bio: "Senior music journalist covering emerging artists and industry trends.",
          avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&q=80",
          coverImage: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=1400&h=400&q=80",
          location: "London, UK",
          website: "https://musicmagazine.com",
          mediaOutlet: "Music Magazine",
          approvedByAdmin: true,
          verified: true,
          social_links: {
            twitter: "janereporter",
            instagram: "jane.reporter"
          },
          stats: {
            songs: 0,
            followers: 567,
            following: 123,
            likes: 456
          },
          joined_date: "2023-04-05"
        }
      };

      // Get the profile or use a default one if not found
      const profile = mockProfiles[userId] || mockProfiles["musician-1"];
      setProfile(profile);

      // Generate mock songs for musicians
      if (profile.role === "musician") {
        // Use sample songs as user songs
        setUserSongs(sampleSongs.map(song => ({
          ...song,
          artist: profile.name // Set the artist name to the profile name
        })));
      }

      // Generate supported songs for professionals
      if (profile.role === "professional") {
        // Use sample songs as supported songs
        setSupportedSongs(sampleSongs.filter(song => 
          song.supporters.some(supporter => 
            supporter.role.includes("Director") || supporter.role.includes("Producer")
          )
        ));
      }

      setIsLoading(false);
    }, 1000);
  }, [userId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          {/* Cover image placeholder */}
          <div className="h-64 bg-secondary rounded-lg mb-8"></div>
          
          {/* Profile header placeholder */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="w-32 h-32 bg-secondary rounded-full"></div>
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-secondary rounded w-1/3"></div>
              <div className="h-4 bg-secondary rounded w-1/2"></div>
              <div className="h-4 bg-secondary rounded w-3/4"></div>
              <div className="flex gap-4">
                <div className="h-10 bg-secondary rounded w-24"></div>
                <div className="h-10 bg-secondary rounded w-24"></div>
              </div>
            </div>
          </div>
          
          {/* Tabs placeholder */}
          <div className="h-10 bg-secondary rounded mb-8"></div>
          
          {/* Content placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-secondary rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-secondary rounded"></div>
              <div className="h-40 bg-secondary rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <p className="text-muted-foreground">
          The user you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Determine which tabs to show based on user role
  const getTabs = () => {
    const commonTabs = [
      { id: "about", label: "About", icon: <Users className="w-4 h-4" /> },
      { id: "liked", label: "Liked", icon: <Heart className="w-4 h-4" /> },
    ];

    switch (profile.role) {
      case "musician":
        return [
          { id: "songs", label: "Songs", icon: <Music className="w-4 h-4" /> },
          ...commonTabs,
          { id: "stats", label: "Stats", icon: <BarChart className="w-4 h-4" /> },
        ];
      case "professional":
        return [
          { id: "supported", label: "Supported", icon: <Award className="w-4 h-4" /> },
          ...commonTabs,
        ];
      case "media":
        return [
          { id: "articles", label: "Articles", icon: <MessageSquare className="w-4 h-4" /> },
          ...commonTabs,
        ];
      default:
        return commonTabs;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover Image */}
      {profile.coverImage && (
        <div className="relative h-64 rounded-lg overflow-hidden mb-8">
          <img
            src={profile.coverImage}
            alt={`${profile.name}'s cover`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <Avatar className="w-32 h-32 border-4 border-background">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <UserBadge role={profile.role} verified={profile.verified} />
                {profile.role === "media" && profile.approvedByAdmin && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Star className="w-3 h-3 mr-1 fill-blue-500" /> Verified Media
                  </Badge>
                )}
              </div>
              {profile.professionalTitle && profile.company && (
                <p className="text-lg text-muted-foreground mb-2">
                  {profile.professionalTitle} at {profile.company}
                </p>
              )}
              {profile.mediaOutlet && (
                <p className="text-lg text-muted-foreground mb-2">
                  {profile.mediaOutlet}
                </p>
              )}
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
            </div>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Follow
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            {profile.location && (
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-4 h-4" /> Joined {formatDistanceToNow(new Date(profile.joined_date), { addSuffix: true })}
            </span>
          </div>

          {/* Social Links */}
          {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
            <div className="flex flex-wrap gap-4 mt-4">
              {profile.social_links.instagram && (
                <a
                  href={`https://instagram.com/${profile.social_links.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {profile.social_links.twitter && (
                <a
                  href={`https://twitter.com/${profile.social_links.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {profile.social_links.facebook && (
                <a
                  href={`https://facebook.com/${profile.social_links.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {profile.social_links.youtube && (
                <a
                  href={`https://youtube.com/${profile.social_links.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.stats.songs}</p>
              <p className="text-sm text-muted-foreground">Songs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.stats.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.stats.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{profile.stats.likes}</p>
              <p className="text-sm text-muted-foreground">Likes</p>
            </div>
            {profile.role === "professional" && profile.stats.supportedSongs && (
              <div className="text-center">
                <p className="text-2xl font-bold">{profile.stats.supportedSongs}</p>
                <p className="text-sm text-muted-foreground">Supported</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue={getTabs()[0].id} className="space-y-6">
        <TabsList>
          {getTabs().map(tab => (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-2">
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Songs Tab (Musicians) */}
        {profile.role === "musician" && (
          <TabsContent value="songs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSongs.length > 0 ? (
                userSongs.map(song => (
                  <SongButton key={song.id} song={song} className="cursor-pointer">
                    <div className="bg-secondary/50 rounded-lg overflow-hidden transition-transform hover:scale-[1.02]">
                      <div className="aspect-square relative">
                        <img 
                          src={song.coverUrl} 
                          alt={song.title} 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="lg" className="rounded-full w-16 h-16">
                            <Music className="w-8 h-8" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{song.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Heart className="w-4 h-4" />
                            <span>{song.likes}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Music className="w-4 h-4" />
                            <span>{song.plays}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SongButton>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Music className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No songs yet</h3>
                  <p className="text-muted-foreground">
                    This artist hasn't uploaded any songs yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Supported Tab (Professionals) */}
        {profile.role === "professional" && (
          <TabsContent value="supported" className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {supportedSongs.length > 0 ? (
                supportedSongs.map(song => (
                  <SongButton key={song.id} song={song} className="cursor-pointer">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        
                        {/* Find this professional's feedback */}
                        {song.supporters.filter(s => s.name === profile.name).map(supporter => (
                          <div key={supporter.id} className="mt-2 p-2 bg-secondary/50 rounded text-sm">
                            <p className="text-muted-foreground">"{supporter.comment}"</p>
                            <p className="text-xs text-muted-foreground mt-1">{supporter.date}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-xs">
                          {song.genre?.[0]}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Heart className="w-3 h-3" />
                          <span>{song.likes}</span>
                        </div>
                      </div>
                    </div>
                  </SongButton>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Award className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No supported songs yet</h3>
                  <p className="text-muted-foreground">
                    This professional hasn't supported any songs yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Articles Tab (Media) */}
        {profile.role === "media" && (
          <TabsContent value="articles" className="space-y-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No articles yet</h3>
              <p className="text-muted-foreground">
                This media person hasn't published any articles yet.
              </p>
            </div>
          </TabsContent>
        )}

        {/* About Tab (Common) */}
        <TabsContent value="about" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Bio Section */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">About</h3>
                <p className="text-muted-foreground">
                  {profile.bio || "No bio provided."}
                </p>
              </div>

              {/* Role-specific information */}
              {profile.role === "musician" && (
                <div className="bg-secondary/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Musical Information</h3>
                  
                  {profile.genres && profile.genres.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.genres.map(genre => (
                          <Badge key={genre} variant="secondary">{genre}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.instruments && profile.instruments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Instruments</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.instruments.map(instrument => (
                          <Badge key={instrument} variant="outline">{instrument}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profile.role === "professional" && (
                <div className="bg-secondary/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Professional Information</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Position</h4>
                    <p>{profile.professionalTitle} at {profile.company}</p>
                  </div>
                  
                  {profile.credentials && profile.credentials.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Credentials</h4>
                      <div className="flex flex-wrap gap-2">
                        {profile.credentials.map(credential => (
                          <Badge key={credential} variant="outline">{credential}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {profile.role === "media" && (
                <div className="bg-secondary/30 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Media Information</h3>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Media Outlet</h4>
                    <p>{profile.mediaOutlet}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn(
                      "text-xs",
                      profile.approvedByAdmin 
                        ? "bg-green-500/10 text-green-500 border-green-500/20" 
                        : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {profile.approvedByAdmin ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" /> Verified Media Account
                        </>
                      ) : (
                        <>Pending Verification</>
                      )}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Contact & Links */}
            <div className="space-y-6">
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Contact & Links</h3>
                
                <div className="space-y-4">
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  
                  {profile.social_links?.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`https://instagram.com/${profile.social_links.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.social_links.instagram}
                      </a>
                    </div>
                  )}
                  
                  {profile.social_links?.twitter && (
                    <div className="flex items-center gap-3">
                      <Twitter className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`https://twitter.com/${profile.social_links.twitter}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.social_links.twitter}
                      </a>
                    </div>
                  )}
                  
                  {profile.social_links?.facebook && (
                    <div className="flex items-center gap-3">
                      <Facebook className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`https://facebook.com/${profile.social_links.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.social_links.facebook}
                      </a>
                    </div>
                  )}
                  
                  {profile.social_links?.youtube && (
                    <div className="flex items-center gap-3">
                      <Youtube className="w-5 h-5 text-muted-foreground" />
                      <a 
                        href={`https://youtube.com/${profile.social_links.youtube}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.social_links.youtube}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Member Since</h3>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <span>{new Date(profile.joined_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Liked Tab (Common) */}
        <TabsContent value="liked" className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No liked songs yet</h3>
            <p className="text-muted-foreground">
              This user hasn't liked any songs yet.
            </p>
          </div>
        </TabsContent>

        {/* Stats Tab (Musicians) */}
        {profile.role === "musician" && (
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Listener Stats */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Listener Stats</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Plays</span>
                    <span className="font-medium">12,345</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unique Listeners</span>
                    <span className="font-medium">5,678</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Listen Time</span>
                    <span className="font-medium">2:45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Completion Rate</span>
                    <span className="font-medium">78%</span>
                  </div>
                </div>
                
                {/* Listener Trend Visualization */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">30-Day Trend</h4>
                  <div className="h-24 flex items-end gap-1">
                    {Array.from({ length: 30 }).map((_, i) => {
                      // Generate a random height for the bar between 20% and 100%
                      const height = 20 + Math.floor(Math.random() * 80);
                      return (
                        <div 
                          key={i} 
                          className="bg-primary/60 hover:bg-primary transition-colors rounded-t w-full"
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Audience Demographics */}
              <div className="bg-secondary/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Audience</h3>
                
                <div className="space-y-6">
                  {/* Listener Types */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Listener Types</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary rounded-full h-4">
                          <div className="bg-primary h-4 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-sm min-w-[40px] text-right">65%</span>
                        <span className="text-sm">Fans</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary rounded-full h-4">
                          <div className="bg-primary h-4 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-sm min-w-[40px] text-right">25%</span>
                        <span className="text-sm">Musicians</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-secondary rounded-full h-4">
                          <div className="bg-primary h-4 rounded-full" style={{ width: '10%' }}></div>
                        </div>
                        <span className="text-sm min-w-[40px] text-right">10%</span>
                        <span className="text-sm">Industry Pros</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Top Locations */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Top Locations</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>United States</span>
                        <span className="font-medium">42%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>United Kingdom</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Germany</span>
                        <span className="font-medium">12%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Canada</span>
                        <span className="font-medium">8%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Other</span>
                        <span className="font-medium">20%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
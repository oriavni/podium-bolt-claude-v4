"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Music, Heart, Clock, Users, Settings, Edit2 } from "lucide-react";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { useRouter } from "next/navigation";
import { SongButton } from "@/components/song-button";
import { sampleSongs } from "@/app/data/sample-songs";
import { UserBadge } from "@/components/user-badge";

interface UserProfile {
  id: string;
  role: 'creator' | 'professional' | 'user' | 'admin' | 'media';
  name: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  stats: {
    songs: number;
    followers: number;
    following: number;
    likes: number;
  };
  joined_date: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "1",
    role: "creator",
    name: "John Doe",
    email: "john@example.com",
    bio: "Music producer and songwriter based in LA",
    avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128&h=128&q=80",
    location: "Los Angeles, CA",
    website: "https://johndoe.com",
    social_links: {
      twitter: "johndoe",
      instagram: "johndoe.music",
      youtube: "johndoemusic"
    },
    stats: {
      songs: 12,
      followers: 1234,
      following: 567,
      likes: 890
    },
    joined_date: "2024-01-01"
  });
  const [userSongs, setUserSongs] = useState<any[]>([]);

  useEffect(() => {
    // Load user songs from localStorage or use sample songs
    const savedSongs = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('uploadedSongs') || '[]')
      : [];
    
    // If there are saved songs, use them; otherwise, use sample songs
    setUserSongs(savedSongs.length > 0 ? savedSongs : sampleSongs);
  }, []);

  const handleProfileUpdate = (updatedData: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updatedData }));
    setEditDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <Avatar className="w-32 h-32">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <UserBadge role={profile.role} verified={true} />
              </div>
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}
            </div>
            <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            {profile.location && (
              <span className="text-muted-foreground">📍 {profile.location}</span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                🌐 Website
              </a>
            )}
            {profile.social_links?.twitter && (
              <a
                href={`https://twitter.com/${profile.social_links.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                𝕏 Twitter
              </a>
            )}
            {profile.social_links?.instagram && (
              <a
                href={`https://instagram.com/${profile.social_links.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                📸 Instagram
              </a>
            )}
            {profile.social_links?.youtube && (
              <a
                href={`https://youtube.com/@${profile.social_links.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                📺 YouTube
              </a>
            )}
          </div>

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
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <Tabs defaultValue="songs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="songs" className="gap-2">
            <Music className="w-4 h-4" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="liked" className="gap-2">
            <Heart className="w-4 h-4" />
            Liked
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="w-4 h-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <Users className="w-4 h-4" />
            Following
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
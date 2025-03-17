"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, ThumbsUp, User } from "lucide-react";
import { type Song } from '@/app/data/sample-songs';
import Link from "next/link";

interface SharePageClientProps {
  song: Song;
}

export function SharePageClient({ song }: SharePageClientProps) {
  // Generate a profile link for the artist
  const getArtistProfileLink = () => {
    // For simplicity, we'll assume all artists are musicians
    return `/profile/musician-1`;
  };

  // Generate a profile link for supporters
  const getSupporterProfileLink = (supporter: any) => {
    // Determine the role type for the URL
    const roleType = supporter.role.toLowerCase().includes('director') || 
                    supporter.role.toLowerCase().includes('producer') ? 
                    'professional' : 'media';
    
    return `/profile/${roleType}-1`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{song.title}</h1>
            <Link 
              href={getArtistProfileLink()}
              className="text-xl md:text-2xl mb-6 hover:text-primary transition-colors inline-block"
            >
              {song.artist}
            </Link>
            <div className="mt-4">
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Play Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Song Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" />
              <span className="font-medium">{song.likes} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              <span className="font-medium">{song.plays} plays</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {song.supporters.length} supporters
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {song.genre?.map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
          </div>

          {/* Supporters */}
          {song.supporters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">
                Industry Support
              </h2>
              {song.supporters.map((supporter) => (
                <div
                  key={supporter.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <Link href={getSupporterProfileLink(supporter)}>
                    <Avatar>
                      <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                      <AvatarFallback>{supporter.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={getSupporterProfileLink(supporter)}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {supporter.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {supporter.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supporter.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Listen to more music from {song.artist} on Podium
            </p>
            <Button size="lg" variant="default" asChild>
              <a href="/">Open Podium</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
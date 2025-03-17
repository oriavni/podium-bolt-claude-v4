"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, Calendar, Verified, Filter, ChevronDown, Heart, Share2, Plus, Download, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { sampleSongs, type Song } from '@/app/data/sample-songs';
import { SongButton } from "@/components/song-button";
import Link from "next/link";

interface HomePageSong extends Song {
  status?: 'published' | 'scheduled';
  releaseDate?: string;
  size?: "small" | "medium" | "large";
}

export default function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [songs, setSongs] = useState<HomePageSong[]>([]);

  // Load songs on mount
  useEffect(() => {
    // Add size property to sample songs for grid layout
    const sampleSongsWithSize = sampleSongs.map((song, index) => ({
      ...song,
      size: index === 0 ? "large" : index % 2 === 0 ? "medium" : "small"
    }));

    // Get songs from localStorage and filter based on release status
    const savedSongs = typeof window !== 'undefined' 
      ? JSON.parse(localStorage.getItem('uploadedSongs') || '[]')
      : [];
    
    const now = new Date();

    const availableSongs = savedSongs.filter((song: HomePageSong) => {
      if (song.status === 'published') return true;
      if (song.status === 'scheduled' && song.releaseDate) {
        const releaseDate = new Date(song.releaseDate);
        return releaseDate <= now;
      }
      return false;
    });

    // Combine with sample songs
    setSongs([...sampleSongsWithSize, ...availableSongs]);
  }, []);

  const filteredSongs = songs.filter(song => {
    const matchesGenre = !selectedGenre || song.genre?.includes(selectedGenre);
    return matchesGenre;
  });

  const allGenres = Array.from(
    new Set(songs.flatMap(song => song.genre || []))
  ).sort();

  const formatNumber = (num: number | undefined): string => {
    if (typeof num !== 'number') return '0';
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Generate a profile link for the artist
  const getArtistProfileLink = (artistName: string) => {
    // For simplicity, we'll assume all artists are musicians
    return `/profile/musician-1`;
  };

  return (
    <div className="pb-8">
      {/* Filter Section */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-wrap gap-1.5">
            <Badge
              variant={selectedGenre === null ? "default" : "secondary"}
              className="cursor-pointer px-2 py-0.5 text-xs font-medium hover:bg-primary/90"
              onClick={() => setSelectedGenre(null)}
            >
              All
            </Badge>
            {allGenres.map((genre) => (
              <Badge
                key={genre}
                variant={selectedGenre === genre ? "default" : "secondary"}
                className={cn(
                  "cursor-pointer px-2 py-0.5 text-xs font-medium",
                  selectedGenre === genre ? "hover:bg-primary/90" : "hover:bg-secondary/80"
                )}
                onClick={() => setSelectedGenre(genre)}
              >
                {genre}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="p-6">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
          {filteredSongs.map((song) => {
            const aspectRatio = song.size === "small" ? "aspect-[3/4]" : 
                              song.size === "medium" ? "aspect-square" : 
                              "aspect-[4/3]";
            
            return (
              <div
                key={song.id}
                className="break-inside-avoid mb-4 group"
              >
                <SongButton 
                  song={song}
                  className="cursor-pointer"
                >
                  {/* Main card with image and hover effects */}
                  <div
                    className={cn(
                      "relative rounded-t-lg overflow-hidden shadow-lg transition-transform duration-200 hover:scale-[1.02]",
                      aspectRatio
                    )}
                    onMouseEnter={() => setHoveredId(song.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Always visible overlay for title and artist */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-4">
                      <h3 className="text-white font-semibold">{song.title}</h3>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Link 
                          href={getArtistProfileLink(song.artist)}
                          className="text-white/80 text-sm hover:text-primary/90 transition-colors"
                        >
                          {song.artist}
                        </Link>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200",
                      hoveredId === song.id ? "opacity-100" : "opacity-0"
                    )}>
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex justify-end space-x-2">
                          <button className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white">
                            <Heart className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white">
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info block */}
                  <div className="bg-secondary/50 rounded-b-lg p-3 space-y-2">
                    {/* Support information */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {song.supporters?.slice(0, 2).map((supporter) => (
                            <div key={supporter.id} onClick={(e) => e.stopPropagation()}>
                              <Link 
                                href={`/profile/${supporter.role.toLowerCase().includes('director') ? 'professional' : 'media'}-1`}
                              >
                                <Avatar 
                                  className="w-6 h-6 border-2 border-background"
                                >
                                  <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                                  <AvatarFallback>{supporter.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                              </Link>
                            </div>
                          ))}
                        </div>
                        {song.supporters && song.supporters.length > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{song.supporters.length - 2}
                          </span>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Link 
                            href={`/profile/professional-1`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            {song.supporters?.length || 0} {song.supporters?.length === 1 ? 'supporter' : 'supporters'}
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="text-xs">{formatNumber(song.likes)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {song.genre?.map(g => (
                        <Badge 
                          key={g} 
                          variant="secondary" 
                          className="text-[10px] px-1.5 py-0"
                        >
                          {g}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </SongButton>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
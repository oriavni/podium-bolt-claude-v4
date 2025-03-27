"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/types";
import { SongPreviewPlayer } from "@/components/song-preview-player";
import { SongSupportersDisplay } from "@/components/song-supporters-display";
import { Play, BarChart2, Share, MessageCircle } from "lucide-react";
import Link from "next/link";

interface SongCardProps {
  song: Song;
  onClick?: () => void;
  showFooter?: boolean;
  showStats?: boolean;
  showSupporters?: boolean;
}

export function SongCard({ 
  song, 
  onClick, 
  showFooter = true,
  showStats = true,
  showSupporters = true 
}: SongCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const handleSongClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card 
      className="overflow-hidden group transition-all hover:shadow-md cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleSongClick}
    >
      <div className="aspect-square relative">
        <img 
          src={song.coverUrl} 
          alt={`${song.title} by ${song.artist}`}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button 
            size="icon" 
            variant="secondary" 
            className="h-12 w-12 rounded-full"
          >
            <Play className="h-6 w-6" />
          </Button>
        </div>
        
        <SongPreviewPlayer 
          song={song} 
          isHovering={isHovering}
        />
        
        {showSupporters && song.supporters.length > 0 && (
          <div className="absolute bottom-2 left-2">
            <SongSupportersDisplay 
              supporters={song.supporters} 
              size="sm"
              maxVisible={4}
            />
          </div>
        )}
      </div>
      
      <CardContent className="pt-3">
        <div className="space-y-1">
          <h3 className="font-medium text-sm leading-tight line-clamp-1">
            {song.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            {song.artist}
          </p>
        </div>
        
        {showStats && (
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BarChart2 className="h-3 w-3" />
              <span>{formatNumber(song.plays)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              <span>{song.supporters.length}</span>
            </div>
          </div>
        )}
      </CardContent>
      
      {showFooter && (
        <CardFooter className="pt-0 pb-3 flex justify-between">
          <Link href={`/song/${song.id}`} onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm">
              Details
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Share logic would go here
            }}
          >
            <Share className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper function to format numbers (1000 -> 1K)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
"use client";

import { useState, useEffect } from "react";
import { SongModal } from "@/components/song-modal";
import { type Song } from "@/app/data/sample-songs";
import { SongPreviewPlayer } from "@/components/song-preview-player";
import { useAudio } from "@/lib/context/audio-context";
import { Play, Pause } from "lucide-react";

interface SongButtonProps {
  song: Song;
  children: React.ReactNode;
  className?: string;
  showPlayButton?: boolean;
  playOnHover?: boolean;
}

export function SongButton({ 
  song, 
  children, 
  className,
  // Always show play button by default
  showPlayButton = true,
  // Don't play on hover by default
  playOnHover = false
}: SongButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const { play, currentSong, isPlaying, togglePlayPause } = useAudio();

  const isCurrentSong = currentSong?.id === song.id;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't open modal when clicking play button
    
    if (isCurrentSong) {
      togglePlayPause();
    } else {
      play(song);
    }
  };

  // Effect to handle hover playing
  useEffect(() => {
    if (playOnHover && isHovering && !isCurrentSong) {
      const hoverTimeout = setTimeout(() => {
        play(song);
      }, 300); // Small delay to prevent rapid playing when just browsing
      
      return () => {
        clearTimeout(hoverTimeout);
      };
    }
  }, [isHovering, playOnHover, isCurrentSong, song, play]);

  return (
    <>
      <div 
        className={`${className} relative`}
        onClick={handleOpenModal}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Show preview player when hovering (if not currently playing in main player) */}
        {!isCurrentSong && !playOnHover && <SongPreviewPlayer song={song} isHovering={isHovering} />}
        
        {/* Show play/pause overlay */}
        {showPlayButton && (
          <div 
            className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isCurrentSong && isPlaying ? 'opacity-80' : (isHovering ? 'opacity-70' : 'opacity-0')}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick(e);
            }}
          >
            <button 
              className="rounded-full bg-primary hover:bg-primary/90 w-12 h-12 flex items-center justify-center shadow-md transition-transform duration-100 hover:scale-105"
              onClick={handlePlayClick}
              aria-label={isCurrentSong && isPlaying ? "Pause" : "Play"}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 text-primary-foreground ml-1" />
              )}
            </button>
          </div>
        )}
        
        {children}
      </div>
      
      <SongModal 
        song={song} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
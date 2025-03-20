"use client";

import { useState, useRef, useEffect } from "react";
import { useAudio } from "@/lib/context/audio-context";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Volume1,
  VolumeX,
  X,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SongModal } from "@/components/song-modal";

export function AudioPlayer() {
  const { 
    currentSong, 
    isPlaying, 
    currentTime, 
    duration, 
    volume,
    togglePlayPause, 
    setVolume, 
    seekTo,
    playNext,
    playPrevious,
    queue
  } = useAudio();
  
  const [showQueue, setShowQueue] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [showSongModal, setShowSongModal] = useState(false);
  
  // Format time in MM:SS format
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Calculate progress percentage
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Handle progress bar interaction
  const handleProgressChange = (value: number[]) => {
    setLocalProgress(value[0]);
    if (!isDraggingProgress && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      seekTo(newTime);
    }
  };
  
  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };
  
  // Sync local progress with current time when not dragging
  useEffect(() => {
    if (!isDraggingProgress) {
      setLocalProgress(progressPercentage);
    }
  }, [progressPercentage, isDraggingProgress]);
  
  // No song is playing, don't show the player
  if (!currentSong) return null;
  
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t z-40 shadow-md">
        {/* Mobile Layout */}
        <div className="md:hidden w-full p-2">
          <div className="flex items-center justify-between mb-2">
            {/* Song Info */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div 
                className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                onClick={() => setShowSongModal(true)}
              >
                <img 
                  src={currentSong.coverUrl} 
                  alt={currentSong.title} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="overflow-hidden">
                <h4 
                  className="font-medium truncate cursor-pointer hover:text-primary transition-colors text-sm"
                  onClick={() => setShowSongModal(true)}
                >
                  {currentSong.title}
                </h4>
                <Link 
                  href={`/profile/musician-1`} 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors truncate block"
                >
                  {currentSong.artist}
                </Link>
              </div>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={playPrevious}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button 
                size="icon" 
                className="rounded-full h-8 w-8 mx-1"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={playNext}
                disabled={queue.length === 0}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground min-w-[28px]">
              {formatTime(currentTime)}
            </span>
            
            <Slider
              value={[localProgress]}
              min={0}
              max={100}
              step={0.1}
              onValueChange={handleProgressChange}
              onValueCommit={() => {
                if (duration > 0) {
                  seekTo((localProgress / 100) * duration);
                }
              }}
              className="w-full"
              onMouseDown={() => setIsDraggingProgress(true)}
              onMouseUp={() => setIsDraggingProgress(false)}
              onTouchStart={() => setIsDraggingProgress(true)}
              onTouchEnd={() => setIsDraggingProgress(false)}
            />
            
            <span className="text-xs text-muted-foreground min-w-[28px]">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="container mx-auto flex items-center justify-between px-4 py-2">
            {/* Song Info */}
            <div className="flex items-center gap-3 w-1/4">
              <div 
                className="relative w-12 h-12 rounded overflow-hidden cursor-pointer shadow-sm"
                onClick={() => setShowSongModal(true)}
              >
                <img 
                  src={currentSong.coverUrl} 
                  alt={currentSong.title} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="overflow-hidden">
                <h4 
                  className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowSongModal(true)}
                >
                  {currentSong.title}
                </h4>
                <Link 
                  href={`/profile/musician-1`} 
                  className="text-sm text-muted-foreground hover:text-primary transition-colors truncate block"
                >
                  {currentSong.artist}
                </Link>
              </div>
            </div>
            
            {/* Player Controls */}
            <div className="flex flex-col items-center w-2/4">
              <div className="flex items-center gap-3 mb-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={playPrevious}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  size="icon" 
                  className="rounded-full h-8 w-8"
                  onClick={togglePlayPause}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={playNext}
                  disabled={queue.length === 0}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 w-full">
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(currentTime)}
                </span>
                
                <Slider
                  value={[localProgress]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={handleProgressChange}
                  onValueCommit={() => {
                    if (duration > 0) {
                      seekTo((localProgress / 100) * duration);
                    }
                  }}
                  className="w-full"
                  onMouseDown={() => setIsDraggingProgress(true)}
                  onMouseUp={() => setIsDraggingProgress(false)}
                  onTouchStart={() => setIsDraggingProgress(true)}
                  onTouchEnd={() => setIsDraggingProgress(false)}
                />
                
                <span className="text-xs text-muted-foreground min-w-[40px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>
            
            {/* Volume & Queue */}
            <div className="flex items-center justify-end gap-4 w-1/4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setVolume(volume > 0 ? 0 : 0.7)}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : volume < 0.5 ? (
                    <Volume1 className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                
                <Slider
                  value={[volume * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", queue.length > 0 && "text-primary")}
                onClick={() => setShowQueue(!showQueue)}
              >
                <List className="h-4 w-4" />
                {queue.length > 0 && (
                  <span className="absolute top-0 right-0 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                    {queue.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Queue Dropdown */}
        {showQueue && (
          <div className="absolute bottom-full right-0 w-72 max-h-96 bg-background border rounded-t-lg shadow-lg overflow-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-background">
              <h3 className="font-medium">Up Next</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setShowQueue(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-2">
              {queue.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No songs in queue</p>
              ) : (
                <ul className="space-y-1">
                  {queue.map((song, index) => (
                    <li 
                      key={`${song.id}-${index}`}
                      className="flex items-center gap-2 rounded-md hover:bg-secondary p-2"
                    >
                      <img 
                        src={song.coverUrl} 
                        alt={song.title} 
                        className="h-8 w-8 rounded object-cover"
                      />
                      <div className="overflow-hidden flex-1">
                        <h4 className="text-sm font-medium truncate">{song.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Adjust main content padding to prevent overlap with player */}
      <div className="h-16 md:h-[72px]" />
      
      {/* Song Modal */}
      <SongModal 
        song={currentSong}
        isOpen={showSongModal}
        onClose={() => setShowSongModal(false)}
      />
    </>
  );
}
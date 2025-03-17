"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface SongPreviewPlayerProps {
  song: {
    id: string;
    previewTrim?: {
      start: number;
      end: number;
    };
  };
  isHovering: boolean;
}

export function SongPreviewPlayer({ song, isHovering }: SongPreviewPlayerProps) {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('autoplayPreviews') === 'false';
    }
    return false;
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check user preference for autoplay previews
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const autoplayPreference = localStorage.getItem('autoplayPreviews');
      setIsMuted(autoplayPreference === 'false');
    }
  }, []);
  
  // Handle simulated audio playback
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Handle hover state changes
    if (isHovering && !isMuted) {
      // Start simulated playback
      setIsPlaying(true);
      setProgress(0);
      
      // Simulate 20 seconds of playback with progress updates
      const duration = 20; // seconds
      const updateInterval = 100; // milliseconds
      const steps = (duration * 1000) / updateInterval;
      let currentStep = 0;
      
      intervalRef.current = setInterval(() => {
        currentStep++;
        const newProgress = (currentStep / steps) * 100;
        setProgress(newProgress);
        
        if (newProgress >= 100) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsPlaying(false);
        }
      }, updateInterval);
    } else {
      // Stop playback
      setIsPlaying(false);
    }
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovering, isMuted, song.id]);
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('autoplayPreviews', (!newMutedState).toString());
  };
  
  return (
    <>
      {/* Visual indicator for preview playback */}
      {isHovering && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/30 z-10">
          {isPlaying && (
            <div 
              className="h-full bg-primary transition-all duration-100 ease-linear" 
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
      )}
      
      {/* Mute/Unmute button */}
      {isHovering && (
        <button
          onClick={toggleMute}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white z-10"
        >
          {isMuted ? (
            <VolumeX className="w-3.5 h-3.5" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>
      )}
    </>
  );
}
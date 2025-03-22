"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { type Song } from "@/app/data/sample-songs";

interface SongPreviewPlayerProps {
  song: Song;
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
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check user preference for autoplay previews
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const autoplayPreference = localStorage.getItem('autoplayPreviews');
      setIsMuted(autoplayPreference === 'false');
    }
  }, []);
  
  // Initialize and handle audio element
  useEffect(() => {
    // Determine the audio URL to use
    let audioUrl: string;
    
    // Check if this song has an actual audio file URL specified
    if (song.audioUrl) {
      audioUrl = song.audioUrl;
    } else {
      // Use our sample tracks based on song ID for testing/default songs
      // These are public domain audio samples
      const audioUrls = {
        "1": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3", // Electronic
        "2": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_99cbd8e0ee.mp3?filename=hip-hop-beat-140752.mp3", // Hip Hop
        "3": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_80328eb25c.mp3?filename=relaxing-145038.mp3", // Ambient/Relaxing
        "4": "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5a085.mp3?filename=powerful-beat-121791.mp3", // Electronic
        // Default track if ID doesn't match
        "default": "https://cdn.pixabay.com/download/audio/2022/05/16/audio_946bc1914e.mp3?filename=lofi-study-112191.mp3"
      };
      
      // Use sample audio based on song ID or default if not matched
      audioUrl = audioUrls[song.id as keyof typeof audioUrls] || audioUrls.default;
    }
    
    // Create audio element
    const audio = new Audio(audioUrl);
    audio.volume = 0.5;
    audio.muted = isMuted;
    audio.preload = "auto";
    
    // Set up event listeners
    audio.addEventListener('canplaythrough', () => {
      setAudioLoaded(true);
    });
    
    audio.addEventListener('timeupdate', () => {
      // Get preview timing
      const previewStart = song.previewTrim?.start || 0;
      const previewEnd = song.previewTrim?.end || (previewStart + 20);
      
      // Calculate progress
      const currentTime = audio.currentTime;
      const previewDuration = previewEnd - previewStart;
      const relativeTime = currentTime - previewStart;
      const newProgress = Math.min(100, (relativeTime / previewDuration) * 100);
      setProgress(newProgress);
      
      // Loop or stop at the end of preview section
      if (currentTime >= previewEnd) {
        audio.currentTime = previewStart;
        if (!isHovering) {
          audio.pause();
          setIsPlaying(false);
        }
      }
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener('play', () => {
      setIsPlaying(true);
    });
    
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });
    
    // Store audio element
    audioRef.current = audio;
    
    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
      setAudioLoaded(false);
    };
  }, [song.id, song.audioUrl]);
  
  // Handle hover state change
  useEffect(() => {
    if (!audioRef.current || !audioLoaded) return;
    
    // Get preview timing
    const previewStart = song.previewTrim?.start || 0;
    const previewEnd = song.previewTrim?.end || (previewStart + 20);
    
    if (isHovering && !isMuted) {
      // Start playback from preview start
      audioRef.current.currentTime = previewStart;
      audioRef.current.play().catch(error => {
        console.log("Auto-play prevented by browser:", error);
        
        // Fallback to simulated playback
        simulatePlayback(previewStart, previewEnd);
      });
    } else {
      // Stop playback
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
      }
      
      // Clear any simulation interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isHovering, isMuted, audioLoaded, song.previewTrim]);
  
  // Update muted state when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  // Fallback simulation for browsers that block autoplay
  const simulatePlayback = (previewStart: number, previewEnd: number) => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Start simulated playback
    setIsPlaying(true);
    setProgress(0);
    
    const previewDuration = previewEnd - previewStart;
    
    // Simulate preview duration with progress updates
    const updateInterval = 100; // milliseconds
    const steps = (previewDuration * 1000) / updateInterval;
    let currentStep = 0;
    
    intervalRef.current = setInterval(() => {
      currentStep++;
      const newProgress = (currentStep / steps) * 100;
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsPlaying(false);
        setProgress(0);
      }
    }, updateInterval);
  };
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('autoplayPreviews', (!newMutedState).toString());
    
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
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
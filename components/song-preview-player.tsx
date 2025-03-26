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
    console.log("Creating audio element for song:", song.id, song.title);
    
    // Determine the audio URL to use
    let audioUrl: string;
    
    // Check if this song has an actual audio file URL specified
    if (song.audioUrl) {
      audioUrl = song.audioUrl;
    } else {
      // Use our sample tracks based on song ID for testing/default songs
      // These are public domain audio samples
      const audioUrls: Record<string, string> = {
        "1": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3", // Electronic
        "2": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_99cbd8e0ee.mp3?filename=hip-hop-beat-140752.mp3", // Hip Hop
        "3": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_80328eb25c.mp3?filename=relaxing-145038.mp3", // Ambient/Relaxing
        "4": "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5a085.mp3?filename=powerful-beat-121791.mp3", // Electronic
        "default": "https://cdn.pixabay.com/download/audio/2022/05/16/audio_946bc1914e.mp3?filename=lofi-study-112191.mp3"
      };
      
      // Use sample audio based on song ID or default if not matched
      audioUrl = audioUrls[song.id] || audioUrls.default;
    }
    
    console.log("Using audio URL:", audioUrl);
    
    // Create audio element
    const audio = new Audio();
    audio.src = audioUrl;
    audio.volume = 0.5;
    audio.muted = isMuted;
    audio.preload = "auto";
    audio.crossOrigin = "anonymous"; // For CORS
    
    // Set up event listeners
    audio.addEventListener('canplaythrough', () => {
      console.log("Audio can play through:", song.id);
      setAudioLoaded(true);
    });
    
    audio.addEventListener('loadeddata', () => {
      console.log("Audio data loaded:", song.id);
      setAudioLoaded(true);
    });
    
    audio.addEventListener('error', (e) => {
      console.error("Audio loading error:", e);
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
      console.log("Audio ended:", song.id);
      setIsPlaying(false);
    });
    
    audio.addEventListener('play', () => {
      console.log("Audio playing:", song.id);
      setIsPlaying(true);
    });
    
    audio.addEventListener('pause', () => {
      console.log("Audio paused:", song.id);
      setIsPlaying(false);
    });
    
    // Force loading
    audio.load();
    
    // Store audio element
    audioRef.current = audio;
    
    // Cleanup
    return () => {
      console.log("Cleaning up audio element for song:", song.id);
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setAudioLoaded(false);
    };
  }, [song.id, song.audioUrl, isMuted]);
  
  // Handle hover state change
  useEffect(() => {
    console.log("Hover state changed:", isHovering, "for song:", song.id);
    
    if (!audioRef.current) {
      console.log("No audio ref available for song:", song.id);
      return;
    }
    
    // Get preview timing
    const previewStart = song.previewTrim?.start || 0;
    const previewEnd = song.previewTrim?.end || (previewStart + 20);
    
    if (isHovering && !isMuted) {
      console.log("Starting preview playback for song:", song.id);
      
      // Always set the current time to the preview start
      audioRef.current.currentTime = previewStart;
      
      // Start playback
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Playback started successfully for song:", song.id);
        }).catch(error => {
          console.log("Auto-play prevented by browser:", error);
          
          // Fallback to simulated playback
          console.log("Using simulated playback for song:", song.id);
          simulatePlayback(previewStart, previewEnd);
        });
      }
    } else {
      console.log("Stopping preview playback for song:", song.id);
      
      // Stop audio playback immediately
      audioRef.current.pause();
      
      // Clear any simulation
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPlaying(false);
        setProgress(0);
      }
    }
  }, [isHovering, isMuted, song.id, song.previewTrim]);
  
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
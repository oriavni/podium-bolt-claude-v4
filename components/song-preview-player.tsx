"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { type Song } from "@/app/data/sample-songs";

interface SongPreviewPlayerProps {
  song: Song;
  isHovering: boolean;
}

export function SongPreviewPlayer({ song, isHovering }: SongPreviewPlayerProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Helper function to validate audio URLs
  const isValidAudioUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.warn('Empty or invalid audio URL in preview player');
      return false;
    }
    
    try {
      // Trim and normalize the URL
      const trimmedUrl = url.trim();
      
      // Special case for Firebase Storage URLs - they should be valid even without file extensions
      if (trimmedUrl.includes('firebasestorage.googleapis.com')) {
        console.log('Preview player: Detected Firebase Storage URL');
        return true;
      }
      
      // Basic URL validation
      new URL(trimmedUrl);
      
      // Check for common audio file extensions
      const hasAudioExtension = /\.(mp3|wav|ogg|m4a|flac|aac)($|\?)/i.test(trimmedUrl);
      
      // Check for other common patterns that indicate audio URLs
      const isAudioPattern = 
        // Content-type hints in URL
        /\/(audio|sound)\//.test(trimmedUrl) || 
        // Common audio hosting domains
        /(soundcloud|mixcloud|audiomack|bandcamp)\.com/.test(trimmedUrl) ||
        // Pixabay audio URLs (used in samples)
        /pixabay\.com\/.*audio/.test(trimmedUrl);
      
      return hasAudioExtension || isAudioPattern;
    } catch (error) {
      console.warn('Error validating audio URL in preview player:', error);
      return false;
    }
  };
  
  // Fallback function to generate mock waveform data
  const generateMockWaveform = () => {
    const samples = 200;
    const mockWaveform = [];
    
    for (let i = 0; i < samples; i++) {
      // Create a semi-random waveform with some peaks and valleys
      const position = i / samples;
      const base = 0.2 + 0.3 * Math.sin(position * Math.PI * 8);
      const random = 0.5 * Math.random();
      mockWaveform.push(base + random);
    }
    
    setWaveformData(mockWaveform);
  };
  
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
  
  // Check user preference for autoplay previews
  useEffect(() => {
    const autoplayPreference = localStorage.getItem('autoplayPreviews');
    setIsMuted(autoplayPreference === 'false');
  }, []);
  
  // Initialize and handle audio element
  useEffect(() => {
    // Don't create audio elements if we're not in the browser
    if (typeof window === 'undefined') return;
    
    let audioUrl: string;
    let audio: HTMLAudioElement;
    let loadTimeout: NodeJS.Timeout;
    
    try {
      // Check if this song has an actual audio file URL specified
      if (song.audioUrl) {
        // Validate URL format
        if (!isValidAudioUrl(song.audioUrl)) {
          console.warn(`Invalid audio URL in preview player: ${song.audioUrl}`);
          throw new Error("Invalid audio URL format");
        }
        audioUrl = song.audioUrl;
      } else {
        // Use sample tracks based on song ID for testing/default songs
        const audioUrls: Record<string, string> = {
          "1": "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=electronic-future-beats-117997.mp3",
          "2": "https://cdn.pixabay.com/download/audio/2022/10/14/audio_99cbd8e0ee.mp3?filename=hip-hop-beat-140752.mp3",
          "3": "https://cdn.pixabay.com/download/audio/2022/03/15/audio_80328eb25c.mp3?filename=relaxing-145038.mp3",
          "4": "https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe5a085.mp3?filename=powerful-beat-121791.mp3",
          "default": "https://cdn.pixabay.com/download/audio/2022/05/16/audio_946bc1914e.mp3?filename=lofi-study-112191.mp3"
        };
        
        // Use sample audio based on song ID or default if not matched
        audioUrl = audioUrls[song.id] || audioUrls.default;
      }
      
      // Create audio element
      audio = new Audio();
      
      // Handle loading errors
      const handleError = (event: ErrorEvent) => {
        console.error("Audio loading error in preview player:", event);
        setAudioLoaded(false);
        // Fall back to simulated behavior since we can't play the audio
        generateMockWaveform();
      };
      
      audio.addEventListener('error', handleError as EventListener);
      
      // Set a loading timeout to prevent hanging in loading state
      loadTimeout = setTimeout(() => {
        if (!audioLoaded) {
          console.warn("Audio loading timeout in preview player");
          setAudioLoaded(true); // Mark as loaded to unblock UI
        }
      }, 5000);
      
      // Set audio properties
      audio.src = audioUrl;
      audio.volume = 0.5;
      audio.muted = isMuted;
      audio.preload = "auto";
      audio.crossOrigin = "anonymous"; // For CORS
      
      // Set up event listeners
      audio.addEventListener('canplaythrough', () => {
        setAudioLoaded(true);
      });
      
      audio.addEventListener('loadeddata', () => {
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
      
      // Force loading
      audio.load();
      
      // Store audio element
      audioRef.current = audio;
      
      // Cleanup function
      return () => {
        if (audio) {
          audio.pause();
          audio.src = '';
          audioRef.current = null;
        }
        if (loadTimeout) {
          clearTimeout(loadTimeout);
        }
        setAudioLoaded(false);
      };
    } catch (error) {
      console.error("Error setting up audio:", error);
      return () => {
        if (loadTimeout) {
          clearTimeout(loadTimeout);
        }
      };
    }
  }, [song.id, song.audioUrl, isMuted]);
  
  // Handle hover state change
  useEffect(() => {
    // Skip if not in browser or no audio element available
    if (typeof window === 'undefined' || !audioRef.current) {
      return;
    }
    
    // Get preview timing
    const previewStart = song.previewTrim?.start || 0;
    const previewEnd = song.previewTrim?.end || (previewStart + 20);
    
    if (isHovering && !isMuted) {
      try {
        // Check audio state before trying to play
        if (audioRef.current.readyState === 0) {
          // Audio isn't loaded yet or has errored, use simulation instead
          simulatePlayback(previewStart, previewEnd);
          return;
        }
        
        // Try to set the current time to the preview start
        try {
          audioRef.current.currentTime = previewStart;
        } catch (error) {
          console.warn("Could not set audio currentTime:", error);
          // Continue anyway - we'll handle errors in the play promise
        }
        
        // Start playback with robust error handling
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.warn("Audio play error:", error);
            // Fallback to simulated playback if autoplay is prevented or file can't be played
            simulatePlayback(previewStart, previewEnd);
          });
        } else {
          // If play doesn't return a promise (rare, older browsers), simulate playback to be safe
          simulatePlayback(previewStart, previewEnd);
        }
      } catch (error) {
        console.error("Unexpected error in audio preview:", error);
        // Ensure we have fallback behavior
        simulatePlayback(previewStart, previewEnd);
      }
    } else {
      // Stop audio playback
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (error) {
        console.warn("Error pausing audio:", error);
      }
      
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
  
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Only run client-side
    if (typeof window !== 'undefined') {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      localStorage.setItem('autoplayPreviews', (!newMutedState).toString());
      
      if (audioRef.current) {
        audioRef.current.muted = newMutedState;
      }
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
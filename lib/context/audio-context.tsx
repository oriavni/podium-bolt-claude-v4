"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { type Song } from "@/app/data/sample-songs";

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  play: (song: Song) => void;
  pause: () => void;
  togglePlayPause: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  queue: Song[];
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [queue, setQueue] = useState<Song[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    
    // Define event handlers
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleMetadataLoaded = () => {
      setDuration(audio.duration);
    };
    
    const handleEnded = () => {
      // Play next song if available
      if (queue.length > 0) {
        const nextSong = queue[0];
        const newQueue = queue.slice(1);
        setQueue(newQueue);
        setCurrentSong(nextSong);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    
    // Set up event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('ended', handleEnded);
    
    // Store audio element
    audioRef.current = audio;
    
    // Cleanup
    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);
  
  // Update audio when current song changes
  useEffect(() => {
    if (!audioRef.current) return;
    if (!currentSong) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
      return;
    }
    
    // Determine the audio URL to use
    let audioUrl: string;
    
    try {
      // Check if this song has an actual audio file URL specified
      if (currentSong.audioUrl) {
        // Validate URL
        if (!isValidAudioUrl(currentSong.audioUrl)) {
          console.warn(`Invalid audio URL detected: ${currentSong.audioUrl}`);
          throw new Error("Invalid audio URL");
        }
        audioUrl = currentSong.audioUrl;
      } else {
        // Use local audio files to avoid external dependencies
        const audioUrls = {
          "1": "/audio/sample-electronic.mp3", // Electronic
          "2": "/audio/sample-hiphop.mp3", // Hip Hop
          "3": "/audio/sample-ambient.mp3", // Ambient/Relaxing
          "4": "/audio/sample-electronic2.mp3", // Electronic
          // Default track if ID doesn't match
          "default": "/audio/sample-lofi.mp3"
        };
        
        // Use sample audio based on song ID or default if not matched
        audioUrl = audioUrls[currentSong.id as keyof typeof audioUrls] || audioUrls.default;
      }
      
      // Add error event listener to handle failures
      const handleLoadError = (event: ErrorEvent) => {
        console.error('Audio source error:', event);
        // Don't set isPlaying to false immediately as it might be stuck loading
        setTimeout(() => {
          if (audioRef.current && !audioRef.current.readyState) {
            setIsPlaying(false);
          }
        }, 5000); // 5 second timeout for loading
      };
      
      const isSameSource = audioRef.current.src === audioUrl;
      
      if (!isSameSource) {
        // Remove any existing error listeners
        audioRef.current.removeEventListener('error', handleLoadError as EventListener);
        
        // Add new error listener
        audioRef.current.addEventListener('error', handleLoadError as EventListener);
        
        // Set source and load
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        
        // Set up canplay handler for when the audio is ready
        audioRef.current.addEventListener('canplay', () => {
          // Start playing automatically when a new song is selected
          setIsPlaying(true);
          
          // Set current position if preview trimming is defined and we're starting a new song
          if (currentSong.previewTrim?.start !== undefined && currentSong.previewTrim.start > 0) {
            audioRef.current!.currentTime = currentSong.previewTrim.start;
          }
          
          audioRef.current!.play().catch(error => {
            console.error('Error playing audio:', error);
            setIsPlaying(false);
          });
        }, { once: true });
      } else if (isPlaying) {
        // If it's the same song and should be playing, ensure it's playing
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
      
      // Set a timeout to handle cases where canplay never triggers
      const loadingTimeout = setTimeout(() => {
        if (audioRef.current && isPlaying && audioRef.current.readyState < 3) {
          console.warn('Audio loading timeout - failed to load audio');
          setIsPlaying(false);
        }
      }, 10000); // 10 second timeout
      
      return () => {
        clearTimeout(loadingTimeout);
        audioRef.current?.removeEventListener('error', handleLoadError as EventListener);
      };
      
    } catch (error) {
      console.error('Error setting up audio source:', error);
      setIsPlaying(false);
      
      // Use fallback audio if available
      if (audioRef.current) {
        // Use a local fallback audio URL
        audioRef.current.src = "/audio/sample-lofi.mp3";
        audioRef.current.load();
      }
    }
  }, [currentSong]);
  
  // Helper function to validate audio URLs
  const isValidAudioUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.warn('❌ Empty or invalid audio URL');
      return false;
    }
    
    try {
      // Trim and normalize the URL
      const trimmedUrl = url.trim();
      
      // Log the URL for debugging
      console.log('🔍 Validating audio URL:', trimmedUrl);
      
      // Special case for Firebase Storage URLs - they should be valid even without file extensions
      if (trimmedUrl.includes('firebasestorage.googleapis.com')) {
        console.log('✅ Detected Firebase Storage URL:', trimmedUrl);
        
        // Checking if URL has a token parameter which is required for Firebase Storage
        const hasToken = trimmedUrl.includes('token=') || trimmedUrl.includes('alt=media');
        if (!hasToken) {
          console.warn('⚠️ Firebase Storage URL missing token parameter, may not work correctly');
        }
        
        return true;
      }
      
      // Special case for our local API file serving
      if (trimmedUrl.includes('/api/files')) {
        console.log('✅ Detected local API file URL:', trimmedUrl);
        return true;
      }
      
      // Basic URL validation
      const urlObj = new URL(trimmedUrl);
      
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
      
      const isValid = hasAudioExtension || isAudioPattern;
      console.log(`${isValid ? '✅' : '❌'} Audio URL validation result:`, { 
        isValid, 
        hasAudioExtension, 
        isAudioPattern 
      });
      
      return isValid;
    } catch (error) {
      console.warn('❌ Error validating audio URL:', error);
      return false;
    }
  };
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Handle volume changes
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);
  
  // Define the playSong function before using it in useEffect
  const playSong = useRef((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  }).current;
  
  const pause = () => {
    setIsPlaying(false);
  };
  
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };
  
  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };
  
  const playNext = () => {
    if (queue.length === 0) return;
    
    const nextSong = queue[0];
    const newQueue = queue.slice(1);
    setQueue(newQueue);
    setCurrentSong(nextSong);
    setIsPlaying(true);
  };
  
  const playPrevious = () => {
    // This is a simplified implementation
    // In a real app, you might want to keep track of play history
    if (!currentSong) return;
    
    // For now, just restart the current song
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };
  
  const addToQueue = (song: Song) => {
    setQueue([...queue, song]);
  };
  
  const removeFromQueue = (songId: string) => {
    setQueue(queue.filter(song => song.id !== songId));
  };
  
  const clearQueue = () => {
    setQueue([]);
  };
  
  // Expose the context API
  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    play: playSong,
    pause,
    togglePlayPause,
    setVolume,
    seekTo,
    playNext,
    playPrevious,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}

// Safely access audio outside of component context
export const audioPlayerApi = {
  _getContext: () => {
    // This should only be used in event handlers that can't use hooks directly
    // It's a workaround for the Invalid Hook Call Warning
    return AudioContext._currentValue;
  }
};
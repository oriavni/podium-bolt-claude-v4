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
    
    // Check if this song has an actual audio file URL specified
    if (currentSong.audioUrl) {
      audioUrl = currentSong.audioUrl;
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
      audioUrl = audioUrls[currentSong.id as keyof typeof audioUrls] || audioUrls.default;
    }
    
    const isSameSource = audioRef.current.src === audioUrl;
    
    if (!isSameSource) {
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
  }, [currentSong]);
  
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
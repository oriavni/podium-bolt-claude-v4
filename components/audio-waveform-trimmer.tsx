"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Play, Pause, Scissors, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioWaveformTrimmerProps {
  audioFile: File;
  onPreviewGenerated: (start: number, end: number) => void;
  initialStart?: number;
  initialEnd?: number;
}

export function AudioWaveformTrimmer({ 
  audioFile, 
  onPreviewGenerated,
  initialStart = 0,
  initialEnd = 20
}: AudioWaveformTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewStart, setPreviewStart] = useState(initialStart);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  // Fixed preview duration of 20 seconds
  const PREVIEW_DURATION = 20;

  // Calculate preview end based on start and fixed duration
  const previewEnd = Math.min(previewStart + PREVIEW_DURATION, duration);

  // Create audio context and load audio file
  useEffect(() => {
    // Create audio element
    const audio = new Audio();
    audioRef.current = audio;
    
    // Set up event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
      
      // Ensure initial start is valid
      const validStart = Math.min(initialStart, Math.max(0, audio.duration - PREVIEW_DURATION));
      setPreviewStart(validStart);
      
      // Notify parent with valid start and end
      onPreviewGenerated(validStart, validStart + PREVIEW_DURATION);
      setIsLoading(false);
    });
    
    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
      
      // Stop playback if we reach the end of the preview region
      if (audio.currentTime >= previewEnd) {
        audio.pause();
        audio.currentTime = previewStart;
        setIsPlaying(false);
      }
    });
    
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    
    // Generate mock waveform data since we can't actually decode the audio
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
      
      // Set a mock duration if the audio doesn't load
      setTimeout(() => {
        if (isLoading) {
          const mockDuration = 180; // 3 minutes
          setDuration(mockDuration);
          
          // Ensure initial start is valid for mock duration
          const validStart = Math.min(initialStart, Math.max(0, mockDuration - PREVIEW_DURATION));
          setPreviewStart(validStart);
          
          // Notify parent with valid start and end
          onPreviewGenerated(validStart, validStart + PREVIEW_DURATION);
          setIsLoading(false);
        }
      }, 1000);
    };
    
    generateMockWaveform();
    
    // Set audio source (this will likely fail in the demo, but we'll handle that with mock data)
    try {
      const url = URL.createObjectURL(audioFile);
      audio.src = url;
      audio.load();
      
      return () => {
        audio.pause();
        URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error("Error loading audio:", error);
      return () => {
        audio.pause();
      };
    }
  }, [audioFile, initialStart, onPreviewGenerated, isLoading]);

  // Draw waveform and selection handles
  useEffect(() => {
    if (!canvasRef.current || waveformData.length === 0 || !duration) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw waveform
    const barWidth = rect.width / waveformData.length;
    const barGap = 1;
    const effectiveBarWidth = barWidth - barGap;
    
    // Draw background waveform
    ctx.fillStyle = 'rgba(79, 70, 229, 0.2)';
    waveformData.forEach((value, index) => {
      const x = index * barWidth;
      const height = value * (rect.height - 20);
      const y = (rect.height - height) / 2;
      ctx.fillRect(x, y, effectiveBarWidth, height);
    });
    
    // Draw selection region
    const startX = (previewStart / duration) * rect.width;
    const endX = (previewEnd / duration) * rect.width;
    
    // Draw selection background
    ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
    ctx.fillRect(startX, 0, endX - startX, rect.height);
    
    // Draw selection borders
    ctx.fillStyle = 'rgb(255, 215, 0)'; // Yellow color for handles
    ctx.fillRect(startX - 2, 0, 4, rect.height);
    ctx.fillRect(endX - 2, 0, 4, rect.height);
    
    // Draw handles
    ctx.fillStyle = 'rgb(255, 215, 0)'; // Yellow color for handles
    ctx.beginPath();
    ctx.arc(startX, rect.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(endX, rect.height / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw current playback position
    if (isPlaying && currentTime >= previewStart && currentTime <= previewEnd) {
      const playheadX = (currentTime / duration) * rect.width;
      ctx.fillStyle = 'white';
      ctx.fillRect(playheadX - 1, 0, 2, rect.height);
    }
    
  }, [waveformData, previewStart, previewEnd, duration, currentTime, isPlaying]);

  // Handle mouse events for dragging selection handles
  useEffect(() => {
    if (!canvasRef.current || !duration) return;
    
    const canvas = canvasRef.current;
    
    const getTimeFromX = (x: number) => {
      const rect = canvas.getBoundingClientRect();
      const ratio = x / rect.width;
      return ratio * duration;
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      
      const startX = (previewStart / duration) * rect.width;
      
      // Check if clicking near start handle or within the selection region
      if (Math.abs(x - startX) < 10 || (x > startX && x < (previewEnd / duration) * rect.width)) {
        setIsDragging(true);
      }
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newTime = getTimeFromX(x);
      
      // Ensure start is valid (not beyond duration - PREVIEW_DURATION)
      const maxStart = Math.max(0, duration - PREVIEW_DURATION);
      const newStart = Math.min(Math.max(0, newTime), maxStart);
      
      setPreviewStart(newStart);
      onPreviewGenerated(newStart, newStart + PREVIEW_DURATION);
      
      // Update audio position if playing
      if (isPlaying && audioRef.current) {
        audioRef.current.currentTime = newStart;
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, previewStart, previewEnd, duration, onPreviewGenerated, isPlaying]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // If we're at the end of the preview, go back to the start
      if (currentTime >= previewEnd || currentTime < previewStart) {
        audioRef.current.currentTime = previewStart;
      }
      audioRef.current.play().catch(error => {
        console.log("Play prevented:", error);
        // Simulate playback for demo purposes
        setIsPlaying(true);
        const interval = setInterval(() => {
          setCurrentTime(prev => {
            const next = prev + 0.1;
            if (next >= previewEnd) {
              clearInterval(interval);
              setIsPlaying(false);
              return previewStart;
            }
            return next;
          });
        }, 100);
      });
    }
  };

  const handleReset = () => {
    setPreviewStart(0);
    onPreviewGenerated(0, PREVIEW_DURATION);
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Preview Trimmer</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          {formatTime(previewStart)} - {formatTime(previewEnd)} (20 seconds)
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={cn(
          "relative rounded-md border p-4 bg-secondary/10 h-[120px]",
          isLoading && "animate-pulse"
        )}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading audio waveform...</p>
          </div>
        ) : (
          <canvas 
            ref={canvasRef} 
            className="w-full h-full cursor-pointer"
          />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          disabled={isLoading}
          title="Reset to default"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        
        <div className="flex-1 text-sm text-muted-foreground">
          <p>Drag the yellow selection to choose which 20-second segment to preview</p>
          <p className="text-xs mt-1">This preview will autoplay when users hover over your song</p>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Scissors, Save, RotateCcw, FastForward, Rewind } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

interface AudioPreviewTrimmerProps {
  audioFile: File;
  onPreviewGenerated: (start: number, end: number, previewBlob?: Blob) => void;
  initialStart?: number;
  initialEnd?: number;
}

export function AudioPreviewTrimmer({ 
  audioFile, 
  onPreviewGenerated,
  initialStart = 0,
  initialEnd = 20
}: AudioPreviewTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewStart, setPreviewStart] = useState(initialStart);
  const [previewEnd, setPreviewEnd] = useState(initialEnd);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDuration, setPreviewDuration] = useState(initialEnd - initialStart); 
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create audio URL from file
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);

    // Create audio element for direct playback
    const audioElement = new Audio(url);
    audioElement.addEventListener('timeupdate', () => {
      if (audioElement.currentTime >= previewEnd) {
        audioElement.pause();
        audioElement.currentTime = previewStart;
        setIsPlaying(false);
      }
    });
    audioElementRef.current = audioElement;

    // Create WaveSurfer instance
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgba(79, 70, 229, 0.4)',
      progressColor: 'rgb(79, 70, 229)',
      cursorColor: 'rgb(79, 70, 229)',
      height: 80,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
    });

    // Add regions plugin
    const regions = wavesurfer.registerPlugin(RegionsPlugin.create());
    regionsRef.current = regions;

    // Load audio file
    wavesurfer.load(url);

    // Set up event listeners
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      const audioDuration = wavesurfer.getDuration();
      setDuration(audioDuration);
      
      // Validate initial values against actual duration
      const validStart = Math.min(initialStart, Math.max(0, audioDuration - 20));
      const validEnd = Math.min(validStart + 20, audioDuration);
      
      setPreviewStart(validStart);
      setPreviewEnd(validEnd);
      setPreviewDuration(validEnd - validStart);
      
      // Create region for preview
      regions.addRegion({
        id: 'preview',
        start: validStart,
        end: validEnd,
        color: 'rgba(79, 70, 229, 0.2)',
        drag: true,
        resize: true,
      });

      // Notify parent component
      onPreviewGenerated(validStart, validEnd);
    });

    wavesurfer.on('timeupdate', (currentTime) => {
      setCurrentTime(currentTime);
      
      // Sync audio element with wavesurfer
      if (audioElementRef.current && Math.abs(audioElementRef.current.currentTime - currentTime) > 0.5) {
        audioElementRef.current.currentTime = currentTime;
      }
      
      // Stop playback if we reach the end of the preview region
      const region = regions.getRegions()[0];
      if (region && currentTime >= region.end) {
        wavesurfer.pause();
        wavesurfer.seekTo(region.start / wavesurfer.getDuration());
        setIsPlaying(false);
      }
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = wavesurfer.getCurrentTime();
      }
    });
    
    wavesurfer.on('pause', () => setIsPlaying(false));
    wavesurfer.on('seeking', (position) => {
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = position * duration;
      }
    });

    // Handle region updates
    regions.on('region-updated', (region) => {
      setPreviewStart(region.start);
      setPreviewEnd(region.end);
      setPreviewDuration(region.end - region.start);
      
      // If we're inside the new region, continue playback
      // Otherwise, seek to the start of the region
      const currentTime = wavesurfer.getCurrentTime();
      if (currentTime < region.start || currentTime > region.end) {
        wavesurfer.seekTo(region.start / wavesurfer.getDuration());
        if (audioElementRef.current) {
          audioElementRef.current.currentTime = region.start;
        }
      }
      
      // Notify parent component
      onPreviewGenerated(region.start, region.end);
    });

    // Handle clicks on the waveform to seek
    wavesurfer.on('interaction', () => {
      const currentTime = wavesurfer.getCurrentTime();
      // Keep playback within the selected region
      const region = regions.getRegions()[0];
      if (region && (currentTime < region.start || currentTime > region.end)) {
        wavesurfer.seekTo(region.start / wavesurfer.getDuration());
      }
    });

    // Store reference
    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
      URL.revokeObjectURL(url);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
    };
  }, [audioFile, onPreviewGenerated, initialStart, initialEnd]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      // If we're at the end of the preview, go back to the start
      const region = regionsRef.current?.getRegions()[0];
      if (region) {
        const currentTime = wavesurferRef.current.getCurrentTime();
        if (currentTime >= region.end || currentTime < region.start) {
          wavesurferRef.current.seekTo(region.start / duration);
        }
      }
      wavesurferRef.current.play();
    }
  };

  const handleReset = () => {
    if (!wavesurferRef.current || !regionsRef.current) return;
    
    // Remove existing regions
    regionsRef.current.clearRegions();
    
    // Create new default region (either first 20 seconds or full duration if shorter)
    const end = Math.min(20, duration);
    regionsRef.current.addRegion({
      id: 'preview',
      start: 0,
      end: end,
      color: 'rgba(79, 70, 229, 0.2)',
      drag: true,
      resize: true,
    });
    
    setPreviewStart(0);
    setPreviewEnd(end);
    setPreviewDuration(end);
    
    // Seek to start of region
    wavesurferRef.current.seekTo(0);
    
    // Notify parent component
    onPreviewGenerated(0, end);
  };

  // Function to generate and save audio preview
  const generatePreview = async () => {
    if (!audioElementRef.current || !audioUrl || isGeneratingPreview) return;
    
    try {
      setIsGeneratingPreview(true);
      
      // In a real implementation, you would use the Web Audio API to create 
      // a trimmed audio blob here. For simplicity, we're just passing the trim points.
      
      // For a complete implementation, you would:
      // 1. Fetch the original audio as an ArrayBuffer
      // 2. Decode the audio data
      // 3. Create a new buffer with just the selected portion
      // 4. Encode that buffer to the desired format (mp3, etc)
      // 5. Create a blob from the encoded data
      
      // This simplified version just notifies with the trim points
      onPreviewGenerated(previewStart, previewEnd);
      
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsGeneratingPreview(false);
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
          {formatTime(previewStart)} - {formatTime(previewEnd)} ({formatTime(previewDuration)})
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={`relative rounded-md border p-2 ${isLoading ? 'min-h-[80px] bg-secondary/30 animate-pulse' : ''}`}
      />
      
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
        
        <Button
          variant="default"
          size="sm"
          onClick={generatePreview}
          disabled={isLoading || isGeneratingPreview}
          className="ml-2"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Preview
        </Button>
        
        <div className="flex-1 text-sm text-muted-foreground">
          <p>Drag the highlighted region to set where your preview begins and ends</p>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        This preview will autoplay (muted) when users hover over your song in the feed
      </div>
    </div>
  );
}
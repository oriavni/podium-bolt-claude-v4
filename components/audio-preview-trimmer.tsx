"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Scissors, Save, RotateCcw } from "lucide-react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

interface AudioPreviewTrimmerProps {
  audioFile: File;
  onPreviewGenerated: (start: number, end: number, previewBlob?: Blob) => void;
}

export function AudioPreviewTrimmer({ audioFile, onPreviewGenerated }: AudioPreviewTrimmerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const regionsRef = useRef<RegionsPlugin | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewStart, setPreviewStart] = useState(0);
  const [previewEnd, setPreviewEnd] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [previewDuration, setPreviewDuration] = useState(20); // Default 20 seconds

  useEffect(() => {
    if (!containerRef.current) return;

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
    const audioUrl = URL.createObjectURL(audioFile);
    wavesurfer.load(audioUrl);

    // Set up event listeners
    wavesurfer.on('ready', () => {
      setIsLoading(false);
      const audioDuration = wavesurfer.getDuration();
      setDuration(audioDuration);
      
      // Set default preview region (first 20 seconds or full duration if shorter)
      const end = Math.min(20, audioDuration);
      setPreviewEnd(end);
      setPreviewDuration(end);
      
      // Create region for preview
      regions.addRegion({
        id: 'preview',
        start: 0,
        end: end,
        color: 'rgba(79, 70, 229, 0.2)',
        drag: true,
        resize: true,
      });

      // Notify parent component
      onPreviewGenerated(0, end);
    });

    wavesurfer.on('timeupdate', (currentTime) => {
      setCurrentTime(currentTime);
      
      // Stop playback if we reach the end of the preview region
      const region = regions.getRegions()[0];
      if (region && currentTime >= region.end) {
        wavesurfer.pause();
        wavesurfer.seekTo(region.start / wavesurfer.getDuration());
        setIsPlaying(false);
      }
    });

    wavesurfer.on('play', () => setIsPlaying(true));
    wavesurfer.on('pause', () => setIsPlaying(false));

    // Handle region updates
    regions.on('region-updated', (region) => {
      setPreviewStart(region.start);
      setPreviewEnd(region.end);
      setPreviewDuration(region.end - region.start);
      
      // Notify parent component
      onPreviewGenerated(region.start, region.end);
    });

    // Store reference
    wavesurferRef.current = wavesurfer;

    // Cleanup
    return () => {
      wavesurfer.destroy();
      URL.revokeObjectURL(audioUrl);
    };
  }, [audioFile, onPreviewGenerated]);

  const handlePlayPause = () => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      // If we're at the end of the preview, go back to the start
      const region = regionsRef.current?.getRegions()[0];
      if (region && currentTime >= region.end) {
        wavesurferRef.current.seekTo(region.start / duration);
      }
      wavesurferRef.current.play();
    }
  };

  const handleReset = () => {
    if (!wavesurferRef.current || !regionsRef.current) return;
    
    // Remove existing regions
    regionsRef.current.clearRegions();
    
    // Create new default region
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
    
    // Notify parent component
    onPreviewGenerated(0, end);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Preview Trimmer</h3>
        <div className="text-sm text-muted-foreground">
          {formatTime(previewStart)} - {formatTime(previewEnd)} ({formatTime(previewDuration)})
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={`relative rounded-md border ${isLoading ? 'min-h-[80px] bg-secondary/30 animate-pulse' : ''}`}
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
        
        <div className="text-sm text-muted-foreground">
          Drag the highlighted region to set your 20-second preview
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        This preview will autoplay (muted) when users hover over your song in the main feed
      </div>
    </div>
  );
}
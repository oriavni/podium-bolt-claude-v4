"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Song } from "@/app/data/sample-songs";
import { Upload } from "lucide-react";

interface ShareImageEditorProps {
  song: Song;
  onComplete: (imageDataUrl: string) => void;
  onCancel: () => void;
}

export function ShareImageEditor({ song, onComplete, onCancel }: ShareImageEditorProps) {
  const [backgroundType, setBackgroundType] = useState<"cover" | "custom">("cover");
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standard Instagram post size: 1080x1080
  const canvasWidth = 1080;
  const canvasHeight = 1080;
  
  // Pre-load song cover image
  const coverImageRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = song.coverUrl;
    img.onload = () => {
      coverImageRef.current = img;
      renderImage();
    };
  }, [song.coverUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomBackground(result);
      const img = new Image();
      img.src = result;
      img.onload = () => {
        renderImage();
      };
    };
    reader.readAsDataURL(file);
  };

  const renderImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    if (backgroundType === "custom" && customBackground) {
      const img = new Image();
      img.src = customBackground;
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    }

    // Draw album artwork centered in top portion
    if (coverImageRef.current) {
      const coverSize = canvasWidth * 0.7; // 70% of canvas width
      const coverX = (canvasWidth - coverSize) / 2;
      const coverY = canvasHeight * 0.1; // 10% from top
      
      if (backgroundType === "cover") {
        // Use cover as blurred background
        ctx.filter = 'blur(20px) brightness(0.7)';
        ctx.drawImage(coverImageRef.current, 0, 0, canvasWidth, canvasHeight);
        ctx.filter = 'none';
      }
      
      // Draw album cover with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.drawImage(coverImageRef.current, coverX, coverY, coverSize, coverSize);
      ctx.shadowColor = 'transparent';
    }

    // Draw text and stats
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(song.title, canvasWidth / 2, canvasHeight * 0.65);
    
    ctx.font = "36px Arial";
    ctx.fillText(`by ${song.artist}`, canvasWidth / 2, canvasHeight * 0.7);
    
    // Draw stats
    ctx.font = "bold 32px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    
    // Draw stats boxes
    const statsY = canvasHeight * 0.78;
    const statsSpacing = canvasWidth / 3;
    
    // Plays
    ctx.fillText("PLAYS", statsSpacing * 0.5, statsY);
    ctx.font = "bold 40px Arial";
    ctx.fillText(formatNumber(song.plays), statsSpacing * 0.5, statsY + 50);
    
    // Likes
    ctx.font = "bold 32px Arial";
    ctx.fillText("LIKES", statsSpacing * 1.5, statsY);
    ctx.font = "bold 40px Arial";
    ctx.fillText(formatNumber(song.likes), statsSpacing * 1.5, statsY + 50);
    
    // Shares
    ctx.font = "bold 32px Arial";
    ctx.fillText("SHARES", statsSpacing * 2.5, statsY);
    ctx.font = "bold 40px Arial";
    ctx.fillText(formatNumber(song.stats?.shareCount || 0), statsSpacing * 2.5, statsY + 50);
    
    // App name at bottom
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("Listen on Podium", canvasWidth / 2, canvasHeight * 0.95);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const handleComplete = () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    // Small timeout to allow UI to update
    setTimeout(() => {
      const dataUrl = canvasRef.current?.toDataURL("image/jpeg", 0.9);
      setIsGenerating(false);
      if (dataUrl) {
        onComplete(dataUrl);
      }
    }, 100);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Render the image whenever background type changes
  useEffect(() => {
    renderImage();
  }, [backgroundType, customBackground]);

  return (
    <div className="space-y-6 w-full">
      <Tabs 
        defaultValue="cover" 
        onValueChange={(value) => setBackgroundType(value as "cover" | "custom")}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="cover">Use Cover Art</TabsTrigger>
          <TabsTrigger value="custom">Custom Background</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-300 cursor-pointer" onClick={triggerFileUpload}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Upload className="h-8 w-8 mb-2 text-gray-500" />
            <p className="text-sm text-gray-500">
              {customBackground ? "Change background image" : "Upload background image"}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <div className="border rounded-md overflow-hidden shadow-md" style={{ width: '100%', maxWidth: '400px' }}>
          <canvas 
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          disabled={isGenerating} 
          onClick={handleComplete}
        >
          {isGenerating ? "Generating..." : "Confirm & Share"}
        </Button>
      </div>
    </div>
  );
}
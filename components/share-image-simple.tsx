"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Song } from "@/lib/types";
import { SongSupportersDisplay } from "@/components/song-supporters-display";
import { Loader2, Share, Check, Download } from "lucide-react";

interface ShareImageSimpleProps {
  song: Song;
  onShare?: (imageUrl: string) => void;
}

export function ShareImageSimple({ song, onShare }: ShareImageSimpleProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate the image automatically on mount
  useEffect(() => {
    generateShareImage();
  }, [song]);
  
  const generateShareImage = async () => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    try {
      // Set canvas size (1200x630 is optimal for most social platforms)
      canvas.width = 1200;
      canvas.height = 630;
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Load and draw the cover image
      const coverImage = new Image();
      coverImage.crossOrigin = "anonymous";
      
      const drawCover = () => new Promise<void>((resolve, reject) => {
        coverImage.onload = () => {
          // Draw as background (cover fit)
          const imgRatio = coverImage.width / coverImage.height;
          const canvasRatio = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, drawX, drawY;
          if (imgRatio > canvasRatio) {
            // Image is wider than canvas ratio
            drawHeight = canvas.height;
            drawWidth = coverImage.width * (canvas.height / coverImage.height);
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller than canvas ratio
            drawWidth = canvas.width;
            drawHeight = coverImage.height * (canvas.width / coverImage.width);
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
          }
          
          ctx.drawImage(coverImage, drawX, drawY, drawWidth, drawHeight);
          
          // Add semi-transparent overlay
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          resolve();
        };
        
        coverImage.onerror = () => {
          console.error("Failed to load cover image");
          reject(new Error("Failed to load cover image"));
        };
      });
      
      // Set the image source after setting up the handlers
      coverImage.src = song.coverUrl;
      await drawCover();
      
      // Draw song title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(song.title, canvas.width / 2, canvas.height / 2 - 40);
      
      // Draw artist name
      ctx.font = "40px sans-serif";
      ctx.fillText(song.artist, canvas.width / 2, canvas.height / 2 + 30);
      
      // Draw song stats
      ctx.font = "30px sans-serif";
      ctx.textAlign = "center";
      
      const statsY = canvas.height / 2 + 100;
      const statsSpacing = 150;
      
      // Plays
      ctx.fillText(`${formatNumber(song.plays)}`, canvas.width / 2 - statsSpacing, statsY);
      ctx.font = "20px sans-serif";
      ctx.fillText("Plays", canvas.width / 2 - statsSpacing, statsY + 30);
      
      // Likes
      ctx.font = "30px sans-serif";
      ctx.fillText(`${formatNumber(song.likes)}`, canvas.width / 2, statsY);
      ctx.font = "20px sans-serif";
      ctx.fillText("Likes", canvas.width / 2, statsY + 30);
      
      // Supporters
      ctx.font = "30px sans-serif";
      ctx.fillText(`${formatNumber(song.supporters.length)}`, canvas.width / 2 + statsSpacing, statsY);
      ctx.font = "20px sans-serif";
      ctx.fillText("Supporters", canvas.width / 2 + statsSpacing, statsY + 30);
      
      // Add supporter avatars (simplified version)
      if (song.supporters.length > 0) {
        const supporterText = `Supported by: ${song.supporters.slice(0, 3).map(s => s.name).join(", ")}`;
        const remainingCount = song.supporters.length - 3;
        const remainingText = remainingCount > 0 ? ` +${remainingCount} more` : "";
        
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(supporterText + remainingText, canvas.width / 2, canvas.height - 80);
      }
      
      // Add Podium branding
      ctx.font = "18px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Podium", 30, canvas.height - 30);
      
      // Convert to image URL
      const imageUrl = canvas.toDataURL("image/png");
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error("Error generating share image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = async () => {
    if (!previewUrl) return;
    
    try {
      // In a real app, you'd create a shareable URL instead of copying the data URL
      await navigator.clipboard.writeText(previewUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };
  
  const downloadImage = () => {
    if (!previewUrl) return;
    
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${song.title.replace(/\s+/g, "-").toLowerCase()}-share.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleShare = () => {
    if (previewUrl && onShare) {
      onShare(previewUrl);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Preview Image */}
      <div className="rounded-md overflow-hidden border">
        {isGenerating ? (
          <div className="aspect-[1200/630] bg-muted flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : previewUrl ? (
          <img 
            src={previewUrl} 
            alt={`${song.title} by ${song.artist} - Share Image`}
            className="w-full aspect-[1200/630] object-cover"
          />
        ) : (
          <div className="aspect-[1200/630] bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No preview available</p>
          </div>
        )}
      </div>
      
      {/* Supporters */}
      {song.supporters.length > 0 && (
        <div className="py-3">
          <p className="text-sm font-medium mb-2">Supporters</p>
          <SongSupportersDisplay
            supporters={song.supporters}
            showAll={false}
            maxVisible={5}
            size="md"
            showTooltip={true}
            className="mb-2"
          />
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
          onClick={downloadImage}
          disabled={!previewUrl || isGenerating}
        >
          <Download className="h-4 w-4" />
          <span>Download</span>
        </Button>
        
        <Button 
          variant={isCopied ? "secondary" : "outline"}
          className="flex-1 flex items-center justify-center gap-2"
          onClick={copyToClipboard}
          disabled={!previewUrl || isGenerating}
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share className="h-4 w-4" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
        
        <Button 
          className="flex-1 flex items-center justify-center gap-2"
          onClick={handleShare}
          disabled={!previewUrl || isGenerating}
        >
          <Share className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
      
      {/* Hidden canvas used for image generation */}
      <canvas 
        ref={canvasRef} 
        style={{ display: "none" }}
      />
    </div>
  );
}

// Helper function to format numbers (1000 -> 1K)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}
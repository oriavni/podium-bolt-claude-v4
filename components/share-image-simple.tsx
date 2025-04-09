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

// Define platform-specific dimensions
type PlatformType = "default" | "instagram" | "facebook" | "twitter" | "whatsapp" | "email";

interface PlatformDimensions {
  width: number;
  height: number;
  name: string;
}

const PLATFORM_DIMENSIONS: Record<PlatformType, PlatformDimensions> = {
  default: { width: 1200, height: 630, name: "Default (All Platforms)" },
  instagram: { width: 1080, height: 1080, name: "Instagram (Square)" },
  facebook: { width: 1200, height: 630, name: "Facebook" },
  twitter: { width: 1200, height: 675, name: "Twitter" },
  whatsapp: { width: 800, height: 800, name: "WhatsApp" },
  email: { width: 600, height: 400, name: "Email" }
};

export function ShareImageSimple({ song, onShare }: ShareImageSimpleProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>("default");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate the image automatically on mount
  useEffect(() => {
    generateShareImage(selectedPlatform);
  }, [song, selectedPlatform]);
  
  const generateShareImage = async (platform: PlatformType = "default") => {
    if (!canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    try {
      // Set canvas size based on selected platform
      const dimensions = PLATFORM_DIMENSIONS[platform];
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      
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
      
      // Adjust text sizes based on canvas dimensions
      const baseSize = Math.min(canvas.width, canvas.height) / 20;
      
      // Draw song title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${baseSize * 1.2}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(song.title, canvas.width / 2, canvas.height / 2 - baseSize);
      
      // Draw artist name
      ctx.font = `${baseSize * 0.8}px sans-serif`;
      ctx.fillText(song.artist, canvas.width / 2, canvas.height / 2 + baseSize * 0.6);
      
      // Draw song stats
      ctx.font = `${baseSize * 0.6}px sans-serif`;
      ctx.textAlign = "center";
      
      const statsY = canvas.height / 2 + baseSize * 2;
      const statsSpacing = canvas.width / 8;
      
      // Plays
      ctx.fillText(`${formatNumber(song.plays)}`, canvas.width / 2 - statsSpacing, statsY);
      ctx.font = `${baseSize * 0.4}px sans-serif`;
      ctx.fillText("Plays", canvas.width / 2 - statsSpacing, statsY + baseSize * 0.6);
      
      // Likes
      ctx.font = `${baseSize * 0.6}px sans-serif`;
      ctx.fillText(`${formatNumber(song.likes)}`, canvas.width / 2, statsY);
      ctx.font = `${baseSize * 0.4}px sans-serif`;
      ctx.fillText("Likes", canvas.width / 2, statsY + baseSize * 0.6);
      
      // Supporters
      ctx.font = `${baseSize * 0.6}px sans-serif`;
      ctx.fillText(`${formatNumber(song.supporters.length)}`, canvas.width / 2 + statsSpacing, statsY);
      ctx.font = `${baseSize * 0.4}px sans-serif`;
      ctx.fillText("Supporters", canvas.width / 2 + statsSpacing, statsY + baseSize * 0.6);
      
      // Add supporter avatars - now draw actual avatars
      if (song.supporters.length > 0) {
        await drawSupporterAvatars(ctx, song.supporters, canvas.width, canvas.height, baseSize);
      }
      
      // Add Podium branding
      ctx.font = `${baseSize * 0.36}px sans-serif`;
      ctx.textAlign = "left";
      ctx.fillText("Podium", baseSize * 0.6, canvas.height - baseSize * 0.6);
      
      // Convert to image URL
      const imageUrl = canvas.toDataURL("image/png");
      setPreviewUrl(imageUrl);
    } catch (error) {
      console.error("Error generating share image:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to draw supporter avatars
  const drawSupporterAvatars = async (
    ctx: CanvasRenderingContext2D, 
    supporters: Array<any>,
    canvasWidth: number,
    canvasHeight: number,
    baseSize: number
  ) => {
    const maxAvatars = 5;
    const visibleSupporters = supporters.slice(0, maxAvatars);
    
    // Draw "Supported by" text
    ctx.font = `${baseSize * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Supported by", canvasWidth / 2, canvasHeight - baseSize * 3.5);
    
    // Calculate avatar size and spacing
    const avatarSize = baseSize * 1.5;
    const spacing = avatarSize / 3;
    const totalWidth = (visibleSupporters.length * avatarSize) + ((visibleSupporters.length - 1) * spacing);
    let startX = (canvasWidth - totalWidth) / 2;
    
    // Draw avatars
    const avatarPromises = visibleSupporters.map((supporter, index) => {
      return new Promise<void>((resolve) => {
        if (supporter.avatarUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            const x = startX + (index * (avatarSize + spacing));
            const y = canvasHeight - baseSize * 2.5;
            
            // Draw circle clip path
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.clip();
            
            // Draw avatar image
            ctx.drawImage(img, x, y, avatarSize, avatarSize);
            
            // Restore context
            ctx.restore();
            
            // Add border
            ctx.beginPath();
            ctx.arc(x + avatarSize/2, y + avatarSize/2, avatarSize/2, 0, Math.PI * 2, true);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            resolve();
          };
          
          img.onerror = () => {
            // On error, draw fallback circle with initial
            drawFallbackAvatar(ctx, supporter, startX + (index * (avatarSize + spacing)), canvasHeight - baseSize * 2.5, avatarSize);
            resolve();
          };
          
          img.src = supporter.avatarUrl;
        } else {
          // No avatar URL, draw fallback
          drawFallbackAvatar(ctx, supporter, startX + (index * (avatarSize + spacing)), canvasHeight - baseSize * 2.5, avatarSize);
          resolve();
        }
      });
    });
    
    await Promise.all(avatarPromises);
    
    // Draw any remaining count
    if (supporters.length > maxAvatars) {
      const remainingCount = supporters.length - maxAvatars;
      ctx.font = `${baseSize * 0.4}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(`+${remainingCount} more`, canvasWidth / 2, canvasHeight - baseSize * 0.8);
    }
  };
  
  // Helper to draw fallback avatar
  const drawFallbackAvatar = (
    ctx: CanvasRenderingContext2D,
    supporter: any,
    x: number,
    y: number,
    size: number
  ) => {
    // Draw circle background
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2, true);
    ctx.fillStyle = "#4F46E5"; // Indigo color for fallback
    ctx.fill();
    
    // Add border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw initial
    ctx.fillStyle = "white";
    ctx.font = `bold ${size * 0.5}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    const initial = supporter.name ? supporter.name.charAt(0).toUpperCase() : "?";
    ctx.fillText(initial, x + size/2, y + size/2);
    
    // Reset baseline
    ctx.textBaseline = "alphabetic";
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
    const platformName = PLATFORM_DIMENSIONS[selectedPlatform].name.split(" ")[0].toLowerCase();
    a.download = `${song.title.replace(/\s+/g, "-").toLowerCase()}-${platformName}-share.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleShare = () => {
    if (previewUrl && onShare) {
      onShare(previewUrl);
    }
  };
  
  // Helper to get the aspect ratio string for preview
  const getAspectRatio = () => {
    const dimensions = PLATFORM_DIMENSIONS[selectedPlatform];
    return `aspect-[${dimensions.width}/${dimensions.height}]`;
  };
  
  return (
    <div className="space-y-4">
      {/* Platform Selection */}
      <div className="flex flex-wrap gap-2 mb-2">
        {(Object.keys(PLATFORM_DIMENSIONS) as PlatformType[]).map((platform) => (
          <button
            key={platform}
            className={`px-3 py-1 text-sm rounded-full ${
              selectedPlatform === platform 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            onClick={() => setSelectedPlatform(platform)}
          >
            {PLATFORM_DIMENSIONS[platform].name}
          </button>
        ))}
      </div>
      
      {/* Preview Image */}
      <div className="rounded-md overflow-hidden border">
        {isGenerating ? (
          <div className={`${getAspectRatio()} bg-muted flex items-center justify-center`}>
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : previewUrl ? (
          <img 
            src={previewUrl} 
            alt={`${song.title} by ${song.artist} - Share Image`}
            className={`w-full ${getAspectRatio()} object-cover`}
          />
        ) : (
          <div className={`${getAspectRatio()} bg-muted flex items-center justify-center`}>
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
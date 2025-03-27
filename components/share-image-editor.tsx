"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Song, Supporter } from "@/lib/types";
import { SongSupportersDisplay } from "@/components/song-supporters-display";
import { 
  Download, 
  Share, 
  Type, 
  ImageIcon, 
  Users, 
  Layout,
  Check
} from "lucide-react";

interface ShareImageEditorProps {
  song: Song;
  onGenerate?: (imageBlob: Blob) => void;
  onShare?: (imageUrl: string) => void;
}

export function ShareImageEditor({ 
  song, 
  onGenerate, 
  onShare 
}: ShareImageEditorProps) {
  const [activeTab, setActiveTab] = useState("design");
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [template, setTemplate] = useState<"standard" | "supporters" | "chart">("standard");
  const [showSupporters, setShowSupporters] = useState(true);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [overlayColor, setOverlayColor] = useState("#000000");
  const [overlayOpacity, setOverlayOpacity] = useState(60);
  const [fontSize, setFontSize] = useState(50);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Reset copy state when URL changes
  useEffect(() => {
    setCopied(false);
  }, [previewUrl]);
  
  useEffect(() => {
    if (song) {
      setTitle(song.title);
      setArtist(song.artist);
    }
  }, [song]);
  
  const generateImage = async () => {
    if (!canvasRef.current) return;
    
    setGenerating(true);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to 1200x630 (2:1 ratio, optimized for social media)
    canvas.width = 1200;
    canvas.height = 630;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Load cover image
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Draw background image (cover fit)
      const imgRatio = img.width / img.height;
      const canvasRatio = canvas.width / canvas.height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas ratio
        drawHeight = canvas.height;
        drawWidth = img.width * (canvas.height / img.height);
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;
      } else {
        // Image is taller than canvas ratio
        drawWidth = canvas.width;
        drawHeight = img.height * (canvas.width / img.width);
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;
      }
      
      // Draw the image
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      // Draw overlay
      ctx.fillStyle = `${overlayColor}${Math.round(overlayOpacity * 2.55).toString(16).padStart(2, '0')}`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set text styles
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Draw title
      const titleFontSize = fontSize;
      ctx.font = `bold ${titleFontSize}px sans-serif`;
      ctx.fillText(title, canvas.width / 2, canvas.height / 2 - titleFontSize / 2);
      
      // Draw artist
      const artistFontSize = titleFontSize * 0.6;
      ctx.font = `${artistFontSize}px sans-serif`;
      ctx.fillText(artist, canvas.width / 2, canvas.height / 2 + titleFontSize / 2 + 20);
      
      // If showing supporters in template, add them
      if (template === "supporters" && showSupporters) {
        drawSupporters(ctx, song.supporters);
      }
      
      // Add platform branding
      const platformFontSize = titleFontSize * 0.3;
      ctx.font = `${platformFontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText("Podium", 40, canvas.height - 40);
      
      // Convert canvas to blob and set preview URL
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          if (onGenerate) {
            onGenerate(blob);
          }
        }
        setGenerating(false);
      }, 'image/png');
    };
    
    img.onerror = () => {
      console.error("Error loading image");
      setGenerating(false);
    };
    
    img.src = song.coverUrl;
  };
  
  const drawSupporters = (ctx: CanvasRenderingContext2D, supporters: Supporter[]) => {
    // This is a simplified version - the actual implementation would load avatar images
    // and draw them at the bottom of the canvas
    
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const maxSupporters = 5;
    const visibleSupporters = supporters.slice(0, maxSupporters);
    
    // Draw supporter text
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize * 0.35}px sans-serif`;
    ctx.fillText('Supported by', canvas.width / 2, canvas.height - 120);
    
    // In a real implementation, you would:
    // 1. Load avatar images
    // 2. Draw them in a row at the bottom
    // 3. Add supporter names
    
    // For now, just add supporter names in a row
    ctx.font = `${fontSize * 0.3}px sans-serif`;
    const supporterNames = visibleSupporters.map(s => s.name).join(', ');
    ctx.fillText(supporterNames, canvas.width / 2, canvas.height - 80);
    
    // Add number of additional supporters if any
    if (supporters.length > maxSupporters) {
      ctx.font = `${fontSize * 0.25}px sans-serif`;
      ctx.fillText(`+${supporters.length - maxSupporters} more supporters`, canvas.width / 2, canvas.height - 50);
    }
  };
  
  const handleShare = () => {
    if (previewUrl && onShare) {
      onShare(previewUrl);
    }
  };
  
  const handleCopyLink = async () => {
    if (!previewUrl) return;
    
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };
  
  const handleDownload = () => {
    if (!previewUrl) return;
    
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `${song.title.replace(/\s+/g, '-').toLowerCase()}-share.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span>Preview & Share</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="design" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Template Style</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                <div 
                  className={`aspect-[2/1] border rounded-md overflow-hidden relative cursor-pointer
                    ${template === 'standard' ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setTemplate('standard')}
                >
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                    <div className="w-10 h-5 bg-white/80 mb-1"></div>
                    <div className="w-8 h-3 bg-white/60"></div>
                  </div>
                  <span className="absolute bottom-1 left-1 text-xs text-white">Standard</span>
                </div>
                
                <div 
                  className={`aspect-[2/1] border rounded-md overflow-hidden relative cursor-pointer
                    ${template === 'supporters' ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setTemplate('supporters')}
                >
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                    <div className="w-10 h-4 bg-white/80 mb-1"></div>
                    <div className="w-8 h-3 bg-white/60 mb-3"></div>
                    <div className="flex">
                      <div className="w-3 h-3 rounded-full bg-white/90 -mr-1"></div>
                      <div className="w-3 h-3 rounded-full bg-white/90 -mr-1"></div>
                      <div className="w-3 h-3 rounded-full bg-white/90"></div>
                    </div>
                  </div>
                  <span className="absolute bottom-1 left-1 text-xs text-white">Supporters</span>
                </div>
                
                <div 
                  className={`aspect-[2/1] border rounded-md overflow-hidden relative cursor-pointer
                    ${template === 'chart' ? 'ring-2 ring-primary' : ''}
                  `}
                  onClick={() => setTemplate('chart')}
                >
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2">
                    <div className="w-10 h-4 bg-white/80 mb-1"></div>
                    <div className="w-8 h-3 bg-white/60 mb-2"></div>
                    <div className="w-12 h-5 bg-amber-500/80 rounded-sm flex items-center justify-center">
                      <span className="text-[8px] text-black font-bold">TRENDING</span>
                    </div>
                  </div>
                  <span className="absolute bottom-1 left-1 text-xs text-white">Chart</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="overlayColor">Background Overlay</Label>
              <div className="flex gap-4">
                <Input 
                  type="color" 
                  id="overlayColor"
                  value={overlayColor}
                  onChange={(e) => setOverlayColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="overlayOpacity" className="text-xs">Opacity: {overlayOpacity}%</Label>
                  <Slider
                    id="overlayOpacity"
                    min={0}
                    max={100}
                    step={1}
                    value={[overlayOpacity]}
                    onValueChange={(value) => setOverlayOpacity(value[0])}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Input 
                type="color" 
                id="textColor"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fontSize" className="text-xs">Text Size: {fontSize}px</Label>
              <Slider
                id="fontSize"
                min={20}
                max={80}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>
            
            {template === 'supporters' && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showSupporters">Show Supporters</Label>
                  <input
                    type="checkbox"
                    id="showSupporters"
                    checked={showSupporters}
                    onChange={(e) => setShowSupporters(e.target.checked)}
                    className="h-4 w-4"
                  />
                </div>
                
                {showSupporters && song.supporters.length > 0 && (
                  <div className="mt-4">
                    <Label>Supporters</Label>
                    <div className="mt-2">
                      <SongSupportersDisplay
                        supporters={song.supporters}
                        showAll={true}
                        size="md"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Input 
                id="artist" 
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
              />
            </div>
            
            <div className="pt-4 pb-2">
              <img 
                src={song.coverUrl} 
                alt={song.title} 
                className="w-full aspect-square object-cover rounded-md"
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-6">
          <div className="space-y-4">
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Share preview" 
                  className="w-full border rounded-md"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={generateImage}
                  className="absolute top-2 right-2"
                >
                  Regenerate
                </Button>
              </div>
            ) : (
              <div className="aspect-[2/1] flex flex-col items-center justify-center bg-muted rounded-md p-4">
                <Button 
                  onClick={generateImage} 
                  disabled={generating}
                  className="mb-2"
                >
                  {generating ? "Generating..." : "Generate Preview"}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Generate a preview to see how your share image will look
                </p>
              </div>
            )}
            
            {previewUrl && (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </Button>
                  
                  <Button 
                    variant={copied ? "secondary" : "outline"} 
                    onClick={handleCopyLink}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
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
                  
                  <Button onClick={handleShare} className="flex items-center gap-2">
                    <Share className="h-4 w-4" />
                    <span>Share</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Hidden canvas for image generation */}
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
        width="1200"
        height="630"
      />
    </div>
  );
}
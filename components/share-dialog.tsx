"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Link2, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShareImageSimple } from "@/components/share-image-simple";
import { Song } from "@/lib/types";

interface ShareDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ song, open, onOpenChange }: ShareDialogProps) {
  const [activeTab, setActiveTab] = useState("links");
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate URLs
  const songUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/song/${song.id}` 
    : `/song/${song.id}`;
  
  const embedCode = `<iframe width="100%" height="150" src="${songUrl}/embed" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };
  
  const handleSocialShare = (platform: 'facebook' | 'twitter' | 'instagram') => {
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(songUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out '${song.title}' by ${song.artist} on Podium`)}&url=${encodeURIComponent(songUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing via web API
        // This would typically open the Instagram app or show copy instructions
        alert('Copy the link and share it on Instagram');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  const handleImageShare = (imageUrl: string) => {
    // In a real app, this would upload the image to a server and get a shareable URL
    console.log("Sharing image:", imageUrl);
    
    // Mock implementation just copies the song URL
    handleCopy(songUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{song.title}"</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="links" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="links">Links & Embed</TabsTrigger>
            <TabsTrigger value="image">Share Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="links" className="space-y-4 pt-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Share Link</p>
              <div className="flex items-center space-x-2">
                <Input 
                  value={songUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => handleCopy(songUrl)} 
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Embed Code</p>
              <div className="flex items-center space-x-2">
                <Input 
                  value={embedCode} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => handleCopy(embedCode)} 
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium">Share on Social Media</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleSocialShare('facebook')}
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleSocialShare('twitter')}
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleSocialShare('instagram')}
                >
                  <Instagram className="h-4 w-4 mr-2" />
                  Instagram
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="pt-4">
            <ShareImageSimple 
              song={song} 
              onShare={handleImageShare}
            />
          </TabsContent>
        </Tabs>
        
        {isCopied && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-primary text-primary-foreground text-center text-sm">
            Copied to clipboard!
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
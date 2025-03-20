"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Mail, Link2, Apple as WhatsApp, Copy, CheckCheck, Image } from "lucide-react";
import { useState, useEffect } from "react";
import { type Song } from "@/app/data/sample-songs";
import { ShareImageEditor } from "./share-image-editor";

interface ShareDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ song, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  useEffect(() => {
    // Set up share URL and check for native sharing support
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/share/${song.id}`);
    setHasNativeShare('share' in navigator);
  }, [song.id]);

  useEffect(() => {
    // Reset state when dialog closes
    if (!open) {
      setShowImageEditor(false);
      setGeneratedImage(null);
      setSelectedPlatform(null);
    }
  }, [open]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareData = {
    title: `${song.title} by ${song.artist}`,
    text: `Check out "${song.title}" by ${song.artist} on Podium!`,
    url: shareUrl,
  };

  const handleShareClick = (platform: string) => {
    if (platform === 'instagram') {
      setSelectedPlatform('instagram');
      setShowImageEditor(true);
      return;
    }

    // For other platforms, proceed with regular sharing
    handleShare(platform);
  };

  const handleShare = async (platform: string) => {
    if (platform === 'native' && 'share' in navigator) {
      try {
        const shareOptions = { ...shareData };
        
        // If we have a generated image, include it in the share
        if (generatedImage) {
          // Convert data URL to File
          const response = await fetch(generatedImage);
          const blob = await response.blob();
          const file = new File([blob], 'podium-share.jpg', { type: 'image/jpeg' });
          
          // @ts-ignore - Files array is supported in Web Share API Level 2
          shareOptions.files = [file];
        }
        
        await navigator.share(shareOptions);
      } catch (err) {
        console.error('Error sharing:', err);
      }
      return;
    }

    const encodedText = encodeURIComponent(shareData.text);
    const encodedUrl = encodeURIComponent(shareData.url);

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodedText}%20${encodedUrl}`,
    };

    if (shareLinks[platform as keyof typeof shareLinks]) {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank');
    }
  };

  const handleImageComplete = (imageDataUrl: string) => {
    setGeneratedImage(imageDataUrl);
    setShowImageEditor(false);
    
    // If we know which platform was selected, proceed with sharing
    if (selectedPlatform) {
      if (selectedPlatform === 'instagram') {
        // For Instagram, we can't directly share, so we download the image
        // and show instructions
        downloadImage(imageDataUrl);
      } else {
        handleShare(selectedPlatform);
      }
    }
  };

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `podium-${song.title.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (showImageEditor) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Shareable Image</DialogTitle>
          </DialogHeader>
          
          <ShareImageEditor 
            song={song} 
            onComplete={handleImageComplete}
            onCancel={() => setShowImageEditor(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Song</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="flex flex-col items-center gap-2">
              <div className="border rounded-md overflow-hidden shadow-md" style={{ width: '100%', maxWidth: '250px' }}>
                <img 
                  src={generatedImage} 
                  alt="Generated share image" 
                  className="w-full h-auto"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImageEditor(true)}
                >
                  Edit Image
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadImage(generatedImage)}
                >
                  Download
                </Button>
              </div>
            </div>
          )}

          {/* Share URL */}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <CheckCheck className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShareClick('facebook')}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShareClick('instagram')}
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShareClick('whatsapp')}
            >
              <WhatsApp className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShareClick('email')}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          {/* Create Image Button */}
          {!generatedImage && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setShowImageEditor(true)}
            >
              <Image className="h-4 w-4" />
              Create Shareable Image
            </Button>
          )}

          {/* Native Share Button (if available) */}
          {hasNativeShare && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={() => handleShareClick('native')}
            >
              <Link2 className="h-4 w-4" />
              Share
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
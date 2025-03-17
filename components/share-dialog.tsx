"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter, Mail, Link2, Apple as WhatsApp, Copy, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { type Song } from "@/app/data/sample-songs";

interface ShareDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDialog({ song, open, onOpenChange }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [hasNativeShare, setHasNativeShare] = useState(false);

  useEffect(() => {
    // Set up share URL and check for native sharing support
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/share/${song.id}`);
    setHasNativeShare('share' in navigator);
  }, [song.id]);

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

  const handleShare = async (platform: string) => {
    if (platform === 'native' && 'share' in navigator) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
      return;
    }

    const encodedText = encodeURIComponent(shareData.text);
    const encodedUrl = encodeURIComponent(shareData.url);

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodedText}%20${encodedUrl}`,
    };

    window.open(shareLinks[platform as keyof typeof shareLinks], '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Song</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
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
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('whatsapp')}
            >
              <WhatsApp className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => handleShare('email')}
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
          </div>

          {/* Native Share Button (if available) */}
          {hasNativeShare && (
            <Button
              variant="default"
              className="w-full gap-2"
              onClick={() => handleShare('native')}
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
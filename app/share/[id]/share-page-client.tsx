"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, ThumbsUp, User, Share2, Download, Mail, Instagram, WhatsApp, Copy, Check } from "lucide-react";
import { type Song } from '@/app/data/sample-songs';
import Link from "next/link";
import { ShareImageSimple } from "@/components/share-image-simple";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SharePageClientProps {
  song: Song;
}

export function SharePageClient({ song }: SharePageClientProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("instagram");
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate a profile link for the artist
  const getArtistProfileLink = () => {
    // For simplicity, we'll assume all artists are musicians
    return `/profile/musician-1`;
  };

  // Generate a profile link for supporters
  const getSupporterProfileLink = (supporter: any) => {
    // Determine the role type for the URL
    const roleType = supporter.role.toLowerCase().includes('director') || 
                    supporter.role.toLowerCase().includes('producer') ? 
                    'professional' : 'media';
    
    return `/profile/${roleType}-1`;
  };
  
  // Handle image generation callback
  const handleImageGenerated = (imageUrl: string) => {
    setPreviewUrl(imageUrl);
  };
  
  // Copy share link to clipboard
  const copyToClipboard = () => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/share/${song.id}`
      : `/share/${song.id}`;
    
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{song.title}</h1>
            <Link 
              href={getArtistProfileLink()}
              className="text-xl md:text-2xl mb-6 hover:text-primary transition-colors inline-block"
            >
              {song.artist}
            </Link>
            <div className="mt-4 flex gap-2 justify-center">
              <Button size="lg" className="gap-2">
                <Play className="w-5 h-5" />
                Play Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 bg-black/30 hover:bg-black/50"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="w-5 h-5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Song Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-primary" />
              <span className="font-medium">{song.likes} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-5 h-5 text-primary" />
              <span className="font-medium">{song.plays} plays</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {song.supporters.length} supporters
              </span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {song.genre?.map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
          </div>

          {/* Supporters */}
          {song.supporters.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-center mb-4">
                Industry Support
              </h2>
              {song.supporters.map((supporter) => (
                <div
                  key={supporter.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50"
                >
                  <Link href={getSupporterProfileLink(supporter)}>
                    <Avatar>
                      <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                      <AvatarFallback>{supporter.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={getSupporterProfileLink(supporter)}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {supporter.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {supporter.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {supporter.comment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Listen to more music from {song.artist} on Podium
            </p>
            <Button size="lg" variant="default" asChild>
              <a href="/">Open Podium</a>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share "{song.title}"</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="image" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">Share Image</TabsTrigger>
              <TabsTrigger value="platforms">Share Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="image" className="space-y-4 pt-4">
              <ShareImageSimple song={song} onShare={handleImageGenerated} />
            </TabsContent>
            
            <TabsContent value="platforms" className="space-y-6 pt-4">
              {/* Share Platforms */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Share to</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const shareUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/share/${song.id}`
                        : `/share/${song.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      alert('Save the image and share it on Instagram with the copied link');
                    }}
                  >
                    <Instagram className="h-5 w-5" />
                    <span>Instagram</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const shareUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/share/${song.id}`
                        : `/share/${song.id}`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Check out "${song.title}" by ${song.artist} on Podium! ${shareUrl}`)}`, '_blank');
                    }}
                  >
                    <WhatsApp className="h-5 w-5" />
                    <span>WhatsApp</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      const shareUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/share/${song.id}`
                        : `/share/${song.id}`;
                      window.open(`mailto:?subject=${encodeURIComponent(`Check out "${song.title}" by ${song.artist}`)}&body=${encodeURIComponent(`I thought you might like "${song.title}" by ${song.artist}.\n\nListen here: ${shareUrl}`)}`, '_blank');
                    }}
                  >
                    <Mail className="h-5 w-5" />
                    <span>Email</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => {
                      if (previewUrl) {
                        const a = document.createElement("a");
                        a.href = previewUrl;
                        a.download = `${song.title.replace(/\s+/g, "-").toLowerCase()}-share.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      } else {
                        alert('Please generate an image first');
                      }
                    }}
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
              
              {/* Link Section */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Share Link</div>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={typeof window !== 'undefined' ? `${window.location.origin}/share/${song.id}` : `/share/${song.id}`}
                    readOnly 
                    className="flex-1"
                  />
                  <Button 
                    size="icon" 
                    variant={isCopied ? "default" : "outline"} 
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
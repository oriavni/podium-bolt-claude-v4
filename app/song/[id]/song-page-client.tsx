"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ShareImageSimple } from "@/components/share-image-simple";
import { 
  Play, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Heart,
  Share2, 
  MessageSquare,
  User,
  Award,
  ThumbsUp,
  Copy,
  Download,
  Mail,
  Instagram,
  WhatsApp,
  Check
} from "lucide-react";
import { type Song } from '@/app/data/sample-songs';
import { CommentsSection } from "@/components/comments-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useAudio } from "@/lib/context/audio-context";

interface SongPageClientProps {
  initialSong?: Song;
  songId?: string;
}

function getYoutubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      // Handle watch URLs
      if (urlObj.searchParams.has('v')) {
        return urlObj.searchParams.get('v');
      }
      
      // Handle embed URLs
      if (urlObj.pathname.includes('/embed/')) {
        return urlObj.pathname.split('/embed/')[1];
      }
      
      // Handle shorts URLs
      if (urlObj.pathname.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
}

export function SongPageClient({ initialSong, songId }: SongPageClientProps) {
  const [song, setSong] = useState<Song | null>(initialSong || null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { 
    play, 
    pause, 
    isPlaying, 
    currentSong, 
    togglePlayPause 
  } = useAudio();

  const isCurrentSong = currentSong?.id === song?.id;

  useEffect(() => {
    if (!song && songId) {
      // Try to find the song in localStorage
      const savedSongs = JSON.parse(localStorage.getItem('uploadedSongs') || '[]');
      const foundSong = savedSongs.find((s: Song) => s.id === songId);
      
      if (foundSong) {
        setSong(foundSong);
      } else {
        notFound();
      }
    }
  }, [song, songId]);

  useEffect(() => {
    if (!song?.youtubeUrl) return;

    const videoId = getYoutubeVideoId(song.youtubeUrl);
    if (videoId) {
      // Use a simple embed URL with minimal parameters
      setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}?mute=1`);
    } else {
      setYoutubeEmbedUrl(null);
    }
  }, [song?.youtubeUrl]);

  if (!song) {
    return null;
  }

  const handlePlayClick = () => {
    if (isCurrentSong) {
      togglePlayPause();
    } else if (song) {
      play(song);
    }
  };

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
  
  // Handle share link copy
  const copyToClipboard = () => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/share/${song.id}`
      : `/share/${song.id}`;
    
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Cover Art */}
        <div className="relative w-full md:w-[400px] aspect-square rounded-lg overflow-hidden">
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button
              size="lg"
              className="rounded-full w-16 h-16"
              onClick={handlePlayClick}
            >
              {isCurrentSong && isPlaying ? (
                <SkipBack className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8" />
              )}
            </Button>
          </div>
        </div>

        {/* Song Info */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
          <Link href={getArtistProfileLink()} className="text-xl text-muted-foreground mb-4 hover:text-primary transition-colors">
            {song.artist}
          </Link>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {song.genre?.map((g) => (
              <Badge key={g} variant="secondary">
                {g}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {song.likes} likes
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {song.plays} plays
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {song.supporters.length} supporters
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button className="gap-2">
              <Heart className="w-4 h-4" />
              Like
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => setShareDialogOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              Share
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="w-4 h-4" />
              Comments
            </Button>
          </div>
        </div>
      </div>

      {/* YouTube Embed */}
      {youtubeEmbedUrl && (
        <div className="mb-8">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary/50">
            <iframe
              src={youtubeEmbedUrl}
              className="absolute inset-0 w-full h-full"
              title={`${song.title} - YouTube video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-presentation"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}

      {/* Comments Section */}
      {showComments && (
        <div className="mb-8">
          <CommentsSection songId={song.id} />
        </div>
      )}

      {/* Supporters Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Industry Support</h2>
        <div className="grid gap-4">
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
              <div className="flex-1">
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
                <p className="text-sm text-muted-foreground mb-2">
                  {supporter.comment}
                </p>
                <span className="text-xs text-muted-foreground">
                  {supporter.date}
                </span>
              </div>
              <Award className="w-5 h-5 text-primary" />
            </div>
          ))}
        </div>
      </div>

      {/* Audio Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  onClick={handlePlayClick}
                >
                  {isCurrentSong && isPlaying ? (
                    <SkipBack className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Button variant="ghost" size="icon">
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>
              <div className="hidden md:block">
                <p className="font-medium">{song.title}</p>
                <Link 
                  href={getArtistProfileLink()}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {song.artist}
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24 h-1 bg-secondary rounded-full">
                <div className="w-3/4 h-full bg-primary rounded-full" />
              </div>
            </div>
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
              {/* Rich Share Image Generator */}
              <ShareImageSimple song={song} />
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
                      const shareUrl = typeof window !== 'undefined'
                        ? `${window.location.origin}/share/${song.id}`
                        : `/share/${song.id}`;
                      window.open(shareUrl, '_blank');
                    }}
                  >
                    <Download className="h-5 w-5" />
                    <span>Open Share Page</span>
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
                    variant={copied ? "default" : "outline"}
                    onClick={copyToClipboard}
                    className="flex-shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
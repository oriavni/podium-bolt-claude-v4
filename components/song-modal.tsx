"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  X,
  BarChart,
  ListMusic,
  Download,
  Clock,
  Users,
  Headphones,
  Calendar,
  Instagram,
  Facebook,
  Music2,
  Twitter,
  ExternalLink // Renamed from Link to ExternalLink
} from "lucide-react";
import { type Song } from '@/app/data/sample-songs';
import { ShareDialog } from "@/components/share-dialog";
import { CommentsSection } from "@/components/comments-section";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SongModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  
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

export function SongModal({ song, isOpen, onClose }: SongModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  // Handle YouTube embed URL
  useEffect(() => {
    if (!song?.youtubeUrl) {
      setYoutubeEmbedUrl(null);
      return;
    }

    const videoId = getYoutubeVideoId(song.youtubeUrl);
    if (videoId) {
      setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}?mute=1`);
    } else {
      setYoutubeEmbedUrl(null);
    }
  }, [song?.youtubeUrl]);

  // Handle animation when opening/closing
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match the transition duration
  };

  if (!song) return null;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Generate song statistics (mock data for now)
  const songStats = song.stats || {
    uniqueListeners: Math.floor(song.plays * 0.7), // 70% of plays are unique listeners
    totalPlays: song.plays,
    downloads: Math.floor(song.plays * 0.15), // 15% of plays result in downloads
    playlistAdds: Math.floor(song.likes * 0.8), // 80% of likes add to playlist
    completionRate: 78, // percentage of listeners who listen to the entire song
    averageListenTime: "2:45", // average time spent listening
    skipRate: 22, // percentage of listeners who skip the song
    fanListeners: Math.floor(song.plays * 0.6), // 60% are fans
    musicianListeners: Math.floor(song.plays * 0.3), // 30% are musicians
    proListeners: Math.floor(song.plays * 0.1), // 10% are industry pros
    peakDay: "2025-03-15", // day with most listens
    shareCount: Math.floor(song.plays * 0.05), // 5% of plays result in shares
  };

  // Check if the song has any social links
  const hasSocialLinks = song.socialLinks && Object.values(song.socialLinks).some(link => link);

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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className={cn(
              "fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300",
              isAnimating ? "opacity-100" : "opacity-0"
            )}
            onClick={handleClose}
          />
          
          {/* Modal Content */}
          <div 
            className={cn(
              "relative bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300",
              isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            {/* Close Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-4 z-10"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>

            <div className="p-6">
              {/* Hero Section */}
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                {/* Cover Art */}
                <div className="relative w-full md:w-[300px] aspect-square rounded-lg overflow-hidden">
                  <img
                    src={song.coverUrl}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      <Play className="w-8 h-8" />
                    </Button>
                  </div>
                </div>

                {/* Song Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
                  <div onClick={(e) => e.stopPropagation()}>
                    <Link 
                      href={getArtistProfileLink()} 
                      className="text-xl text-muted-foreground hover:text-primary transition-colors block mb-4"
                    >
                      {song.artist}
                    </Link>
                  </div>
                  
                  {/* Social Media Links */}
                  {hasSocialLinks && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {song.socialLinks?.instagram && (
                        <a 
                          href={`https://${song.socialLinks.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Instagram className="w-4 h-4" />
                          <span>Instagram</span>
                        </a>
                      )}
                      {song.socialLinks?.facebook && (
                        <a 
                          href={`https://${song.socialLinks.facebook}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Facebook className="w-4 h-4" />
                          <span>Facebook</span>
                        </a>
                      )}
                      {song.socialLinks?.spotify && (
                        <a 
                          href={`https://${song.socialLinks.spotify}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Music2 className="w-4 h-4" />
                          <span>Spotify</span>
                        </a>
                      )}
                      {song.socialLinks?.soundcloud && (
                        <a 
                          href={`https://${song.socialLinks.soundcloud}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Music2 className="w-4 h-4" />
                          <span>SoundCloud</span>
                        </a>
                      )}
                      {song.socialLinks?.twitter && (
                        <a 
                          href={`https://${song.socialLinks.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Twitter className="w-4 h-4" />
                          <span>Twitter</span>
                        </a>
                      )}
                      {song.socialLinks?.youtube && (
                        <a 
                          href={`https://youtube.com/${song.socialLinks.youtube}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>YouTube</span>
                        </a>
                      )}
                    </div>
                  )}
                  
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
                        {formatNumber(song.likes)} likes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatNumber(song.plays)} plays
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
                    <Button 
                      variant="secondary" 
                      className="gap-2"
                      onClick={() => setShowStats(!showStats)}
                    >
                      <BarChart className="w-4 h-4" />
                      Stats
                    </Button>
                  </div>
                </div>
              </div>

              {/* Song Statistics Section */}
              {showStats && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Song Statistics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Audience Stats */}
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Audience
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Unique Listeners</span>
                          <span className="font-medium">{formatNumber(songStats.uniqueListeners)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fans</span>
                          <span className="font-medium">{formatNumber(songStats.fanListeners)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Musicians</span>
                          <span className="font-medium">{formatNumber(songStats.musicianListeners)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Pros</span>
                          <span className="font-medium">{formatNumber(songStats.proListeners)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Engagement Stats */}
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Headphones className="w-4 h-4" /> Engagement
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Plays</span>
                          <span className="font-medium">{formatNumber(songStats.totalPlays)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Downloads</span>
                          <span className="font-medium">{formatNumber(songStats.downloads)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Playlist Adds</span>
                          <span className="font-medium">{formatNumber(songStats.playlistAdds)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Shares</span>
                          <span className="font-medium">{formatNumber(songStats.shareCount)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Performance
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Completion Rate</span>
                          <span className="font-medium">{songStats.completionRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Avg. Listen Time</span>
                          <span className="font-medium">{songStats.averageListenTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Skip Rate</span>
                          <span className="font-medium">{songStats.skipRate}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Days Since Upload</span>
                          <span className="font-medium">{songStats.daysSinceUpload}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Trend Visualization */}
                  <div className="mt-4 bg-secondary/30 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Engagement Trend</h3>
                    <div className="h-24 flex items-end gap-1">
                      {Array.from({ length: 30 }).map((_, i) => {
                        // Generate a random height for the bar between 20% and 100%
                        const height = 20 + Math.floor(Math.random() * 80);
                        // Make the middle bars taller to simulate a peak
                        const adjustedHeight = i > 10 && i < 20 ? Math.min(height + 30, 100) : height;
                        return (
                          <div 
                            key={i} 
                            className="bg-primary/60 hover:bg-primary transition-colors rounded-t w-full"
                            style={{ height: `${adjustedHeight}%` }}
                            title={`Day ${i+1}: ${Math.floor(adjustedHeight * songStats.totalPlays / 100)} plays`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>{new Date(song.uploadDate).toLocaleDateString()}</span>
                      <span>30-Day Trend</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}

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
                      <div onClick={(e) => e.stopPropagation()}>
                        <Link href={getSupporterProfileLink(supporter)}>
                          <Avatar>
                            <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                            <AvatarFallback>{supporter.name[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div onClick={(e) => e.stopPropagation()}>
                            <Link 
                              href={getSupporterProfileLink(supporter)}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {supporter.name}
                            </Link>
                          </div>
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
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                        <Play className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <p className="font-medium">{song.title}</p>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Link 
                          href={getArtistProfileLink()}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {song.artist}
                        </Link>
                      </div>
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
          </div>
        </div>
      )}

      {/* Share Dialog */}
      <ShareDialog
        song={song}
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </>
  );
}
"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Music, 
  MoreVertical, 
  Play, 
  Shuffle, 
  Clock, 
  Plus,
  Heart,
  Share2,
  Download,
  Pencil
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditPlaylistDialog } from "@/components/edit-playlist-dialog";
import { AddToPlaylistDialog } from "@/components/add-to-playlist-dialog";
import Link from "next/link";

interface PlaylistSong {
  id: string;
  title: string;
  artist: string;
  duration: string;
  added_at: string;
  coverUrl: string;
}

interface Playlist {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  song_count: number;
  songs: PlaylistSong[];
  owner?: {
    name: string;
    avatar_url?: string;
  };
}

interface PlaylistPageClientProps {
  id: string;
  name?: string;
  isPredefined: boolean;
}

export function PlaylistPageClient({ id, name, isPredefined }: PlaylistPageClientProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addSongsDialogOpen, setAddSongsDialogOpen] = useState(false);

  useEffect(() => {
    // TODO: Implement with Supabase
    // For now, we'll use mock data
    const mockPlaylist: Playlist = {
      id,
      title: name || "My Custom Playlist",
      description: isPredefined 
        ? "System generated playlist" 
        : "A collection of my favorite songs",
      is_public: true,
      created_at: new Date().toISOString(),
      song_count: 3,
      owner: isPredefined ? undefined : {
        name: "John Doe",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&q=80"
      },
      songs: [
        {
          id: "1",
          title: "Midnight Dreams",
          artist: "Luna Eclipse",
          duration: "3:45",
          added_at: new Date().toISOString(),
          coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"
        },
        {
          id: "2",
          title: "Urban Beats",
          artist: "Metro Pulse",
          duration: "4:20",
          added_at: new Date().toISOString(),
          coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80"
        },
        {
          id: "3",
          title: "Ocean Waves",
          artist: "Coastal Harmony",
          duration: "5:10",
          added_at: new Date().toISOString(),
          coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80"
        }
      ]
    };

    setPlaylist(mockPlaylist);
    setIsLoading(false);
  }, [id, name, isPredefined]);

  const handleEditPlaylist = (updatedData: Partial<Playlist>) => {
    if (!playlist) return;
    setPlaylist({ ...playlist, ...updatedData });
    setEditDialogOpen(false);
  };

  const handleAddSongs = (songs: PlaylistSong[]) => {
    if (!playlist) return;
    setPlaylist({
      ...playlist,
      songs: [...playlist.songs, ...songs],
      song_count: playlist.song_count + songs.length
    });
    setAddSongsDialogOpen(false);
  };

  const handleRemoveSong = async (songId: string) => {
    if (!playlist) return;
    // TODO: Implement with Supabase
    setPlaylist({
      ...playlist,
      songs: playlist.songs.filter(song => song.id !== songId),
      song_count: playlist.song_count - 1
    });
  };

  // Generate a profile link for the artist
  const getArtistProfileLink = (artistName: string) => {
    // For simplicity, we'll assume all artists are musicians
    return `/profile/musician-1`;
  };

  // Generate a profile link for the playlist owner
  const getOwnerProfileLink = () => {
    // For simplicity, we'll assume the owner is a fan
    return `/profile/fan-1`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-1/3 bg-secondary rounded mb-4" />
          <div className="h-4 w-1/4 bg-secondary rounded mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Playlist Not Found</h1>
          <p className="text-muted-foreground">
            The playlist you're looking for doesn't exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start gap-6 mb-8">
        <div className="w-48 h-48 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
          {playlist.songs.length > 0 ? (
            <div className="grid grid-cols-2 grid-rows-2 h-full">
              {playlist.songs.slice(0, 4).map((song, index) => (
                <img
                  key={song.id}
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
              ))}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-24 h-24 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {!playlist.is_public && (
              <Badge variant="secondary">Private</Badge>
            )}
            <Badge variant="outline">Playlist</Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">{playlist.title}</h1>
          {playlist.description && (
            <p className="text-muted-foreground mb-4">{playlist.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {playlist.owner && (
              <div className="flex items-center gap-2">
                <Link href={getOwnerProfileLink()}>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={playlist.owner.avatar_url} />
                    <AvatarFallback>{playlist.owner.name[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <Link 
                  href={getOwnerProfileLink()}
                  className="hover:text-primary transition-colors"
                >
                  {playlist.owner.name}
                </Link>
              </div>
            )}
            <span>{playlist.song_count} songs</span>
            <span>•</span>
            <span>
              Created {formatDistanceToNow(new Date(playlist.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <Button size="lg" className="gap-2">
          <Play className="w-5 h-5" />
          Play
        </Button>
        <Button size="lg" variant="secondary" className="gap-2">
          <Shuffle className="w-5 h-5" />
          Shuffle
        </Button>
        {!isPredefined && (
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className="w-4 h-4" />
            Edit Details
          </Button>
        )}
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setAddSongsDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Add Songs
        </Button>
      </div>

      {/* Songs List */}
      {playlist.songs.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No songs yet</h2>
          <p className="text-muted-foreground mb-4">
            Start adding songs to your playlist
          </p>
          <Button onClick={() => setAddSongsDialogOpen(true)}>Add Songs</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Table Header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-2 text-sm text-muted-foreground">
            <div className="w-10">#</div>
            <div>Title</div>
            <div className="text-right">
              <Clock className="w-4 h-4" />
            </div>
            <div className="w-10"></div>
          </div>

          {/* Songs */}
          {playlist.songs.map((song, index) => (
            <div
              key={song.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors items-center"
            >
              <div className="w-10 text-muted-foreground text-sm text-center">
                {index + 1}
              </div>
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={song.coverUrl}
                  alt={song.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="min-w-0">
                  <p className="font-medium truncate">{song.title}</p>
                  <Link 
                    href={getArtistProfileLink(song.artist)}
                    className="text-sm text-muted-foreground truncate hover:text-primary transition-colors"
                  >
                    {song.artist}
                  </Link>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {song.duration}
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2">
                      <Heart className="w-4 h-4" /> Like
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Share2 className="w-4 h-4" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2">
                      <Download className="w-4 h-4" /> Download
                    </DropdownMenuItem>
                    {!isPredefined && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRemoveSong(song.id)}
                          className="text-destructive gap-2"
                        >
                          Remove from Playlist
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {!isPredefined && (
        <EditPlaylistDialog
          playlist={playlist}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleEditPlaylist}
        />
      )}
      
      <AddToPlaylistDialog
        open={addSongsDialogOpen}
        onOpenChange={setAddSongsDialogOpen}
        onAdd={handleAddSongs}
      />
    </div>
  );
}
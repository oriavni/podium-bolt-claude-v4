"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, Clock, Music, Plus, MoreVertical } from "lucide-react";
import { CreatePlaylistDialog } from "@/components/create-playlist-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SongButton } from "@/components/song-button";

interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string;
  uploadDate: string;
  coverUrl: string;
  genre?: string[];
  supporters: any[];
  likes: number;
  plays: number;
}

interface Playlist {
  id: string;
  title: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  song_count: number;
}

export default function LibraryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("songs");
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [uploadedSongs, setUploadedSongs] = useState<Song[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('uploadedSongs');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const handleUploadClick = () => {
    router.push('/upload');
  };

  const handlePlaylistCreated = (playlist: Playlist) => {
    setPlaylists(prev => [playlist, ...prev]);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    try {
      // TODO: Implement with Supabase
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    } catch (error) {
      console.error("Failed to delete playlist:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Library</h1>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="liked">Liked</TabsTrigger>
        </TabsList>

        <TabsContent value="songs" className="mt-6">
          <div className="grid gap-4">
            {uploadedSongs.length === 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <Music className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium">Your uploaded songs will appear here</h3>
                  <p className="text-sm text-muted-foreground">
                    Start by uploading your music
                  </p>
                </div>
                <Button variant="secondary" onClick={handleUploadClick}>
                  Upload Music
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedSongs.map((song) => (
                  <SongButton 
                    key={song.id} 
                    song={song}
                    className="cursor-pointer"
                  >
                    <div
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <Music className="w-6 h-6 text-muted-foreground" />
                      <div className="flex-1">
                        <h3 className="font-medium">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">{song.duration}</div>
                      <div className="text-sm text-muted-foreground">{song.uploadDate}</div>
                    </div>
                  </SongButton>
                ))}
                <Button variant="secondary" onClick={handleUploadClick} className="mt-4">
                  Upload More Music
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="grid gap-4">
            {playlists.length === 0 ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
                <Clock className="w-8 h-8 text-muted-foreground" />
                <div className="flex-1">
                  <h3 className="font-medium">Create your first playlist</h3>
                  <p className="text-sm text-muted-foreground">
                    Start organizing your music
                  </p>
                </div>
                <Button variant="secondary" onClick={() => setCreatePlaylistOpen(true)}>
                  Create Playlist
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <Button onClick={() => setCreatePlaylistOpen(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Playlist
                  </Button>
                </div>
                <div className="grid gap-2">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                        <Music className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{playlist.title}</h3>
                        {playlist.description && (
                          <p className="text-sm text-muted-foreground truncate">
                            {playlist.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {playlist.song_count} {playlist.song_count === 1 ? 'song' : 'songs'}
                          </span>
                          {!playlist.is_public && (
                            <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => router.push(`/playlist/${playlist.id}`)}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePlaylist(playlist.id)}
                            className="text-destructive"
                          >
                            Delete Playlist
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="liked" className="mt-6">
          <div className="grid gap-4">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors">
              <Heart className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">No liked songs yet</h3>
                <p className="text-sm text-muted-foreground">
                  Songs you like will appear here
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onOpenChange={setCreatePlaylistOpen}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
}
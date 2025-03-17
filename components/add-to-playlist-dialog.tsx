"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Music, Plus, Youtube, Music2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Song } from "@/lib/types";

interface AddToPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (songs: Song[]) => void;
}

export function AddToPlaylistDialog({
  open,
  onOpenChange,
  onAdd
}: AddToPlaylistDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock songs data - replace with Supabase query
  const availableSongs: Song[] = [
    {
      id: "4",
      title: "Electric Soul",
      artist: "Voltage Dreams",
      duration: "3:30",
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
      source: {
        type: "platform",
        url: "/songs/electric-soul",
        audioUrl: "/audio/electric-soul.mp3"
      },
      creator: {
        id: "1",
        name: "Voltage Dreams",
        role: "creator"
      },
      uploadedAt: new Date().toISOString()
    },
    {
      id: "5",
      title: "Desert Wind",
      artist: "Sahara Nights",
      duration: "4:15",
      coverUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&q=80",
      source: {
        type: "youtube",
        url: "https://youtube.com/watch?v=example"
      },
      uploadedAt: new Date().toISOString()
    },
    {
      id: "6",
      title: "Mountain High",
      artist: "Peak Experience",
      duration: "3:45",
      coverUrl: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&q=80",
      source: {
        type: "spotify",
        url: "https://open.spotify.com/track/example"
      },
      creator: {
        id: "2",
        name: "Music Pro",
        role: "professional"
      },
      uploadedAt: new Date().toISOString()
    }
  ];

  const filteredSongs = availableSongs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSong = (songId: string) => {
    const newSelected = new Set(selectedSongs);
    if (newSelected.has(songId)) {
      newSelected.delete(songId);
    } else {
      newSelected.add(songId);
    }
    setSelectedSongs(newSelected);
  };

  const handleAdd = async () => {
    if (selectedSongs.size === 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const songsToAdd = availableSongs.filter(song => selectedSongs.has(song.id));
      onAdd(songsToAdd);
      setSelectedSongs(new Set());
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to add songs:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSourceIcon = (source: Song['source']['type']) => {
    switch (source) {
      case 'youtube':
        return <Youtube className="w-4 h-4" />;
      case 'spotify':
        return <Music2 className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Songs to Playlist</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search songs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Songs List */}
          <ScrollArea className="h-[300px] pr-4">
            {filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Music className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  No songs found matching your search
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedSongs.has(song.id)
                        ? "bg-primary/10"
                        : "hover:bg-secondary/80"
                    }`}
                    onClick={() => toggleSong(song.id)}
                  >
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{song.title}</p>
                        <Badge variant="secondary" className="text-xs">
                          {getSourceIcon(song.source.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}
                        </p>
                        {song.creator && (
                          <Badge variant="outline" className="text-[10px]">
                            {song.creator.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {song.duration}
                    </span>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedSongs.has(song.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground"
                    }`}>
                      {selectedSongs.has(song.id) && (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-muted-foreground">
            {selectedSongs.size} {selectedSongs.size === 1 ? "song" : "songs"} selected
          </p>
          <div className="flex gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={selectedSongs.size === 0 || isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add to Playlist"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
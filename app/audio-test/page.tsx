"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadSongForm } from "@/components/upload-song-form";
import { SongPreviewPlayer } from "@/components/song-preview-player";
import { sampleSongs } from "@/app/data/sample-songs";
import { useAudio } from "@/lib/context/audio-context";

export default function AudioTestPage() {
  const [hoveredSongId, setHoveredSongId] = useState<string | null>(null);
  const { play, currentSong, isPlaying, pause } = useAudio();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Audio Player Testing</h1>
      
      <Tabs defaultValue="playback">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="playback">Preview Playback</TabsTrigger>
          <TabsTrigger value="upload">Upload with Trimmer</TabsTrigger>
          <TabsTrigger value="player">Global Player</TabsTrigger>
        </TabsList>
        
        <TabsContent value="playback" className="space-y-6">
          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Preview on Hover Test</h2>
            <p className="text-muted-foreground mb-6">
              Hover over the song cards below to test the preview functionality. Each song has different trim settings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {sampleSongs.map((song) => (
                <div 
                  key={song.id}
                  className="relative rounded-lg overflow-hidden cursor-pointer bg-card border"
                  onMouseEnter={() => setHoveredSongId(song.id)}
                  onMouseLeave={() => setHoveredSongId(null)}
                  onClick={() => currentSong?.id === song.id && isPlaying ? pause() : play(song)}
                >
                  <div className="aspect-square">
                    <img 
                      src={song.coverUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  {/* Preview Player */}
                  <SongPreviewPlayer 
                    song={song}
                    isHovering={hoveredSongId === song.id}
                  />
                  
                  <div className="p-3">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    <div className="text-xs text-muted-foreground mt-2">
                      Preview: {song.previewTrim?.start || 0}s - {song.previewTrim?.end || 20}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upload">
          <UploadSongForm />
        </TabsContent>
        
        <TabsContent value="player" className="space-y-6">
          <div className="bg-card p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Global Audio Player Test</h2>
            <p className="text-muted-foreground mb-6">
              Click on any song to play it in the global player. The player should appear at the bottom of the screen.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleSongs.map((song) => (
                <div 
                  key={song.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/30 cursor-pointer"
                  onClick={() => currentSong?.id === song.id && isPlaying ? pause() : play(song)}
                >
                  <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                    <img 
                      src={song.coverUrl} 
                      alt={song.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{song.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      {song.genre?.join(", ")}
                    </div>
                  </div>
                  
                  <Button 
                    variant={currentSong?.id === song.id && isPlaying ? "default" : "outline"} 
                    size="sm"
                  >
                    {currentSong?.id === song.id && isPlaying ? "Pause" : "Play"}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
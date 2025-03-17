import { Metadata } from "next";
import { playlists } from "@/lib/data";
import { PlaylistPageClient } from "./client";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  // Extract playlist index from the ID
  const match = params.id.match(/^playlist-(\d+)$/);
  let playlistName = "Custom Playlist";
  
  if (match) {
    const index = parseInt(match[1]) - 1;
    if (playlists[index]) {
      playlistName = playlists[index];
    }
  }
  
  return {
    title: `${playlistName} - Podium`,
    description: `Listen to ${playlistName} on Podium`,
  };
}

// Generate static params for both predefined and custom playlists
export function generateStaticParams() {
  // Generate params for predefined playlists
  const predefinedParams = playlists.map((_, index) => ({
    id: `playlist-${index + 1}`,
  }));

  // Add a catch-all pattern for custom playlists
  const customParams = [{ id: "custom-[id]" }];

  return [...predefinedParams, ...customParams];
}

export default function PlaylistPage({ params }: PageProps) {
  // Handle predefined playlists
  const playlistMatch = params.id.match(/^playlist-(\d+)$/);
  if (playlistMatch) {
    const index = parseInt(playlistMatch[1]) - 1;
    if (index >= 0 && index < playlists.length) {
      return <PlaylistPageClient id={params.id} name={playlists[index]} isPredefined />;
    }
  }

  // Handle custom playlists
  const customMatch = params.id.match(/^custom-([a-zA-Z0-9-]+)$/);
  if (customMatch) {
    return <PlaylistPageClient id={params.id} isPredefined={false} />;
  }

  // If neither pattern matches, return 404
  notFound();
}
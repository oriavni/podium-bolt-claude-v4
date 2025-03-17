import { type Song, type Playlist, type UserRole } from './types';
import { USER_ROLES, SONG_SOURCES, UPLOAD_PERMISSIONS } from './constants';

export function canCreatePlaylist(userRole: UserRole): boolean {
  // All authenticated users can create playlists
  return true;
}

export function canEditPlaylist(playlist: Playlist, userId: string): boolean {
  return playlist.user_id === userId;
}

export function canAddSongs(userRole: UserRole): boolean {
  // All authenticated users can add existing songs to playlists
  return true;
}

export function canUploadSong(userRole: UserRole, sourceType: string): boolean {
  const allowedSources = UPLOAD_PERMISSIONS[userRole as keyof typeof UPLOAD_PERMISSIONS];
  return allowedSources.includes(sourceType);
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function calculatePlaylistDuration(songs: Song[]): string {
  const totalSeconds = songs.reduce((total, song) => {
    const [minutes, seconds] = song.metadata.duration.split(':').map(Number);
    return total + (minutes * 60 + seconds);
  }, 0);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export function generatePlaylistCover(songs: Song[]): string {
  // If no songs, return default cover
  if (songs.length === 0) {
    return '/images/default-playlist-cover.jpg';
  }
  
  // Return the cover of the first song
  return songs[0].coverUrl;
}

export function sortPlaylistSongs(songs: Song[], sortBy: 'added' | 'title' | 'artist' | 'duration'): Song[] {
  return [...songs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'duration':
        return a.metadata.duration.localeCompare(b.metadata.duration);
      case 'added':
      default:
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    }
  });
}

export function validatePlaylistUpdate(data: Partial<Playlist>): boolean {
  if (data.title && (data.title.length < 1 || data.title.length > 100)) {
    return false;
  }
  
  if (data.description && data.description.length > 500) {
    return false;
  }
  
  return true;
}
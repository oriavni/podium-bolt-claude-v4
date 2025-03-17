export const USER_ROLES = {
  CREATOR: 'creator',
  PROFESSIONAL: 'professional',
  USER: 'user',
  ADMIN: 'admin',
  MEDIA: 'media',
} as const;

export const SONG_SOURCES = {
  PLATFORM: 'platform',
  YOUTUBE: 'youtube',
  SPOTIFY: 'spotify',
} as const;

export const UPLOAD_PERMISSIONS = {
  [USER_ROLES.CREATOR]: ['platform'],
  [USER_ROLES.PROFESSIONAL]: ['youtube', 'spotify'],
  [USER_ROLES.ADMIN]: ['platform', 'youtube', 'spotify'],
  [USER_ROLES.USER]: [],
  [USER_ROLES.MEDIA]: [],
} as const;

export const AUDIO_FILE_TYPES = [
  'audio/mpeg',  // .mp3
  'audio/wav',   // .wav
  'audio/ogg',   // .ogg
  'audio/aac',   // .aac
  'audio/flac',  // .flac
];

export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
export const SPOTIFY_URL_REGEX = /^(https?:\/\/)?(open\.spotify\.com)\/.+$/;
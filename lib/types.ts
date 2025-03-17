export type UserRole = 'musician' | 'professional' | 'fan' | 'admin' | 'media' | 'influencer';

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  location: string | null;
  
  // Role-specific fields
  professionalTitle?: string;
  company?: string;
  verified: boolean;
  credentials?: string[];
  genres?: string[];
  instruments?: string[];
  
  // Social links
  socialLinks: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  
  // Stats
  followerCount: number;
  followingCount: number;
  songCount: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  
  // Media-specific fields
  mediaOutlet?: string;
  approvedByAdmin?: boolean;
}

export interface ModeratorAction {
  id: string;
  moderatorId: string;
  contentType: 'song' | 'comment' | 'user';
  contentId: string;
  action: 'approve' | 'reject' | 'ban';
  reason?: string;
  createdAt: string;
}

export interface ProfessionalFeedback {
  id: string;
  professionalId: string;
  songId: string;
  content: string;
  rating?: number;
  price?: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  youtubeUrl?: string;
  genre?: string[];
  supporters: Supporter[];
  likes: number;
  plays: number;
  uploadDate: string;
  approvedBy?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  professionalFeedback: ProfessionalFeedback[];
}

export interface Supporter {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  comment: string;
  date: string;
}
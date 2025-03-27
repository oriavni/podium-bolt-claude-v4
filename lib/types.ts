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
    tiktok?: string;
    facebook?: string;
  };
  
  // Stats
  followerCount: number;
  followingCount: number;
  songCount: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  
  // Approval status for professional/media/influencer
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvedByAdmin?: boolean;
  approvalDate?: string;
  rejectionReason?: string;
  
  // Profile completion status
  profileCompleted: boolean;
  
  // Media-specific fields
  mediaOutlet?: string;
  
  // Professional-specific fields
  services?: ProfileService[];
  availableForWork?: boolean;
  
  // Musician-specific fields
  photoGallery?: string[];
  previousReleases?: string[];
  
  // Influencer-specific fields
  audience?: string;
  reachStats?: {
    followers: number;
    avgEngagement: number;
    platform: string;
  }[];
}

export interface ProfileService {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  isPublic: boolean;
}

export interface RequiredProfileField {
  field: string;
  label: string;
  description?: string;
  required: boolean;
}

export const profileRequirements: Record<UserRole, RequiredProfileField[]> = {
  musician: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: true },
    { field: 'bio', label: 'Bio', required: true },
    { field: 'socialLinks', label: 'Social Links', required: true },
    { field: 'genres', label: 'Genres', required: true },
    { field: 'photoGallery', label: 'Photo Gallery', required: false },
    { field: 'previousReleases', label: 'Previous Releases', required: false }
  ],
  professional: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: true },
    { field: 'bio', label: 'Bio', required: true },
    { field: 'professionalTitle', label: 'Professional Title', required: true },
    { field: 'company', label: 'Company', required: false },
    { field: 'socialLinks', label: 'Social Links', required: true },
    { field: 'services', label: 'Services Offered', required: true },
    { field: 'availableForWork', label: 'Available For Work', required: true }
  ],
  media: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: true },
    { field: 'bio', label: 'Bio', required: true },
    { field: 'mediaOutlet', label: 'Media Outlet', required: true },
    { field: 'socialLinks', label: 'Social Links', required: true },
    { field: 'website', label: 'Website', required: true }
  ],
  influencer: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: true },
    { field: 'bio', label: 'Bio', required: true },
    { field: 'socialLinks', label: 'Social Links', required: true },
    { field: 'audience', label: 'Audience', required: true },
    { field: 'reachStats', label: 'Platform Stats', required: true }
  ],
  fan: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: false },
    { field: 'bio', label: 'Bio', required: false }
  ],
  admin: [
    { field: 'displayName', label: 'Display Name', required: true },
    { field: 'avatarUrl', label: 'Profile Picture', required: true }
  ]
};

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
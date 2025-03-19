/**
 * Social Metrics Aggregator
 * This file combines data from multiple social media platforms to create a comprehensive artist rating
 */

import { getInstagramMetrics, calculateInstagramScore } from './instagram/instagram-api';
import { getYouTubeMetrics, calculateYouTubeScore } from './youtube/youtube-api';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Types
export interface SocialProfile {
  userId: string;
  instagramConnected: boolean;
  youtubeConnected: boolean;
  spotifyConnected?: boolean; // For future implementation
  soundcloudConnected?: boolean; // For future implementation
  tiktokConnected?: boolean; // For future implementation
  lastUpdated: number;
}

export interface ArtistRating {
  overall: number; // 0-100 scale
  followers: number; // Total followers across platforms
  engagement: number; // Average engagement rate
  consistency: number; // Posting consistency
  growth: number; // Growth rate over time
  platforms: {
    instagram?: number; // 0-100 scale
    youtube?: number; // 0-100 scale
    spotify?: number; // For future implementation
    soundcloud?: number; // For future implementation
    tiktok?: number; // For future implementation
  };
  lastUpdated: number;
}

/**
 * Get a user's connected social profiles
 */
export async function getSocialProfile(userId: string): Promise<SocialProfile | null> {
  try {
    const profileDoc = await getDoc(doc(db, 'social_profiles', userId));
    
    if (profileDoc.exists()) {
      return profileDoc.data() as SocialProfile;
    }
    
    // If no profile exists, create a default one
    const defaultProfile: SocialProfile = {
      userId,
      instagramConnected: false,
      youtubeConnected: false,
      spotifyConnected: false,
      soundcloudConnected: false,
      tiktokConnected: false,
      lastUpdated: Date.now()
    };
    
    await setDoc(doc(db, 'social_profiles', userId), defaultProfile);
    
    return defaultProfile;
  } catch (error) {
    console.error('Error getting social profile:', error);
    return null;
  }
}

/**
 * Update a user's social profile connection status
 */
export async function updateSocialConnection(
  userId: string, 
  platform: 'instagram' | 'youtube' | 'spotify' | 'soundcloud' | 'tiktok',
  isConnected: boolean
): Promise<void> {
  try {
    const profile = await getSocialProfile(userId);
    
    if (!profile) {
      throw new Error('Social profile not found');
    }
    
    const updatedProfile = {
      ...profile,
      [`${platform}Connected`]: isConnected,
      lastUpdated: Date.now()
    };
    
    await setDoc(doc(db, 'social_profiles', userId), updatedProfile);
  } catch (error) {
    console.error(`Error updating ${platform} connection:`, error);
    throw error;
  }
}

/**
 * Calculate overall artist rating based on all connected platforms
 */
export async function calculateArtistRating(userId: string): Promise<ArtistRating | null> {
  try {
    // First check if we have a recent cached rating
    const ratingDoc = await getDoc(doc(db, 'artist_ratings', userId));
    
    // If we have recent rating (less than 1 day old), return it
    if (ratingDoc.exists()) {
      const cachedRating = ratingDoc.data() as ArtistRating;
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      if (cachedRating.lastUpdated > oneDayAgo) {
        return cachedRating;
      }
    }
    
    // Get user's social profile to see which platforms are connected
    const profile = await getSocialProfile(userId);
    
    if (!profile) {
      return null;
    }
    
    const platforms: {
      instagram?: number;
      youtube?: number;
    } = {};
    
    let totalFollowers = 0;
    let totalEngagement = 0;
    let platformCount = 0;
    
    // Get Instagram metrics if connected
    if (profile.instagramConnected) {
      const instagramMetrics = await getInstagramMetrics(userId);
      
      if (instagramMetrics) {
        platforms.instagram = calculateInstagramScore(instagramMetrics);
        totalFollowers += instagramMetrics.followers;
        totalEngagement += instagramMetrics.engagement;
        platformCount++;
      }
    }
    
    // Get YouTube metrics if connected
    if (profile.youtubeConnected) {
      const youtubeMetrics = await getYouTubeMetrics(userId);
      
      if (youtubeMetrics) {
        platforms.youtube = calculateYouTubeScore(youtubeMetrics);
        totalFollowers += youtubeMetrics.subscriberCount;
        totalEngagement += youtubeMetrics.engagement;
        platformCount++;
      }
    }
    
    // If no platforms are connected, return null
    if (platformCount === 0) {
      return null;
    }
    
    // Calculate average engagement
    const avgEngagement = totalEngagement / platformCount;
    
    // For demo purposes, we'll use fixed values for consistency and growth
    const consistency = 75; // 0-100 scale
    const growth = 82; // 0-100 scale
    
    // Calculate overall score as weighted average of all platform scores
    // Plus additional factors for cross-platform presence
    let overallScore = 0;
    let totalWeight = 0;
    
    // Calculate weighted platform scores
    if (platforms.instagram !== undefined) {
      overallScore += platforms.instagram * 0.4; // Instagram weight: 40%
      totalWeight += 0.4;
    }
    
    if (platforms.youtube !== undefined) {
      overallScore += platforms.youtube * 0.4; // YouTube weight: 40%
      totalWeight += 0.4;
    }
    
    // Add bonus for multi-platform presence (up to 20%)
    const platformBonus = (platformCount > 1) ? 20 : 0;
    
    // Normalize the score if we have platforms
    if (totalWeight > 0) {
      overallScore = (overallScore / totalWeight) * 0.8; // 80% of score from platforms
      overallScore += platformBonus; // Up to 20% bonus for multi-platform
    }
    
    // Create the artist rating
    const artistRating: ArtistRating = {
      overall: Math.round(overallScore),
      followers: totalFollowers,
      engagement: avgEngagement,
      consistency,
      growth,
      platforms,
      lastUpdated: Date.now()
    };
    
    // Store the rating in Firestore
    await setDoc(doc(db, 'artist_ratings', userId), artistRating);
    
    return artistRating;
  } catch (error) {
    console.error('Error calculating artist rating:', error);
    return null;
  }
}

/**
 * Generate a text description of an artist's social media presence
 */
export function generateArtistSocialDescription(rating: ArtistRating): string {
  if (!rating) return 'No social media data available.';
  
  // Create tier designation
  let tier: string;
  let tierDescription: string;
  
  if (rating.overall >= 90) {
    tier = 'Elite';
    tierDescription = 'world-class social media presence with exceptional engagement';
  } else if (rating.overall >= 80) {
    tier = 'Professional';
    tierDescription = 'strong social media presence with high engagement';
  } else if (rating.overall >= 70) {
    tier = 'Established';
    tierDescription = 'solid social media presence with good engagement';
  } else if (rating.overall >= 60) {
    tier = 'Rising';
    tierDescription = 'growing social media presence with moderate engagement';
  } else if (rating.overall >= 50) {
    tier = 'Emerging';
    tierDescription = 'developing social media presence with average engagement';
  } else {
    tier = 'Early Stage';
    tierDescription = 'building social media presence with room for growth';
  }
  
  // Format followers count
  const formattedFollowers = rating.followers > 1000000 
    ? `${(rating.followers / 1000000).toFixed(1)}M`
    : rating.followers > 1000
      ? `${(rating.followers / 1000).toFixed(1)}K`
      : rating.followers.toString();
  
  // Create platform-specific descriptions
  const platformDescriptions: string[] = [];
  
  if (rating.platforms.instagram !== undefined) {
    platformDescriptions.push(`Instagram (${rating.platforms.instagram}/100)`);
  }
  
  if (rating.platforms.youtube !== undefined) {
    platformDescriptions.push(`YouTube (${rating.platforms.youtube}/100)`);
  }
  
  const platformText = platformDescriptions.length > 0
    ? `Active on ${platformDescriptions.join(' and ')}.`
    : '';
  
  // Create the full description
  return `${tier} Artist: ${formattedFollowers} followers with a ${tierDescription}. ${platformText} Overall rating: ${rating.overall}/100.`;
}
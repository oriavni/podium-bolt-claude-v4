/**
 * Instagram API Integration
 * This file handles interactions with Instagram Graph API to fetch user metrics
 */

import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

// Instagram API configuration
const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v18.0';

// Types
export interface InstagramToken {
  userId: string;
  accessToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

export interface InstagramMetrics {
  followers: number;
  following: number;
  mediaCount: number;
  engagement: number; // Average engagement per post
  recentPosts: InstagramPost[];
  lastUpdated: number; // Timestamp
}

export interface InstagramPost {
  id: string;
  type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  permalink: string;
  caption?: string;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
}

/**
 * Stores Instagram API tokens in Firestore
 */
export async function storeInstagramToken(userId: string, token: string, expiresIn: number): Promise<void> {
  try {
    const tokenData: InstagramToken = {
      userId,
      accessToken: token,
      expiresAt: Date.now() + (expiresIn * 1000), // Convert seconds to milliseconds
    };

    // Store in Firestore
    await setDoc(doc(db, 'social_credentials', `instagram_${userId}`), {
      ...tokenData,
      provider: 'instagram',
      updatedAt: new Date().toISOString(),
    });

    console.log('Instagram token stored successfully');
  } catch (error) {
    console.error('Error storing Instagram token:', error);
    throw error;
  }
}

/**
 * Get Instagram metrics for a user
 */
export async function getInstagramMetrics(userId: string): Promise<InstagramMetrics | null> {
  try {
    // First check if we have cached metrics
    const metricsDoc = await getDoc(doc(db, 'social_metrics', `instagram_${userId}`));
    
    // If we have recent metrics (less than 1 hour old), return them
    if (metricsDoc.exists()) {
      const cachedMetrics = metricsDoc.data() as InstagramMetrics;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (cachedMetrics.lastUpdated > oneHourAgo) {
        return cachedMetrics;
      }
    }
    
    // Otherwise, fetch fresh metrics from Instagram API
    const tokenDoc = await getDoc(doc(db, 'social_credentials', `instagram_${userId}`));
    
    if (!tokenDoc.exists()) {
      console.error('No Instagram token found for user:', userId);
      return null;
    }
    
    const tokenData = tokenDoc.data() as InstagramToken;
    
    // Check if token is expired
    if (tokenData.expiresAt < Date.now()) {
      console.error('Instagram token expired for user:', userId);
      return null;
    }
    
    // In a real implementation, we would make API calls to Instagram Graph API here
    // For demo purposes, we'll return mock data
    const mockMetrics: InstagramMetrics = {
      followers: 12500,
      following: 850,
      mediaCount: 324,
      engagement: 8.7,
      lastUpdated: Date.now(),
      recentPosts: [
        {
          id: 'mock_post_1',
          type: 'IMAGE',
          mediaUrl: 'https://picsum.photos/id/1015/500',
          permalink: 'https://instagram.com/p/mock1',
          caption: 'New single dropping soon! #music #newrelease',
          likesCount: 542,
          commentsCount: 48,
          timestamp: new Date().toISOString()
        },
        {
          id: 'mock_post_2',
          type: 'VIDEO',
          mediaUrl: 'https://picsum.photos/id/1018/500',
          permalink: 'https://instagram.com/p/mock2',
          caption: 'Behind the scenes at the studio. Working on something special!',
          likesCount: 876,
          commentsCount: 92,
          timestamp: new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString() // 3 days ago
        },
        {
          id: 'mock_post_3',
          type: 'CAROUSEL_ALBUM',
          mediaUrl: 'https://picsum.photos/id/1019/500',
          permalink: 'https://instagram.com/p/mock3',
          caption: 'Tour photos from last weekend. Thanks to everyone who came out!',
          likesCount: 1204,
          commentsCount: 147,
          timestamp: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)).toISOString() // 7 days ago
        }
      ]
    };
    
    // Store the metrics in Firestore for caching
    await setDoc(doc(db, 'social_metrics', `instagram_${userId}`), mockMetrics);
    
    return mockMetrics;
  } catch (error) {
    console.error('Error getting Instagram metrics:', error);
    return null;
  }
}

/**
 * Connect to Instagram (OAuth authorization)
 */
export function getInstagramAuthUrl(redirectUri: string): string {
  const instagramAppId = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
  
  if (!instagramAppId) {
    throw new Error('Instagram App ID not configured');
  }
  
  // In a real implementation, this would be the Instagram OAuth URL
  // For demo purposes, we'll return a mock URL
  return `https://api.instagram.com/oauth/authorize?client_id=${instagramAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;
}

/**
 * Calculate an artist's Instagram influence score based on metrics
 */
export function calculateInstagramScore(metrics: InstagramMetrics): number {
  if (!metrics) return 0;
  
  // Basic formula that weights different factors:
  // 40% followers, 30% engagement rate, 20% consistency, 10% content quality
  
  // Followers score (max 40 points)
  let followersScore = 0;
  if (metrics.followers > 1000000) followersScore = 40;       // 1M+ followers
  else if (metrics.followers > 500000) followersScore = 35;   // 500K-1M followers
  else if (metrics.followers > 100000) followersScore = 30;   // 100K-500K followers
  else if (metrics.followers > 50000) followersScore = 25;    // 50K-100K followers
  else if (metrics.followers > 10000) followersScore = 20;    // 10K-50K followers
  else if (metrics.followers > 5000) followersScore = 15;     // 5K-10K followers
  else if (metrics.followers > 1000) followersScore = 10;     // 1K-5K followers
  else followersScore = 5;                                    // <1K followers
  
  // Engagement score (max: 30 points)
  // Engagement = average (likes + comments) / followers * 100
  const engagementScore = Math.min(30, metrics.engagement * 3);
  
  // Consistency score based on post frequency (max: 20 points)
  // In a real implementation, we would analyze post frequency over time
  // For demo purposes, we'll assign a fixed score
  const consistencyScore = 15;
  
  // Content quality score (max: 10 points)
  // In a real implementation, we would analyze content quality
  // For demo purposes, we'll assign a fixed score
  const contentQualityScore = 8;
  
  // Calculate total score
  const totalScore = followersScore + engagementScore + consistencyScore + contentQualityScore;
  
  // Normalize to 0-100 scale
  return Math.min(100, totalScore);
}
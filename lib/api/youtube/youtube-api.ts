/**
 * YouTube API Integration
 * This file handles interactions with YouTube Data API to fetch channel metrics
 */

import { google, youtube_v3 } from 'googleapis';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// YouTube API configuration
const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY // This would be set in environment variables
});

// Types
export interface YouTubeToken {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

export interface YouTubeMetrics {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  engagement: number; // Average engagement per video
  recentVideos: YouTubeVideo[];
  lastUpdated: number; // Timestamp
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
}

/**
 * Stores YouTube API tokens in Firestore
 */
export async function storeYouTubeToken(
  userId: string, 
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): Promise<void> {
  try {
    const tokenData: YouTubeToken = {
      userId,
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000), // Convert seconds to milliseconds
    };

    // Store in Firestore
    await setDoc(doc(db, 'social_credentials', `youtube_${userId}`), {
      ...tokenData,
      provider: 'youtube',
      updatedAt: new Date().toISOString(),
    });

    console.log('YouTube token stored successfully');
  } catch (error) {
    console.error('Error storing YouTube token:', error);
    throw error;
  }
}

/**
 * Get YouTube metrics for a user
 */
export async function getYouTubeMetrics(userId: string): Promise<YouTubeMetrics | null> {
  try {
    // First check if we have cached metrics
    const metricsDoc = await getDoc(doc(db, 'social_metrics', `youtube_${userId}`));
    
    // If we have recent metrics (less than 1 hour old), return them
    if (metricsDoc.exists()) {
      const cachedMetrics = metricsDoc.data() as YouTubeMetrics;
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      
      if (cachedMetrics.lastUpdated > oneHourAgo) {
        return cachedMetrics;
      }
    }
    
    // Otherwise, fetch fresh metrics from YouTube API
    const tokenDoc = await getDoc(doc(db, 'social_credentials', `youtube_${userId}`));
    
    if (!tokenDoc.exists()) {
      console.error('No YouTube token found for user:', userId);
      return null;
    }
    
    const tokenData = tokenDoc.data() as YouTubeToken;
    
    // Check if token is expired
    if (tokenData.expiresAt < Date.now()) {
      console.error('YouTube token expired for user:', userId);
      // In a real implementation, we would refresh the token here
      return null;
    }
    
    // In a real implementation, we would make API calls to YouTube Data API here
    // For demo purposes, we'll return mock data
    const mockMetrics: YouTubeMetrics = {
      channelId: 'UC_mock_channel_id',
      channelTitle: 'Artist Official',
      subscriberCount: 45600,
      viewCount: 1750000,
      videoCount: 87,
      engagement: 7.2, // Average engagement rate
      lastUpdated: Date.now(),
      recentVideos: [
        {
          id: 'mock_video_1',
          title: 'Official Music Video - New Single',
          description: 'Official music video for my latest single. Stream it now on all platforms!',
          thumbnailUrl: 'https://picsum.photos/id/1038/500/280',
          publishedAt: new Date().toISOString(),
          viewCount: 157834,
          likeCount: 12400,
          commentCount: 923,
          duration: 'PT3M42S', // ISO 8601 duration format
        },
        {
          id: 'mock_video_2',
          title: 'Studio Session - Behind the Scenes',
          description: 'Take a look at the making of my upcoming album',
          thumbnailUrl: 'https://picsum.photos/id/1039/500/280',
          publishedAt: new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)).toISOString(), // 2 weeks ago
          viewCount: 43587,
          likeCount: 3245,
          commentCount: 256,
          duration: 'PT8M15S',
        },
        {
          id: 'mock_video_3',
          title: 'Live Performance at Summer Festival',
          description: 'Highlights from my set at this year\'s Summer Festival',
          thumbnailUrl: 'https://picsum.photos/id/1040/500/280',
          publishedAt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)).toISOString(), // 1 month ago
          viewCount: 98452,
          likeCount: 8720,
          commentCount: 412,
          duration: 'PT12M38S',
        }
      ]
    };
    
    // Store the metrics in Firestore for caching
    await setDoc(doc(db, 'social_metrics', `youtube_${userId}`), mockMetrics);
    
    return mockMetrics;
  } catch (error) {
    console.error('Error getting YouTube metrics:', error);
    return null;
  }
}

/**
 * Calculate an artist's YouTube influence score based on metrics
 */
export function calculateYouTubeScore(metrics: YouTubeMetrics): number {
  if (!metrics) return 0;
  
  // Basic formula that weights different factors:
  // 35% subscribers, 25% views, 20% engagement, 20% content quality/consistency
  
  // Subscribers score (max 35 points)
  let subscribersScore = 0;
  if (metrics.subscriberCount > 10000000) subscribersScore = 35;      // 10M+ subscribers
  else if (metrics.subscriberCount > 5000000) subscribersScore = 32;  // 5M-10M subscribers
  else if (metrics.subscriberCount > 1000000) subscribersScore = 29;  // 1M-5M subscribers
  else if (metrics.subscriberCount > 500000) subscribersScore = 26;   // 500K-1M subscribers
  else if (metrics.subscriberCount > 100000) subscribersScore = 23;   // 100K-500K subscribers
  else if (metrics.subscriberCount > 50000) subscribersScore = 20;    // 50K-100K subscribers
  else if (metrics.subscriberCount > 10000) subscribersScore = 17;    // 10K-50K subscribers
  else if (metrics.subscriberCount > 1000) subscribersScore = 12;     // 1K-10K subscribers
  else subscribersScore = 5;                                         // <1K subscribers
  
  // Views score (max 25 points)
  let viewsScore = 0;
  if (metrics.viewCount > 100000000) viewsScore = 25;                // 100M+ views
  else if (metrics.viewCount > 50000000) viewsScore = 23;            // 50M-100M views
  else if (metrics.viewCount > 10000000) viewsScore = 20;            // 10M-50M views
  else if (metrics.viewCount > 5000000) viewsScore = 18;             // 5M-10M views
  else if (metrics.viewCount > 1000000) viewsScore = 15;             // 1M-5M views
  else if (metrics.viewCount > 500000) viewsScore = 12;              // 500K-1M views
  else if (metrics.viewCount > 100000) viewsScore = 9;               // 100K-500K views
  else if (metrics.viewCount > 10000) viewsScore = 6;                // 10K-100K views
  else viewsScore = 3;                                              // <10K views
  
  // Engagement score (max: 20 points)
  // Engagement = average (likes + comments) / views * 100
  const engagementScore = Math.min(20, metrics.engagement * 2);
  
  // Content quality and consistency (max: 20 points)
  // In a real implementation, we would analyze video frequency, quality, etc.
  // For demo purposes, we'll use video count as a proxy for consistency
  let contentScore = 0;
  if (metrics.videoCount > 500) contentScore = 20;                   // 500+ videos
  else if (metrics.videoCount > 200) contentScore = 18;              // 200-500 videos
  else if (metrics.videoCount > 100) contentScore = 16;              // 100-200 videos
  else if (metrics.videoCount > 50) contentScore = 14;               // 50-100 videos
  else if (metrics.videoCount > 25) contentScore = 12;               // 25-50 videos
  else if (metrics.videoCount > 10) contentScore = 10;               // 10-25 videos
  else contentScore = 5;                                            // <10 videos
  
  // Calculate total score
  const totalScore = subscribersScore + viewsScore + engagementScore + contentScore;
  
  // Normalize to 0-100 scale
  return Math.min(100, totalScore);
}

/**
 * Connect to YouTube (OAuth authorization)
 */
export function getYouTubeAuthUrl(redirectUri: string): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri
  );
  
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ];
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    include_granted_scopes: true
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeYouTubeCode(code: string, redirectUri: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    redirectUri
  );
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    return {
      accessToken: tokens.access_token || '',
      refreshToken: tokens.refresh_token || '',
      expiresIn: tokens.expires_in || 3600
    };
  } catch (error) {
    console.error('Error exchanging YouTube authorization code:', error);
    throw error;
  }
}
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Users, 
  Headphones, 
  Clock, 
  Calendar, 
  ListMusic, 
  Download, 
  Share2, 
  ThumbsUp 
} from "lucide-react";

interface SongStatsCardProps {
  stats: {
    uniqueListeners: number;
    totalPlays: number;
    downloads: number;
    playlistAdds: number;
    completionRate: number;
    averageListenTime: string;
    skipRate: number;
    fanListeners: number;
    musicianListeners: number;
    proListeners: number;
    peakDay: string;
    uploadDate: string;
    daysSinceUpload: number;
    shareCount: number;
  };
}

export function SongStatsCard({ stats }: SongStatsCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="w-5 h-5 text-primary" />
          Song Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Audience Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" /> Audience
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Unique Listeners</span>
                <Badge variant="outline">{formatNumber(stats.uniqueListeners)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fans</span>
                <Badge variant="outline">{formatNumber(stats.fanListeners)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Musicians</span>
                <Badge variant="outline">{formatNumber(stats.musicianListeners)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Industry Pros</span>
                <Badge variant="outline">{formatNumber(stats.proListeners)}</Badge>
              </div>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Headphones className="w-4 h-4" /> Engagement
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Plays</span>
                <Badge variant="outline">{formatNumber(stats.totalPlays)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Downloads</span>
                <Badge variant="outline">{formatNumber(stats.downloads)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Playlist Adds</span>
                <Badge variant="outline">{formatNumber(stats.playlistAdds)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Shares</span>
                <Badge variant="outline">{formatNumber(stats.shareCount)}</Badge>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" /> Performance
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <Badge variant="outline">{stats.completionRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg. Listen Time</span>
                <Badge variant="outline">{stats.averageListenTime}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Skip Rate</span>
                <Badge variant="outline">{stats.skipRate}%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Days Live</span>
                <Badge variant="outline">{stats.daysSinceUpload}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Trend Visualization */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">30-Day Engagement Trend</h3>
          <div className="h-24 flex items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              // Generate a random height for the bar between 20% and 100%
              const height = 20 + Math.floor(Math.random() * 80);
              // Make the middle bars taller to simulate a peak
              const adjustedHeight = i > 10 && i < 20 ? Math.min(height + 30, 100) : height;
              return (
                <div 
                  key={i} 
                  className="bg-primary/60 hover:bg-primary transition-colors rounded-t w-full"
                  style={{ height: `${adjustedHeight}%` }}
                  title={`Day ${i+1}: ${Math.floor(adjustedHeight * stats.totalPlays / 100)} plays`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{new Date(stats.uploadDate).toLocaleDateString()}</span>
            <span>Peak: {new Date(stats.peakDay).toLocaleDateString()}</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
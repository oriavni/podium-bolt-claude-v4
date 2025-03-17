import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlayCircle, Music, ThumbsUp, Bookmark, Headphones, BarChart2, Clock, Heart } from "lucide-react";

export default function CrowdDashboard() {
  // Sample data
  const recentlyPlayed = [
    { id: 1, title: "Sunset Dreams", artist: "Lunar Waves", coverUrl: "https://picsum.photos/id/1015/200", duration: "3:42" },
    { id: 2, title: "Electric Soul", artist: "Neon Pulse", coverUrl: "https://picsum.photos/id/1035/200", duration: "2:58" },
    { id: 3, title: "Mountain High", artist: "Echo Chamber", coverUrl: "https://picsum.photos/id/1018/200", duration: "4:15" },
  ];

  const recommendations = [
    { id: 1, title: "Urban Flow", artist: "City Beats", genre: "Hip-Hop", match: 95 },
    { id: 2, title: "Cosmic Voyage", artist: "Star Collective", genre: "Ambient", match: 92 },
    { id: 3, title: "Rhythm & Blues", artist: "Soul Junction", genre: "R&B", match: 88 },
    { id: 4, title: "Digital Dreams", artist: "Binary Beats", genre: "Electronic", match: 85 },
  ];

  const playlists = [
    { id: 1, name: "Morning Vibes", songCount: 24, lastUpdated: "2 days ago" },
    { id: 2, name: "Workout Mix", songCount: 18, lastUpdated: "1 week ago" },
    { id: 3, name: "Late Night", songCount: 32, lastUpdated: "3 days ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Your Music Portal</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
          Crowd Member
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Headphones className="h-4 w-4 text-primary" />
              Listened
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-muted-foreground">Songs this month</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-primary" />
              Liked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">43</div>
            <p className="text-xs text-muted-foreground">Songs you've liked</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-primary" />
              Playlists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlists.length}</div>
            <p className="text-xs text-muted-foreground">Custom playlists</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5</div>
            <p className="text-xs text-muted-foreground">Hours of listening</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Played */}
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-primary" />
              Recently Played
            </CardTitle>
            <CardDescription>Your recent listening history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentlyPlayed.map((song) => (
                <div key={song.id} className="flex items-center gap-4 p-3 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors group cursor-pointer">
                  <div className="relative h-12 w-12 rounded-md overflow-hidden">
                    <img src={song.coverUrl} alt={song.title} className="object-cover h-full w-full" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <PlayCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{song.title}</h3>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{song.duration}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-4">
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  View full history
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Your Playlists */}
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Your Playlists
            </CardTitle>
            <CardDescription>Custom collections you've created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="p-3 bg-secondary/40 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer">
                  <h3 className="font-medium">{playlist.name}</h3>
                  <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>{playlist.songCount} songs</span>
                    <span>Updated {playlist.lastUpdated}</span>
                  </div>
                </div>
              ))}

              <button className="w-full mt-4 py-2 border border-dashed border-secondary rounded-lg text-sm text-muted-foreground hover:text-primary hover:border-primary transition-colors">
                + Create New Playlist
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* For You / Recommendations */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Recommended For You
          </CardTitle>
          <CardDescription>Based on your listening habits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.map((song) => (
              <div key={song.id} className="bg-secondary/40 rounded-lg overflow-hidden hover:shadow-md transition-all">
                <div className="h-32 bg-muted flex items-center justify-center">
                  <Music className="h-12 w-12 text-muted-foreground opacity-50" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{song.title}</h3>
                      <p className="text-xs text-muted-foreground">{song.artist}</p>
                    </div>
                    <Badge className="bg-primary/20 text-primary-foreground">{song.match}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">{song.genre}</Badge>
                    <button>
                      <PlayCircle className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Music, Eye, BarChart2, MessagesSquare, ListMusic, Zap, Calendar, ArrowUp, ArrowDown } from "lucide-react";

export default function CreatorDashboard() {
  // Sample data for the dashboard
  const activeSongs = [
    { 
      id: 1, 
      title: "Neon Dreams", 
      streams: 12503, 
      likes: 456, 
      comments: 32, 
      trending: true,
      supporters: 3
    },
    { 
      id: 2, 
      title: "Midnight Horizon", 
      streams: 5280, 
      likes: 187, 
      comments: 14, 
      trending: false,
      supporters: 1
    },
    { 
      id: 3, 
      title: "Electric Pulse", 
      streams: 1845, 
      likes: 76, 
      comments: 8, 
      trending: false,
      supporters: 0
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Creator Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-foreground rounded-full text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse"></span>
          Artist Profile
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Streams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19.6k</div>
            <div className="flex items-center mt-1 text-xs text-green-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Songs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSongs.length}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span>2 pending approval</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7%</div>
            <div className="flex items-center mt-1 text-xs text-red-400">
              <ArrowDown className="h-3 w-3 mr-1" />
              <span>-2.1% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supporters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <div className="flex items-center mt-1 text-xs text-green-400">
              <ArrowUp className="h-3 w-3 mr-1" />
              <span>+1 new this week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Song Performance */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Your Songs
          </CardTitle>
          <CardDescription>Performance metrics for your active songs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSongs.map((song) => (
              <div key={song.id} className="p-4 bg-secondary/40 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{song.title}</h3>
                    {song.trending && (
                      <Badge className="bg-primary/20 hover:bg-primary/30 text-primary-foreground text-xs">
                        <Zap className="h-3 w-3 mr-1" /> Trending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary rounded-full px-2 py-0.5">
                      {song.supporters} {song.supporters === 1 ? 'supporter' : 'supporters'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatNumber(song.streams)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatNumber(song.likes)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessagesSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{song.comments}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Audience Retention</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-1" />
                  
                  <div className="flex justify-between text-xs mb-1">
                    <span>Engagement Rate</span>
                    <span>{(song.likes / song.streams * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={Math.round(song.likes / song.streams * 100)} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Activities & Playlist Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Activities
            </CardTitle>
            <CardDescription>Your scheduled events and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3 p-3 bg-secondary/40 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">APR</span>
                  <span className="text-lg font-bold">15</span>
                </div>
                <div>
                  <h4 className="font-medium">Feedback Session</h4>
                  <p className="text-sm text-muted-foreground">Call with Music Pro Jason B.</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-secondary/40 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">APR</span>
                  <span className="text-lg font-bold">22</span>
                </div>
                <div>
                  <h4 className="font-medium">New Song Release</h4>
                  <p className="text-sm text-muted-foreground">"Cosmic Journey" goes live</p>
                </div>
              </div>
              
              <div className="flex gap-3 p-3 bg-secondary/40 rounded-lg">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium bg-primary/20 text-primary-foreground px-2 py-0.5 rounded">MAY</span>
                  <span className="text-lg font-bold">05</span>
                </div>
                <div>
                  <h4 className="font-medium">Promotional Campaign</h4>
                  <p className="text-sm text-muted-foreground">Launch Instagram campaign</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListMusic className="h-5 w-5 text-primary" />
              Playlist Placements
            </CardTitle>
            <CardDescription>Where your music is being featured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/40 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Indie Discoveries</h4>
                  <Badge>5.2k followers</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Neon Dreams" added 3 days ago</p>
                <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '42%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>42% listener retention</span>
                  <span>821 plays</span>
                </div>
              </div>
              
              <div className="p-3 bg-secondary/40 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Late Night Vibes</h4>
                  <Badge>12.8k followers</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Midnight Horizon" added 1 week ago</p>
                <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>67% listener retention</span>
                  <span>2.4k plays</span>
                </div>
              </div>
              
              <div className="p-3 bg-secondary/40 rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Electronic Essentials</h4>
                  <Badge>28.5k followers</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Electric Pulse" added 2 weeks ago</p>
                <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '31%' }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>31% listener retention</span>
                  <span>945 plays</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

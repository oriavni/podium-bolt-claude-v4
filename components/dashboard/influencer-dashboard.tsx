import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Users, BarChart2, TrendingUp, Search, Share2, Trophy, Flag } from "lucide-react";

export default function InfluencerDashboard() {
  // Sample data
  const trendingArtists = [
    { id: 1, name: "SkyWalker", genre: "Hip-Hop", image: "https://i.pravatar.cc/150?img=32", change: "+12%" },
    { id: 2, name: "Electronic Dreams", genre: "EDM", image: "https://i.pravatar.cc/150?img=33", change: "+8%" },
    { id: 3, name: "Midnight Echo", genre: "Indie Rock", image: "https://i.pravatar.cc/150?img=34", change: "+5%" },
  ];

  const discoveries = [
    { id: 1, title: "Cosmic Wave", artist: "Astral Project", genre: "Synth Pop", plays: 1240, supported: true },
    { id: 2, title: "Silent Echo", artist: "Whisper Moon", genre: "Ambient", plays: 860, supported: true },
    { id: 3, title: "Urban Flow", artist: "City Beats", genre: "Hip-Hop", plays: 520, supported: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Influencer Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Trendsetter
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              Your Influence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4k</div>
            <p className="text-xs text-muted-foreground">People reached this month</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Discoveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Artists you've highlighted</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">76%</div>
            <p className="text-xs text-muted-foreground">Of supported artists gained traction</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              Reputation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Elite</div>
            <p className="text-xs text-muted-foreground">Top 5% of platform influencers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Artists */}
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Artists
            </CardTitle>
            <CardDescription>Artists gaining momentum this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trendingArtists.map((artist) => (
                <div key={artist.id} className="flex items-center justify-between p-4 bg-secondary/40 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={artist.image} alt={artist.name} />
                      <AvatarFallback>{artist.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{artist.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{artist.genre}</Badge>
                        <span className="text-xs text-green-400">{artist.change} this week</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 bg-muted rounded-full hover:bg-primary/20 transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors">
                      <Flag className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-4">
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  View all trending artists
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Discover New Talent */}
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Discover
            </CardTitle>
            <CardDescription>Find emerging talent to support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  className="w-full bg-muted/50 border-none rounded-full pl-9 py-1.5 text-sm" 
                  placeholder="Search by genre or mood..."
                />
              </div>
            </div>
            
            <div className="space-y-3 mt-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Genres to Explore</div>
              <div className="flex flex-wrap gap-2">
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Indie Rock</Badge>
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Lo-Fi</Badge>
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Jazz Fusion</Badge>
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Alt Folk</Badge>
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Electro Swing</Badge>
                <Badge className="cursor-pointer bg-muted/50 hover:bg-primary/20 text-xs">Neo Soul</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Discoveries */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Your Discoveries
          </CardTitle>
          <CardDescription>Artists you've discovered and supported</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoveries.map((discovery) => (
              <div key={discovery.id} className="p-4 bg-secondary/40 rounded-lg border border-secondary/60 hover:border-primary/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{discovery.title}</h3>
                    <p className="text-sm text-muted-foreground">{discovery.artist}</p>
                  </div>
                  {discovery.supported ? (
                    <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                      <Flag className="h-3 w-3 mr-1" />
                      Supported
                    </Badge>
                  ) : (
                    <Badge className="bg-muted/50 text-muted-foreground hover:bg-primary/20 cursor-pointer">
                      Support
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">{discovery.genre}</Badge>
                  <div className="flex items-center gap-1 text-xs">
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span>{discovery.plays} plays</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-between">
                  <button className="text-xs text-primary hover:text-primary/80">View Analytics</button>
                  <button className="text-xs text-primary hover:text-primary/80">Share</button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

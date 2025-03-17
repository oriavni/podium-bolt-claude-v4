import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Music, Zap, MessageSquare, Award, TrendingUp } from "lucide-react";

export default function MusicProDashboard() {
  // Sample data for demo
  const pendingSongs = [
    { id: 1, title: "Ocean Dreams", artist: "Wave Collective", genre: "Lo-fi", rating: null },
    { id: 2, title: "Midnight Hour", artist: "Luna Ray", genre: "R&B", rating: null },
    { id: 3, title: "Electric Soul", artist: "Neon Pulse", genre: "Electronic", rating: null },
  ];

  const ratedSongs = [
    { id: 4, title: "Mountain High", artist: "Echo Chamber", genre: "Indie Rock", rating: 4.5 },
    { id: 5, title: "Desert Wind", artist: "Mirage", genre: "World", rating: 3.8 },
    { id: 6, title: "City Lights", artist: "Urban Echoes", genre: "Hip Hop", rating: 4.2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Music Pro Dashboard</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary-foreground rounded-full text-sm font-medium">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
          Industry Professional
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-primary" />
              Songs to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingSongs.length}</div>
            <p className="text-sm text-muted-foreground">Pending submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Ratings Given
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ratedSongs.length}</div>
            <p className="text-sm text-muted-foreground">Songs rated this week</p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Impact Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87</div>
            <p className="text-sm text-muted-foreground">Based on artist success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Songs to Review */}
      <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            Songs Awaiting Review
          </CardTitle>
          <CardDescription>Rate and provide feedback on new submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingSongs.map((song) => (
              <div key={song.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                <div>
                  <h3 className="font-medium">{song.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                    <Badge variant="secondary" className="text-xs">{song.genre}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="text-muted-foreground hover:text-yellow-400 transition-colors">
                      <Star className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recently Rated */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Recently Rated
            </CardTitle>
            <CardDescription>Songs you've recently evaluated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ratedSongs.map((song) => (
                <div key={song.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <h3 className="font-medium">{song.title}</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{song.artist}</p>
                      <Badge variant="secondary" className="text-xs">{song.genre}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-medium">{song.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Success Stories
            </CardTitle>
            <CardDescription>Artists who succeeded with your feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-medium">Echo Chamber</h3>
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">+250% Streams</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Your feedback on our mix was game-changing"</p>
              </div>
              
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-medium">Luna Ray</h3>
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Label Signed</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Got signed after implementing your suggestions!"</p>
              </div>
              
              <div className="p-3 bg-secondary/50 rounded-lg">
                <div className="flex justify-between">
                  <h3 className="font-medium">Mirage</h3>
                  <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">Festival Booking</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">"Your endorsement helped us land our first festival"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

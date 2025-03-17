export interface Supporter {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  comment: string;
  date: string;
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
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    soundcloud?: string;
    twitter?: string;
  };
  stats?: {
    uniqueListeners?: number;
    downloads?: number;
    playlistAdds?: number;
    completionRate?: number;
    averageListenTime?: string;
    skipRate?: number;
    fanListeners?: number;
    musicianListeners?: number;
    proListeners?: number;
    peakDay?: string;
    shareCount?: number;
  };
}

export const sampleSongs: Song[] = [
  {
    id: "1",
    title: "Midnight Dreams",
    artist: "Luna Eclipse",
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=7CxcxhHN5Is&ab_channel=%D7%9B%D7%90%D7%9F%7C%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%AA%D7%90%D7%92%D7%99%D7%93%D7%94%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99",
    genre: ["Electronic", "Ambient"],
    socialLinks: {
      instagram: "instagram.com/oa_roya",
      facebook: "facebook.com/oa.roya",
      youtube: "@roya15",
      spotify: "spotify.com/artist/5aDlxoxZYM0JnlFuFzf9VV",
      soundcloud: "soundcloud.com/oaroya"
    },
    supporters: [
      { 
        id: "1", 
        name: "John Doe", 
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=32&h=32&q=80", 
        role: "A&R Director", 
        comment: "Great potential!", 
        date: "2 days ago" 
      }
    ],
    likes: 1234,
    plays: 5678,
    uploadDate: "2024-03-20",
    stats: {
      uniqueListeners: 3975,
      downloads: 852,
      playlistAdds: 987,
      completionRate: 82,
      averageListenTime: "2:58",
      skipRate: 18,
      fanListeners: 3407,
      musicianListeners: 1703,
      proListeners: 568,
      peakDay: "2024-03-25",
      shareCount: 284
    }
  },
  {
    id: "2",
    title: "Urban Beats",
    artist: "Metro Pulse",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=7CxcxhHN5Is&ab_channel=%D7%9B%D7%90%D7%9F%7C%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%AA%D7%90%D7%92%D7%99%D7%93%D7%94%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99",
    genre: ["Hip Hop", "Urban"],
    socialLinks: {
      instagram: "instagram.com/metropulse",
      twitter: "twitter.com/metropulse"
    },
    supporters: [],
    likes: 456,
    plays: 789,
    uploadDate: "2024-03-19",
    stats: {
      uniqueListeners: 552,
      downloads: 118,
      playlistAdds: 365,
      completionRate: 75,
      averageListenTime: "2:15",
      skipRate: 25,
      fanListeners: 473,
      musicianListeners: 237,
      proListeners: 79,
      peakDay: "2024-03-22",
      shareCount: 39
    }
  },
  {
    id: "3",
    title: "Ocean Waves",
    artist: "Coastal Harmony",
    coverUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=7CxcxhHN5Is&ab_channel=%D7%9B%D7%90%D7%9F%7C%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%AA%D7%90%D7%92%D7%99%D7%93%D7%94%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99",
    genre: ["Ambient", "Nature"],
    socialLinks: {
      soundcloud: "soundcloud.com/coastalharmony",
      spotify: "spotify.com/artist/coastalharmony"
    },
    supporters: [
      {
        id: "2",
        name: "Emma Davis",
        avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=32&h=32&q=80",
        role: "Music Producer",
        comment: "Beautiful composition!",
        date: "1 week ago"
      }
    ],
    likes: 789,
    plays: 1234,
    uploadDate: "2024-03-18",
    stats: {
      uniqueListeners: 864,
      downloads: 185,
      playlistAdds: 631,
      completionRate: 91,
      averageListenTime: "3:42",
      skipRate: 9,
      fanListeners: 740,
      musicianListeners: 370,
      proListeners: 124,
      peakDay: "2024-03-24",
      shareCount: 62
    }
  },
  {
    id: "4",
    title: "Electric Soul",
    artist: "Voltage Dreams",
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
    youtubeUrl: "https://www.youtube.com/watch?v=7CxcxhHN5Is&ab_channel=%D7%9B%D7%90%D7%9F%7C%D7%97%D7%93%D7%A9%D7%95%D7%AA-%D7%AA%D7%90%D7%92%D7%99%D7%93%D7%94%D7%A9%D7%99%D7%93%D7%95%D7%A8%D7%94%D7%99%D7%A9%D7%A8%D7%90%D7%9C%D7%99",
    genre: ["Electronic", "Soul"],
    socialLinks: {
      facebook: "facebook.com/voltagedreams",
      youtube: "@voltagedreams"
    },
    supporters: [],
    likes: 123,
    plays: 456,
    uploadDate: "2024-03-17",
    stats: {
      uniqueListeners: 319,
      downloads: 68,
      playlistAdds: 98,
      completionRate: 72,
      averageListenTime: "2:05",
      skipRate: 28,
      fanListeners: 274,
      musicianListeners: 137,
      proListeners: 45,
      peakDay: "2024-03-21",
      shareCount: 23
    }
  }
];
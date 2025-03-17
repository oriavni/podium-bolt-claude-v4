"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, MessageSquare, Calendar, Verified, Filter, ChevronDown, Award, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackRequestDialog } from "@/components/feedback-request-dialog";
import Link from "next/link";

interface Review {
  id: string;
  songTitle: string;
  comment: string;
  rating: number;
  date: string;
}

interface Professional {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  rating: number;
  feedbackCount: number;
  verified: boolean;
  featured: boolean;
  pricePerFeedback: number;
  responseTime: string;
  credentials: string[];
  description: string;
  recentFeedback: Review[];
}

const professionals: Professional[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "A&R Director",
    company: "Universal Music Group",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&q=80",
    rating: 4.9,
    feedbackCount: 284,
    verified: true,
    featured: true,
    pricePerFeedback: 150,
    responseTime: "< 2 hours",
    credentials: ["15+ Years Experience", "Multi-Platinum Artists", "Grammy Committee Member"],
    description: "A&R Director at Universal Music Group with a track record of discovering and developing platinum-selling artists. Specialized in pop and R&B genres.",
    recentFeedback: [
      {
        id: "r1",
        songTitle: "Midnight Dreams",
        rating: 5,
        comment: "Strong commercial potential. The hook is incredibly catchy and production is radio-ready.",
        date: "2 days ago"
      }
    ]
  },
  {
    id: "2",
    name: "David Chen",
    role: "Music PR Manager",
    company: "Spotlight PR",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&q=80",
    rating: 4.8,
    feedbackCount: 156,
    verified: true,
    featured: false,
    pricePerFeedback: 100,
    responseTime: "< 1 day",
    credentials: ["PR Strategy Expert", "Billboard Press Features", "Crisis Management"],
    description: "Senior PR Manager specializing in artist branding and media strategy. Placed artists in major publications and TV shows.",
    recentFeedback: [
      {
        id: "r2",
        songTitle: "Urban Beats",
        rating: 5,
        comment: "Great crossover potential. Perfect for sync licensing and brand partnerships.",
        date: "1 week ago"
      }
    ]
  },
  {
    id: "3",
    name: "Maria Garcia",
    role: "Label Manager",
    company: "Sony Music",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&q=80",
    rating: 4.7,
    feedbackCount: 92,
    verified: true,
    featured: false,
    pricePerFeedback: 200,
    responseTime: "< 3 hours",
    credentials: ["Artist Development", "Marketing Strategy", "Digital Distribution"],
    description: "Label Manager at Sony Music, focusing on artist development and market positioning. Expert in digital strategy and streaming promotion.",
    recentFeedback: [
      {
        id: "r3",
        songTitle: "Electric Soul",
        rating: 4,
        comment: "Strong potential for playlist placement. Production quality meets industry standards.",
        date: "3 days ago"
      }
    ]
  }
];

const categories = [
  "All",
  "A&R",
  "PR Managers",
  "Record Labels",
  "Music Managers",
  "Producers",
  "Radio Programmers",
  "Playlist Curators"
] as const;

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedPro, setSelectedPro] = useState<Professional | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredPros = professionals
    .filter(pro => {
      if (selectedCategory === "All") return true;
      return pro.role.includes(selectedCategory);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "featured":
          return Number(b.featured) - Number(a.featured);
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.pricePerFeedback - b.pricePerFeedback;
        case "price-high":
          return b.pricePerFeedback - a.pricePerFeedback;
        default:
          return 0;
      }
    });

  const handleRequestFeedback = (pro: Professional) => {
    setSelectedPro(pro);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Music Industry Professionals</h1>
        <p className="text-muted-foreground">
          Get expert feedback on your music from industry professionals
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              className={cn(
                "cursor-pointer px-3 py-1",
                selectedCategory === category ? "hover:bg-primary/90" : "hover:bg-secondary/80"
              )}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="flex gap-4">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-4 h-4" />
          </Button>
          <select
            className="bg-background border rounded-md px-3 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Professionals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPros.map((pro) => (
          <div
            key={pro.id}
            className={cn(
              "rounded-lg border bg-card p-6 transition-all hover:shadow-lg",
              pro.featured && "border-primary/50 bg-primary/5"
            )}
          >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
              <Link href={`/profile/professional-1`}>
                <Avatar className="w-16 h-16">
                  <AvatarImage src={pro.avatarUrl} alt={pro.name} />
                  <AvatarFallback>{pro.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/profile/professional-1`}
                    className="font-semibold hover:text-primary transition-colors"
                  >
                    {pro.name}
                  </Link>
                  {pro.verified && (
                    <Verified className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-sm font-medium">{pro.role}</p>
                <p className="text-sm text-muted-foreground">{pro.company}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="ml-1 text-sm font-medium">{pro.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({pro.feedbackCount} reviews)
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap gap-1 mb-4">
              {pro.credentials.map((credential) => (
                <Badge
                  key={credential}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {credential}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4">
              {pro.description}
            </p>

            {/* Recent Feedback Example */}
            {pro.recentFeedback.length > 0 && (
              <div className="mb-4 p-3 bg-secondary/30 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recent Feedback</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  "{pro.recentFeedback[0].comment}"
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Response: {pro.responseTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Top Rated Pro
                </span>
              </div>
            </div>

            {/* Price and Action */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <span className="text-sm text-muted-foreground">Feedback Price</span>
                <p className="font-semibold">${pro.pricePerFeedback}</p>
              </div>
              <Button onClick={() => handleRequestFeedback(pro)}>
                Request Feedback
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Request Dialog */}
      {selectedPro && (
        <FeedbackRequestDialog
          professional={selectedPro}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
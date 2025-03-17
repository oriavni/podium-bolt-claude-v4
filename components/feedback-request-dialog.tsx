"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Music, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeedbackRequestDialogProps {
  professional: {
    name: string;
    role: string;
    pricePerFeedback: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackRequestDialog({
  professional,
  open,
  onOpenChange,
}: FeedbackRequestDialogProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get songs from localStorage
  const uploadedSongs = typeof window !== 'undefined' 
    ? JSON.parse(localStorage.getItem('uploadedSongs') || '[]')
    : [];

  const handleSubmit = async () => {
    if (!selectedSong) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Here you would typically:
    // 1. Create a feedback request in the database
    // 2. Process the payment
    // 3. Notify the professional
    // 4. Update the UI
    
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Feedback</DialogTitle>
          <DialogDescription>
            Get professional feedback from {professional.name} ({professional.role})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Song Selection */}
          <div className="space-y-4">
            <Label>Select a song</Label>
            
            {uploadedSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/50">
                <Music className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  No songs available. Upload a song first to request feedback.
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    onOpenChange(false);
                    window.location.href = '/upload';
                  }}
                >
                  Upload a Song
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {uploadedSongs.map((song: any) => (
                  <div
                    key={song.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedSong === song.id
                        ? "bg-primary/10 border-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    } border`}
                    onClick={() => setSelectedSong(song.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded on {song.uploadDate}
                        </p>
                      </div>
                      {selectedSong === song.id && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Note to Professional */}
          <div className="space-y-2">
            <Label>Note to professional (optional)</Label>
            <Textarea
              placeholder="Any specific aspects you'd like feedback on?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Price Summary */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex justify-between items-center">
              <span>Feedback Price</span>
              <span className="font-semibold">${professional.pricePerFeedback}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <p>
                By proceeding, you agree to pay ${professional.pricePerFeedback} for 
                professional feedback. The professional will review your song and 
                provide detailed feedback within their stated response time.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedSong || isSubmitting || uploadedSongs.length === 0}
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
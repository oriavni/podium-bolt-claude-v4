"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AudioWaveformTrimmer } from "@/components/audio-waveform-trimmer";
import { 
  Music, 
  Upload, 
  Image as ImageIcon, 
  Youtube, 
  X, 
  Check,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

export function UploadSongForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewTrim, setPreviewTrim] = useState({ start: 0, end: 20 });
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [copied, copy] = useCopyToClipboard();
  
  const handleAddGenre = () => {
    if (genreInput.trim() && !genres.includes(genreInput.trim())) {
      setGenres([...genres, genreInput.trim()]);
      setGenreInput("");
    }
  };
  
  const handleRemoveGenre = (genre: string) => {
    setGenres(genres.filter(g => g !== genre));
  };
  
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };
  
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handlePreviewGenerated = (start: number, end: number) => {
    setPreviewTrim({ start, end });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !audioFile) {
      alert("Please provide a title and audio file");
      return;
    }
    
    setIsUploading(true);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 500);
    
    try {
      // In a real app, you would upload the files to a server here
      // This is just a simulation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Complete the upload
      setUploadProgress(100);
      setTimeout(() => {
        alert("Song uploaded successfully!");
        
        // Reset form
        setTitle("");
        setDescription("");
        setGenres([]);
        setGenreInput("");
        setYoutubeUrl("");
        setAudioFile(null);
        setCoverImage(null);
        setCoverImagePreview(null);
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
      
    } catch (error) {
      console.error("Error uploading song:", error);
      alert("Failed to upload song. Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4 bg-card rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Music className="w-6 h-6 text-primary" />
        Upload New Song
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Song Title</Label>
          <Input
            id="title"
            placeholder="Enter song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Tell us about your song..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        {/* Genres */}
        <div className="space-y-2">
          <Label htmlFor="genres">Genres</Label>
          <div className="flex gap-2">
            <Input
              id="genres"
              placeholder="Add a genre (e.g., Rock, Pop, Hip Hop)"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddGenre();
                }
              }}
            />
            <Button 
              type="button" 
              onClick={handleAddGenre}
              variant="secondary"
              className="shrink-0"
            >
              Add
            </Button>
          </div>
          
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {genres.map((genre) => (
                <Badge key={genre} className="flex items-center gap-1 py-1">
                  {genre}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveGenre(genre)}
                    className="ml-1 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {/* YouTube URL */}
        <div className="space-y-2">
          <Label htmlFor="youtube">YouTube URL (optional)</Label>
          <div className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-muted-foreground" />
            <Input
              id="youtube"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>
        </div>
        
        {/* Audio File Upload */}
        <div className="space-y-2">
          <Label>Audio File</Label>
          <div className="border rounded-lg p-6 bg-secondary/20">
            {audioFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{audioFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAudioFile(null)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Audio Preview Trimmer */}
                <AudioWaveformTrimmer 
                  audioFile={audioFile} 
                  onPreviewGenerated={handlePreviewGenerated}
                />
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                onClick={() => audioInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select or drag audio file</p>
                <p className="text-xs text-muted-foreground mt-1">MP3, WAV, FLAC supported</p>
              </div>
            )}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Cover Image Upload */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div className="border rounded-lg p-6 bg-secondary/20">
            {coverImage ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{coverImage.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(coverImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCoverImage(null);
                      setCoverImagePreview(null);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {coverImagePreview && (
                  <div className="relative aspect-square w-40 rounded-md overflow-hidden mx-auto">
                    <img 
                      src={coverImagePreview} 
                      alt="Cover preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center h-48 cursor-pointer rounded-md border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select or drag image file</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF supported (1:1 ratio recommended)</p>
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uploading...</span>
              <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title || !audioFile || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload Song
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
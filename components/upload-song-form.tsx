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
import { useFileUpload } from "@/lib/hooks/use-file-upload";

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
    console.log("🎵 Audio file input change detected");
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      console.log("❌ No files selected");
      return;
    }
    
    const file = files[0];
    // Create detailed debug info
    console.log("🎵 Selected file:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    if (file && file.type.startsWith('audio/')) {
      console.log("✅ Setting audio file in state:", file.name);
      setAudioFile(file);
      
      // Log file object details to debug
      console.log("🔍 File object details:", {
        constructor: file.constructor.name,
        isFile: file instanceof File,
        hasArrayBuffer: typeof file.arrayBuffer === 'function',
        prototype: Object.getPrototypeOf(file)
      });
    } else {
      console.log("❌ File type not accepted:", file.type);
      alert("Please select a valid audio file (MP3, WAV, etc.)");
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
  
  // Import the file upload hook
  const { uploadFile, isUploading: isFileUploading, progress: fileUploadProgress, error: fileUploadError } = useFileUpload();
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    
    console.log("📝 Form submission started");
    
    if (!title) {
      console.log("❌ Missing title");
      alert("Please provide a title for your song");
      return;
    }
    
    if (!audioFile) {
      console.log("❌ Missing audio file");
      alert("Please select an audio file to upload");
      return;
    }
    
    // Verify the audio file is still valid
    console.log("🔍 Checking audio file before upload:", {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size,
      sizeInMB: (audioFile.size / (1024 * 1024)).toFixed(2) + " MB",
      isFile: audioFile instanceof File,
      hasArrayBuffer: typeof audioFile.arrayBuffer === 'function'
    });
    
    setIsUploading(true);
    console.log("🚀 Starting song upload with audio file:", audioFile.name);
    
    try {
      // First upload the audio file
      console.log("Uploading audio file:", audioFile.name);
      const uploadedAudio = audioFile ? await uploadFile(audioFile, {
        fileType: 'audio',
        songId: Date.now().toString(), // Generate a temporary ID for storage path
        onProgress: (progress) => {
          setUploadProgress(progress * 0.6); // Audio upload is 60% of total progress
        }
      }) : null;
      
      if (!uploadedAudio) {
        throw new Error("Failed to upload audio file");
      }
      
      console.log("Audio file uploaded successfully:", uploadedAudio);
      
      // Then upload the cover image if provided
      const uploadedImage = coverImage ? await uploadFile(coverImage, {
        fileType: 'image',
        onProgress: (progress) => {
          setUploadProgress(60 + progress * 0.3); // Image upload is 30% of total progress
        }
      }) : null;
      
      // Prepare song data with the uploaded files
      const songData = {
        id: Date.now().toString(), // Simple ID generation for demo purposes
        title,
        description,
        genres,
        youtubeUrl,
        audioUrl: uploadedAudio.url,
        coverUrl: uploadedImage ? uploadedImage.url : undefined,
        previewTrim,
        // Add additional song metadata
        artist: "Your Artist Name", // In a real app, this would come from the user profile
        supporters: [],
        likes: 0,
        plays: 0,
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save song data to Firestore
      console.log("Saving song data to Firestore:", songData);
      
      try {
        // Import needed Firebase modules
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        // Use the song ID for the document ID
        const songDocRef = doc(db, 'songs', songData.id);
        await setDoc(songDocRef, songData);
        
        console.log("Song data saved to Firestore successfully");
        setUploadProgress(95);
      } catch (dbError) {
        console.error("Error saving song to Firestore:", dbError);
        
        // Save to localStorage as fallback
        const existingSongs = JSON.parse(localStorage.getItem('uploadedSongs') || '[]');
        existingSongs.push(songData);
        localStorage.setItem('uploadedSongs', JSON.stringify(existingSongs));
        console.log("Song saved to localStorage as fallback");
        
        setUploadProgress(95);
      }
      
      // Complete the upload
      setUploadProgress(100);
      
      // Show success and reset form
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
      console.error("File upload error:", fileUploadError);
      const errorMsg = (error as Error).message || "Unknown error";
      setUploadError(errorMsg);
      alert(`Failed to upload song: ${errorMsg}`);
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
        
        {/* Upload Progress and Error */}
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
        
        {/* Upload Error */}
        {uploadError && (
          <div className="p-3 bg-destructive/20 rounded-md border border-destructive text-destructive text-sm">
            <p className="font-semibold">Upload Error:</p>
            <p>{uploadError}</p>
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
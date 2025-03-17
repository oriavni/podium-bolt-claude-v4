"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Music, X, AlertCircle, CheckCircle2, Plus, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AUDIO_FILE_TYPES, MAX_AUDIO_FILE_SIZE } from "@/lib/constants";
import { AudioWaveformTrimmer } from "@/components/audio-waveform-trimmer";

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'waiting' | 'uploading' | 'error' | 'success';
  errorMessage?: string;
}

interface SongMetadata {
  title: string;
  mainArtist: string;
  collaborators: string[];
  isRemix: boolean;
  originalArtists?: string[];
  releaseDate: string;
  isReleased: boolean;
  lyrics?: string;
  pressPhotos: File[];
  hasChorus: boolean;
  isRadioFriendly: boolean;
  isAIGenerated: boolean;
  pressRelease?: string;
  similarArtists: string[];
  genres: string[];
  moods: string[];
  copyrightApproval: boolean;
  youtubeUrl?: string;
  socialLinks: {
    instagram?: string;
    facebook?: string;
    spotify?: string;
    soundcloud?: string;
    twitter?: string;
  };
  previewTrim: {
    start: number;
    end: number;
  };
}

const GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical", "Country",
  "Folk", "Latin", "Metal", "Blues", "Reggae", "World", "Alternative", "Indie"
];

const MOODS = [
  "Happy", "Sad", "Energetic", "Calm", "Romantic", "Angry", "Nostalgic",
  "Dark", "Uplifting", "Melancholic", "Dreamy", "Intense"
];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

export default function UploadPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [metadata, setMetadata] = useState<SongMetadata>({
    title: "",
    mainArtist: "",
    collaborators: [],
    isRemix: false,
    originalArtists: [],
    releaseDate: new Date().toISOString().split('T')[0],
    isReleased: false,
    lyrics: "",
    pressPhotos: [],
    hasChorus: false,
    isRadioFriendly: true,
    isAIGenerated: false,
    pressRelease: "",
    similarArtists: [],
    genres: [],
    moods: [],
    copyrightApproval: false,
    youtubeUrl: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      spotify: "",
      soundcloud: "",
      twitter: ""
    },
    previewTrim: {
      start: 0,
      end: 20
    }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (uploadedFiles: File[]) => {
    const validFiles = uploadedFiles.filter(file => {
      if (!AUDIO_FILE_TYPES.includes(file.type)) {
        alert(`Invalid file type: ${file.name}. Please upload audio files only.`);
        return false;
      }
      if (file.size > MAX_AUDIO_FILE_SIZE) {
        alert(`File too large: ${file.name}. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      ...file,
      id: Math.random().toString(),
      progress: 0,
      status: 'waiting' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      simulateFileUpload(file.id);
    });
  };

  const handleCoverImageChange = (file: File | null) => {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      alert("Image file is too large. Maximum size is 2MB");
      return;
    }

    setCoverImage(file);
  };

  const simulateFileUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { ...f, progress, status: progress === 100 ? 'success' : 'uploading' }
          : f
      ));

      if (progress === 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handlePreviewTrimChange = (start: number, end: number) => {
    setMetadata(prev => ({
      ...prev,
      previewTrim: { start, end }
    }));
  };

  const handleSubmit = async () => {
    if (!metadata.copyrightApproval) {
      alert("Please confirm you have the necessary rights to this song.");
      return;
    }

    if (!metadata.isReleased && !metadata.releaseDate) {
      alert("Please set a release date for your song.");
      return;
    }

    const releaseDate = new Date(metadata.releaseDate);
    const now = new Date();
    
    if (!metadata.isReleased && releaseDate <= now) {
      alert("For unreleased songs, the release date must be in the future.");
      return;
    }

    setIsUploading(true);
    try {
      // Create a data URL from the cover image
      let coverUrl = "";
      if (coverImage) {
        const reader = new FileReader();
        coverUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(coverImage);
        });
      }

      const songData = {
        id: Math.random().toString(),
        title: metadata.title,
        artist: metadata.mainArtist,
        coverUrl,
        youtubeUrl: metadata.youtubeUrl,
        genre: metadata.genres,
        duration: "3:30",
        uploadDate: now.toISOString(),
        releaseDate: metadata.releaseDate,
        isReleased: metadata.isReleased,
        status: metadata.isReleased ? 'published' : 'scheduled',
        supporters: [],
        likes: 0,
        plays: 0,
        socialLinks: metadata.socialLinks,
        previewTrim: metadata.previewTrim
      };

      const savedSongs = JSON.parse(localStorage.getItem('uploadedSongs') || '[]');
      savedSongs.push(songData);
      localStorage.setItem('uploadedSongs', JSON.stringify(savedSongs));
      
      setUploadComplete(true);
      setTimeout(() => {
        router.push('/library');
      }, 1500);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload song. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border -z-10" />
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === step
                    ? "bg-primary text-primary-foreground"
                    : currentStep > step
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Upload</span>
            <span>Details</span>
            <span>Metadata</span>
            <span>Review</span>
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-border",
                files.length > 0 && "border-none p-0"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {files.length === 0 ? (
                <>
                  <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept={AUDIO_FILE_TYPES.join(",")}
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFiles(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Drop your audio files here
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse (MP3, WAV, AAC up to 50MB)
                    </p>
                    <Button onClick={() => inputRef.current?.click()}>
                      Choose Files
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg"
                    >
                      <Music className="h-8 w-8 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={file.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">
                            {file.progress}%
                          </span>
                        </div>
                        {file.errorMessage && (
                          <p className="text-sm text-destructive mt-1">
                            {file.errorMessage}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFiles(prev => prev.filter(f => f.id !== file.id))}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Cover Artwork</h3>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  "hover:bg-secondary/50 cursor-pointer"
                )}
                onClick={() => coverInputRef.current?.click()}
              >
                {coverImage ? (
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Cover"
                    className="w-48 h-48 object-cover mx-auto rounded-lg"
                  />
                ) : (
                  <>
                    <Music className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload cover artwork (JPG, PNG, WebP up to 2MB)
                    </p>
                  </>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleCoverImageChange(e.target.files[0]);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleNext}
                disabled={files.length === 0 || !coverImage}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Song Title</Label>
                <Input
                  id="title"
                  value={metadata.title}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="Enter song title"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="mainArtist">Main Artist</Label>
                <Input
                  id="mainArtist"
                  value={metadata.mainArtist}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    mainArtist: e.target.value
                  }))}
                  placeholder="Main artist name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="youtubeUrl">YouTube URL (optional)</Label>
                <Input
                  id="youtubeUrl"
                  value={metadata.youtubeUrl}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    youtubeUrl: e.target.value
                  }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Social Media Links */}
              <div className="grid gap-2">
                <Label>Social Media Links (optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram" className="text-xs">Instagram</Label>
                    <Input
                      id="instagram"
                      value={metadata.socialLinks.instagram}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          instagram: e.target.value
                        }
                      }))}
                      placeholder="instagram.com/yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="text-xs">Facebook</Label>
                    <Input
                      id="facebook"
                      value={metadata.socialLinks.facebook}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          facebook: e.target.value
                        }
                      }))}
                      placeholder="facebook.com/yourpage"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spotify" className="text-xs">Spotify</Label>
                    <Input
                      id="spotify"
                      value={metadata.socialLinks.spotify}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          spotify: e.target.value
                        }
                      }))}
                      placeholder="spotify.com/artist/yourid"
                    />
                  </div>
                  <div>
                    <Label htmlFor="soundcloud" className="text-xs">SoundCloud</Label>
                    <Input
                      id="soundcloud"
                      value={metadata.socialLinks.soundcloud}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          soundcloud: e.target.value
                        }
                      }))}
                      placeholder="soundcloud.com/yourusername"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter" className="text-xs">Twitter</Label>
                    <Input
                      id="twitter"
                      value={metadata.socialLinks.twitter}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        socialLinks: {
                          ...prev.socialLinks,
                          twitter: e.target.value
                        }
                      }))}
                      placeholder="twitter.com/yourusername"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={metadata.isRemix}
                      onCheckedChange={(checked) => setMetadata(prev => ({
                        ...prev,
                        isRemix: checked
                      }))}
                    />
                    This is a remix
                  </div>
                </Label>
                {metadata.isRemix && (
                  <Input
                    placeholder="Original artist(s)"
                    value={metadata.originalArtists?.join(", ")}
                    onChange={(e) => setMetadata(prev => ({
                      ...prev,
                      originalArtists: e.target.value.split(",").map(s => s.trim())
                    }))}
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label>Release Information</Label>
                <div className="flex items-center gap-4 mb-4">
                  <Switch
                    checked={metadata.isReleased}
                    onCheckedChange={(checked) => setMetadata(prev => ({
                      ...prev,
                      isReleased: checked,
                      releaseDate: checked ? new Date().toISOString().split('T')[0] : prev.releaseDate
                    }))}
                  />
                  <span>Song is already released</span>
                </div>
                {!metadata.isReleased && (
                  <div className="space-y-2">
                    <Label htmlFor="releaseDate">Release Date</Label>
                    <Input
                      type="date"
                      id="releaseDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={metadata.releaseDate}
                      onChange={(e) => setMetadata(prev => ({
                        ...prev,
                        releaseDate: e.target.value
                      }))}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Your song will automatically appear on the home page on this date
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!metadata.title || !metadata.mainArtist}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lyrics">Lyrics</Label>
                <Textarea
                  id="lyrics"
                  value={metadata.lyrics}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    lyrics: e.target.value
                  }))}
                  placeholder="Enter song lyrics"
                  className="min-h-[200px]"
                />
              </div>

              {/* Preview Trim Section - Waveform */}
              <div className="grid gap-2">
                <Label>20-Second Preview</Label>
                <div className="p-4 bg-secondary/30 rounded-lg">
                  {files.length > 0 && files[0].status === 'success' && (
                    <AudioWaveformTrimmer
                      audioFile={files[0]}
                      onPreviewGenerated={handlePreviewTrimChange}
                      initialStart={metadata.previewTrim.start}
                      initialEnd={metadata.previewTrim.end}
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Song Characteristics</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={metadata.hasChorus}
                      onCheckedChange={(checked) => setMetadata(prev => ({
                        ...prev,
                        hasChorus: checked
                      }))}
                    />
                    <span>Has chorus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={metadata.isRadioFriendly}
                      onCheckedChange={(checked) => setMetadata(prev => ({
                        ...prev,
                        isRadioFriendly: checked
                      }))}
                    />
                    <span>Radio-friendly</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={metadata.isAIGenerated}
                      onCheckedChange={(checked) => setMetadata(prev => ({
                        ...prev,
                        isAIGenerated: checked
                      }))}
                    />
                    <span>AI-generated content</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Genres</Label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <Badge
                      key={genre}
                      variant={metadata.genres.includes(genre) ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => {
                        setMetadata(prev => ({
                          ...prev,
                          genres: prev.genres.includes(genre)
                            ? prev.genres.filter(g => g !== genre)
                            : [...prev.genres, genre]
                        }));
                      }}
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Moods</Label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((mood) => (
                    <Badge
                      key={mood}
                      variant={metadata.moods.includes(mood) ? "default" : "secondary"}
                      className="cursor-pointer"
                      onClick={() => {
                        setMetadata(prev => ({
                          ...prev,
                          moods: prev.moods.includes(mood)
                            ? prev.moods.filter(m => m !== mood)
                            : [...prev.moods, mood]
                        }));
                      }}
                    >
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pressRelease">Press Release</Label>
                <Textarea
                  id="pressRelease"
                  value={metadata.pressRelease}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    pressRelease: e.target.value
                  }))}
                  placeholder="Write a press release for your song"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={metadata.genres.length === 0}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="rounded-lg border p-6 space-y-4">
              <h3 className="text-lg font-semibold">Review Your Submission</h3>
              
              <div className="grid gap-4">
                <div className="flex gap-4">
                  {coverImage && (
                    <img
                      src={URL.createObjectURL(coverImage)}
                      alt="Cover"
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-medium">{metadata.title}</h4>
                    <p className="text-muted-foreground">{metadata.mainArtist}</p>
                    {metadata.isRemix && metadata.originalArtists?.length && (
                      <p className="text-sm text-muted-foreground">
                        Original by: {metadata.originalArtists.join(", ")}
                      </p>
                    )}
                    {metadata.youtubeUrl && (
                      <p className="text-sm text-muted-foreground mt-2">
                        YouTube: {metadata.youtubeUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Preview Trim Information */}
                <div className="grid gap-2 mt-4">
                  <p className="text-sm font-medium">Preview Trim</p>
                  <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-md">
                    <Scissors className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {Math.floor(metadata.previewTrim.start / 60)}:{(metadata.previewTrim.start % 60).toString().padStart(2, '0')} - 
                      {Math.floor(metadata.previewTrim.end / 60)}:{(metadata.previewTrim.end % 60).toString().padStart(2, '0')} 
                      ({Math.round(metadata.previewTrim.end - metadata.previewTrim.start)} seconds)
                    </span>
                  </div>
                </div>

                {/* Social Media Links Review */}
                {Object.values(metadata.socialLinks).some(link => link) && (
                  <div className="grid gap-2">
                    <p className="text-sm font-medium">Social Media</p>
                    <div className="flex flex-wrap gap-2">
                      {metadata.socialLinks.instagram && (
                        <Badge variant="outline">Instagram: {metadata.socialLinks.instagram}</Badge>
                      )}
                      {metadata.socialLinks.facebook && (
                        <Badge variant="outline">Facebook: {metadata.socialLinks.facebook}</Badge>
                      )}
                      {metadata.socialLinks.spotify && (
                        <Badge variant="outline">Spotify: {metadata.socialLinks.spotify}</Badge>
                      )}
                      {metadata.socialLinks.soundcloud && (
                        <Badge variant="outline">SoundCloud: {metadata.socialLinks.soundcloud}</Badge>
                      )}
                      {metadata.socialLinks.twitter && (
                        <Badge variant="outline">Twitter: {metadata.socialLinks.twitter}</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid gap-2">
                  <p className="text-sm font-medium">Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {metadata.genres.map((genre) => (
                      <Badge key={genre} variant="secondary">{genre}</Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2">
                  <p className="text-sm font-medium">Moods</p>
                  <div className="flex flex-wrap gap-1">
                    {metadata.moods.map((mood) => (
                      <Badge key={mood} variant="secondary">{mood}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Switch
                    checked={metadata.copyrightApproval}
                    onCheckedChange={(checked) => setMetadata(prev => ({
                      ...prev,
                      copyrightApproval: checked
                    }))}
                  />
                  <span>
                    I confirm that I own or have the necessary rights to this song
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!metadata.copyrightApproval || isUploading}
              >
                {isUploading ? "Uploading..." : "Submit"}
              </Button>
            </div>
          </div>
        )}

        {uploadComplete && (
          <div className="mt-4 p-4 rounded-lg bg-green-500/10 text-green-500 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <p>Upload complete! Redirecting to your library...</p>
          </div>
        )}
      </div>
    </div>
  );
}
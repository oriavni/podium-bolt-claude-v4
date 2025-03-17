import { sampleSongs } from '@/app/data/sample-songs';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SongModal } from '@/components/song-modal';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const song = sampleSongs.find(s => s.id === params.id);
  
  if (!song) {
    return {
      title: 'Song Not Found',
      description: 'The requested song could not be found.',
    };
  }

  return {
    title: `${song.title} by ${song.artist} - Podium`,
    description: `Listen to "${song.title}" by ${song.artist} on Podium • ${song.likes.toLocaleString()} likes • ${song.plays.toLocaleString()} plays • ${song.genre?.join(', ')}`,
    openGraph: {
      title: `${song.title} by ${song.artist}`,
      description: `Listen to "${song.title}" by ${song.artist} on Podium • ${song.likes.toLocaleString()} likes • ${song.plays.toLocaleString()} plays`,
      type: 'music.song',
      images: [
        {
          url: song.coverUrl,
          width: 800,
          height: 800,
          alt: `${song.title} by ${song.artist}`,
        },
      ],
      siteName: 'Podium',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${song.title} by ${song.artist}`,
      description: `Listen to "${song.title}" by ${song.artist} on Podium`,
      images: [song.coverUrl],
    },
  };
}

export function generateStaticParams() {
  return sampleSongs.map((song) => ({
    id: song.id,
  }));
}

export default function SongPage({ params }: PageProps) {
  // First check sample songs
  const sampleSong = sampleSongs.find(song => song.id === params.id);
  
  // If we can't find the song, return 404
  if (!sampleSong) {
    // Check localStorage would happen client-side
    notFound();
  }

  // For server component, we'll redirect to home with a hash to open the modal
  return (
    <div className="container mx-auto px-4 py-8">
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.location.href = "/#song-${params.id}";
          `
        }}
      />
    </div>
  );
}
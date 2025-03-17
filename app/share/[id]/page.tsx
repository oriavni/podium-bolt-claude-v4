import { Metadata } from 'next';
import { sampleSongs } from '@/app/data/sample-songs';
import { notFound } from 'next/navigation';
import { SharePageClient } from './share-page-client';

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

  const title = `${song.title} by ${song.artist}`;
  const description = `Listen to "${song.title}" by ${song.artist} on Podium • ${song.likes.toLocaleString()} likes • ${song.plays.toLocaleString()} plays • ${song.genre?.join(', ')}`;

  return {
    title,
    description,
    openGraph: {
      type: 'music.song',
      title,
      description,
      images: [{
        url: song.coverUrl,
        width: 800,
        height: 800,
        alt: title,
      }],
      siteName: 'Podium',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [song.coverUrl],
    },
    alternates: {
      canonical: `/share/${params.id}`,
    },
  };
}

export function generateStaticParams() {
  return sampleSongs.map((song) => ({
    id: song.id,
  }));
}

export default function SharePage({ params }: PageProps) {
  const song = sampleSongs.find(s => s.id === params.id);
  
  if (!song) {
    notFound();
  }

  return <SharePageClient song={song} />;
}
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto">
        <Music className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
        <h1 className="text-4xl font-bold mb-4">Song Not Found</h1>
        <p className="text-muted-foreground mb-8">
          The song you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
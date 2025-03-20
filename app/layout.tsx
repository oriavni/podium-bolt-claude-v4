import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AudioProvider } from '@/lib/context/audio-context';
import { AudioPlayer } from '@/components/audio-player';

// Configure Inter font with fallback
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false, // Disable preload to prevent hanging
  fallback: ['system-ui', 'arial'], // Provide fallback fonts
});

export const metadata: Metadata = {
  title: 'Podium - Music Platform',
  description: 'Connect with musicians, influencers, and industry professionals',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthProvider>
            <AudioProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-auto">
                    {children}
                  </main>
                </div>
              </div>
              {/* The AudioPlayer is positioned fixed at the bottom of the screen */}
              <AudioPlayer />
            </AudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
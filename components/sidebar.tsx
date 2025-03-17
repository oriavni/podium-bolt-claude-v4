"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Library, Plus, Radio, Search, Upload, Store, User, BarChart2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreatePlaylistDialog } from "@/components/create-playlist-dialog";
import { playlists } from "@/lib/data";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

  const handleCreatePlaylist = () => {
    setCreatePlaylistOpen(true);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="pb-12 w-64 border-r bg-card">
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-xl font-semibold tracking-tight">
            Podium
          </h2>
          <div className="space-y-1">
            <Button
              variant={pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/")}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
            <Button
              variant={pathname === "/search" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/search")}
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
            <Button
              variant={pathname === "/library" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/library")}
            >
              <Library className="h-4 w-4" />
              Your Library
            </Button>
            <Button
              variant={pathname === "/marketplace" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/marketplace")}
            >
              <Store className="h-4 w-4" />
              Marketplace
            </Button>
            <Button
              variant={pathname === "/profile" || pathname.startsWith("/profile/") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/profile")}
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            <Button
              variant={pathname === "/dashboard" || pathname.startsWith("/dashboard/") ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/dashboard")}
            >
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <h2 className="relative px-2 text-lg font-semibold tracking-tight">
            Create
          </h2>
          <div className="space-y-1 pt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleCreatePlaylist}
            >
              <Plus className="h-4 w-4" />
              Create Playlist
            </Button>
            <Button
              variant={pathname === "/upload" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/upload")}
            >
              <Upload className="h-4 w-4" />
              Upload Song
            </Button>
            <Button
              variant={pathname === "/live" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2"
              onClick={() => handleNavigation("/live")}
            >
              <Radio className="h-4 w-4" />
              Go Live
            </Button>
          </div>
        </div>
        <div className="py-2">
          <h2 className="relative px-6 text-lg font-semibold tracking-tight">
            Playlists
          </h2>
          <ScrollArea className="h-[300px] px-2">
            <div className="space-y-1 p-2">
              {playlists.map((playlist, index) => (
                <Button
                  key={playlist}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => handleNavigation(`/playlist/playlist-${index + 1}`)}
                >
                  {playlist}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <CreatePlaylistDialog
        open={createPlaylistOpen}
        onOpenChange={setCreatePlaylistOpen}
        onPlaylistCreated={(playlist) => {
          setCreatePlaylistOpen(false);
          handleNavigation(`/playlist/custom-${playlist.id}`);
        }}
      />
    </div>
  );
}
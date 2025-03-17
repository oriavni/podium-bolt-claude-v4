"use client";

import { useState } from "react";
import { SongModal } from "@/components/song-modal";
import { type Song } from "@/app/data/sample-songs";
import { SongPreviewPlayer } from "@/components/song-preview-player";

interface SongButtonProps {
  song: Song;
  children: React.ReactNode;
  className?: string;
}

export function SongButton({ song, children, className }: SongButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={className} 
        onClick={handleOpenModal}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Song Preview Player */}
        <SongPreviewPlayer song={song} isHovering={isHovering} />
        
        {children}
      </div>
      
      <SongModal 
        song={song} 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
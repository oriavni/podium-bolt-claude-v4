"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Song } from '@/app/data/sample-songs';

interface BasicModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BasicModal({ song, isOpen, onClose }: BasicModalProps) {
  if (!song) return null;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/80"
            onClick={onClose}
          />
          
          <div className="relative bg-background rounded-lg shadow-xl max-w-4xl w-full">
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-2">{song.title}</h1>
              <p className="text-xl text-muted-foreground mb-4">{song.artist}</p>
              
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
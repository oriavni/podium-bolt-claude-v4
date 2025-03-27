"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserBadge } from "@/components/user-badge";
import { Supporter } from "@/lib/types";

interface SongSupportersDisplayProps {
  supporters: Supporter[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  showAll?: boolean;
  onSupporterClick?: (supporter: Supporter) => void;
  className?: string;
}

export function SongSupportersDisplay({
  supporters,
  maxVisible = 5,
  size = "md",
  showTooltip = true,
  showAll = false,
  onSupporterClick,
  className = "",
}: SongSupportersDisplayProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  
  if (!supporters || supporters.length === 0) {
    return null;
  }

  // Determine avatar size
  const avatarSizeClass = 
    size === "sm" ? "h-8 w-8" : 
    size === "lg" ? "h-12 w-12" : 
    "h-10 w-10";
  
  // Determine font size for fallback
  const fallbackFontSize = 
    size === "sm" ? "text-xs" : 
    size === "lg" ? "text-base" : 
    "text-sm";
  
  // Determine stack amount
  const stackAmount = size === "sm" ? -6 : size === "lg" ? -10 : -8;
  
  // Determine whether to truncate the list
  const visibleSupporters = showAll ? supporters : supporters.slice(0, maxVisible);
  const hiddenCount = showAll ? 0 : Math.max(0, supporters.length - maxVisible);

  return (
    <div className={`flex flex-wrap items-center ${className}`}>
      <div className="flex">
        {visibleSupporters.map((supporter, index) => (
          <TooltipProvider key={supporter.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div 
                  className={`${
                    index > 0 ? `ml-[${stackAmount}px]` : ""
                  } relative transition-all hover:z-10 ${
                    onSupporterClick ? "cursor-pointer" : ""
                  } ${
                    hovered === supporter.id ? "scale-110 z-20" : ""
                  }`}
                  style={index > 0 ? { marginLeft: `${stackAmount}px` } : undefined}
                  onMouseEnter={() => setHovered(supporter.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => onSupporterClick && onSupporterClick(supporter)}
                >
                  <Avatar className={`ring-2 ring-background ${avatarSizeClass}`}>
                    <AvatarImage src={supporter.avatarUrl} alt={supporter.name} />
                    <AvatarFallback className={fallbackFontSize}>
                      {supporter.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </TooltipTrigger>
              {showTooltip && (
                <TooltipContent side="bottom" className="p-2">
                  <div className="space-y-1 text-center">
                    <p className="font-medium">{supporter.name}</p>
                    <UserBadge role={supporter.role} />
                    {supporter.comment && (
                      <p className="text-xs max-w-[200px] line-clamp-2 italic">
                        "{supporter.comment}"
                      </p>
                    )}
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {hiddenCount > 0 && (
          <div 
            className={`relative ml-[${stackAmount}px] bg-muted rounded-full flex items-center justify-center ${avatarSizeClass}`}
            style={{ marginLeft: `${stackAmount}px` }}
          >
            <span className={`text-muted-foreground ${fallbackFontSize}`}>
              +{hiddenCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
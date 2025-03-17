"use client";

import { Badge } from "@/components/ui/badge";
import { Star, Verified, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

interface UserBadgeProps {
  role: UserRole;
  verified?: boolean;
  className?: string;
}

export function UserBadge({ role, verified = false, className }: UserBadgeProps) {
  // Define badge styles based on user role
  const getBadgeStyles = () => {
    switch (role) {
      case 'admin':
        return {
          baseClass: "bg-red-500/20 text-red-500 hover:bg-red-500/30",
          icon: <Shield className="w-3 h-3 mr-1" />
        };
      case 'professional':
        return {
          baseClass: "bg-amber-500/20 text-amber-500 hover:bg-amber-500/30",
          icon: <Verified className="w-3 h-3 mr-1" />
        };
      case 'musician':
        return {
          baseClass: "bg-green-500/20 text-green-500 hover:bg-green-500/30",
          icon: null
        };
      case 'media':
        return {
          baseClass: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30",
          icon: <Star className="w-3 h-3 mr-1 fill-blue-500" />
        };
      case 'fan':
      default:
        return {
          baseClass: "bg-secondary text-muted-foreground hover:bg-secondary/80",
          icon: null
        };
    }
  };

  const { baseClass, icon } = getBadgeStyles();
  
  // Format role name for display
  const formatRoleName = (role: UserRole): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'professional':
        return 'Pro';
      case 'musician':
        return 'Musician';
      case 'media':
        return 'Media';
      case 'fan':
      default:
        return 'Fan';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        "flex items-center text-xs px-2 py-0.5 font-normal",
        baseClass,
        className
      )}
    >
      {icon}
      {formatRoleName(role)}
      {verified && role !== 'media' && (
        <Verified className="w-3 h-3 ml-1 text-primary" />
      )}
    </Badge>
  );
}
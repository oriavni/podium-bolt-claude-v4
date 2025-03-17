"use client";

import { ReactNode } from 'react';
import { useUserRole } from '@/lib/hooks/use-user-role';
import type { UserRole } from '@/lib/types';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { role, loading } = useUserRole();

  if (loading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return fallback;
  }

  return <>{children}</>;
}
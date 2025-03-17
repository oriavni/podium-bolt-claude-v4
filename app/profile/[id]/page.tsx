import { notFound } from "next/navigation";
import { Metadata } from "next";
import { UserProfileClient } from "./user-profile-client";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // In a real app, we would fetch user data from Supabase
  // For now, we'll use a mock title
  return {
    title: `User Profile - Podium`,
    description: `View user profile on Podium`,
  };
}

export default function UserProfilePage({ params }: PageProps) {
  // In a real app, we would check if the user exists in the database
  // For now, we'll just pass the ID to the client component
  return <UserProfileClient userId={params.id} />;
}
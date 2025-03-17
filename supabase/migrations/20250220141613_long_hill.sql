/*
  # User Roles and Permissions System

  1. New Tables
    - `user_profiles`
      - Extends auth.users with additional profile information
      - Stores role-specific data
      - Tracks user stats and metadata
    
  2. Enums
    - `user_role`: Different types of users in the system
    
  3. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    
  4. Changes
    - Add foreign key constraints to existing tables
    - Add role-specific columns and relationships
*/

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('musician', 'professional', 'fan', 'admin');

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'fan',
  display_name text,
  bio text,
  avatar_url text,
  website text,
  location text,
  
  -- Role-specific fields
  professional_title text, -- For professionals
  company text,           -- For professionals
  verified boolean DEFAULT false,
  credentials text[],     -- For professionals (certifications, experience)
  genres text[],         -- For musicians
  instruments text[],    -- For musicians
  
  -- Social links
  social_links jsonb DEFAULT '{}'::jsonb,
  
  -- Stats
  follower_count int DEFAULT 0,
  following_count int DEFAULT 0,
  song_count int DEFAULT 0,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

-- Add role-specific columns to existing tables
ALTER TABLE songs ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS moderation_status text DEFAULT 'pending';
ALTER TABLE songs ADD COLUMN IF NOT EXISTS professional_feedback jsonb DEFAULT '[]'::jsonb;

-- Create moderator actions table
CREATE TABLE IF NOT EXISTS moderator_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid REFERENCES auth.users NOT NULL,
  content_type text NOT NULL, -- 'song', 'comment', 'user'
  content_id uuid NOT NULL,
  action text NOT NULL,       -- 'approve', 'reject', 'ban', etc.
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create professional feedback table
CREATE TABLE IF NOT EXISTS professional_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES auth.users NOT NULL,
  song_id uuid REFERENCES songs NOT NULL,
  content text NOT NULL,
  rating int,
  price decimal,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderator_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_feedback ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Public read access for user profiles"
  ON user_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Moderator Actions Policies
CREATE POLICY "Admin read access for moderator actions"
  ON moderator_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create moderator actions"
  ON moderator_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Professional Feedback Policies
CREATE POLICY "Public read access for approved feedback"
  ON professional_feedback FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Professionals can create feedback"
  ON professional_feedback FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'professional'
    )
  );

CREATE POLICY "Professionals can update their feedback"
  ON professional_feedback FOR UPDATE
  TO authenticated
  USING (professional_id = auth.uid())
  WITH CHECK (professional_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_moderator_actions_content ON moderator_actions(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_professional_feedback_song ON professional_feedback(song_id);

-- Create function to update user profile timestamps
CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user profile updates
CREATE TRIGGER update_user_profile_timestamp
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profile_timestamp();
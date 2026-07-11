-- Add LinkedIn URL field to team members
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS linkedin_url text;

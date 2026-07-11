-- Add key_features, amenities, and developer fields to listings
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS key_features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities     text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS developer     text;

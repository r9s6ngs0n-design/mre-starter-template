-- Starter template — Listing events: auction schedule + open inspection times
-- Migration 010

-- ---------------------------------------------------------------------------
-- 1. Add auction fields to listings table
-- ---------------------------------------------------------------------------

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS auction_at        timestamptz,
  ADD COLUMN IF NOT EXISTS auction_location  text,
  ADD COLUMN IF NOT EXISTS auction_notes     text,
  ADD COLUMN IF NOT EXISTS auction_cancelled boolean DEFAULT false NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. listing_inspection_times — agent-set open home slots per listing
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS listing_inspection_times (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id   uuid        REFERENCES listings ON DELETE CASCADE NOT NULL,
  starts_at    timestamptz NOT NULL,
  ends_at      timestamptz NOT NULL,
  notes        text,
  is_cancelled boolean     DEFAULT false NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE listing_inspection_times ENABLE ROW LEVEL SECURITY;

-- Public can read inspection times for published listings
CREATE POLICY inspection_times_public_read ON listing_inspection_times
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE id = listing_inspection_times.listing_id
        AND is_published = true
    )
  );

-- Staff can manage all inspection times
CREATE POLICY inspection_times_staff_all ON listing_inspection_times
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- Index for fast lookup by listing
CREATE INDEX IF NOT EXISTS idx_inspection_times_listing_id
  ON listing_inspection_times (listing_id, starts_at);

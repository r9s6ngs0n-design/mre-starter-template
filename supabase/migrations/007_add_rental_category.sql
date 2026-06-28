-- Add 'rental' to the listing_category enum
ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'rental';

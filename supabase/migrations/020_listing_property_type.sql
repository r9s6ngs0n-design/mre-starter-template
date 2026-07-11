-- Add explicit backend property type for residential listings.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS property_type text;

UPDATE listings
SET property_type = CASE
  WHEN type_slug IN ('house', 'house-land', 'land', 'apartment', 'townhouse', 'penthouse') THEN type_slug
  ELSE NULL
END
WHERE property_type IS NULL;

ALTER TABLE listings
  DROP CONSTRAINT IF EXISTS listings_property_type_check;

ALTER TABLE listings
  ADD CONSTRAINT listings_property_type_check
  CHECK (
    property_type IS NULL
    OR property_type IN ('house', 'house-land', 'land', 'apartment', 'townhouse', 'penthouse')
  );

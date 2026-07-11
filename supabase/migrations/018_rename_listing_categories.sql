-- Rename listing_category enum values to match new nav labels
ALTER TYPE listing_category RENAME VALUE 'completed' TO 'buy';
ALTER TYPE listing_category RENAME VALUE 'rental' TO 'rent';

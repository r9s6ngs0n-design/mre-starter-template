-- Allow decimal floor areas (e.g. 120.5 m²)
ALTER TABLE listings
  ALTER COLUMN floor_area_sqm TYPE numeric(10, 2)
  USING floor_area_sqm::numeric(10, 2);

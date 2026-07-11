-- Page sections: ordering and publish state for CMS admin

ALTER TABLE page_sections
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_page_sections_page_order
  ON page_sections (page_id, display_order);

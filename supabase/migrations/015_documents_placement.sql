-- Placement and ordering for site-wide document download buttons

ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS display_order int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS placements text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_documents_placements
  ON documents USING gin (placements);

CREATE INDEX IF NOT EXISTS idx_documents_active_order
  ON documents (is_active, display_order);

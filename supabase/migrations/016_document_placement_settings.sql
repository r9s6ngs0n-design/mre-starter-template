-- Per-placement section position on pages (same scale as page_sections display_order)

CREATE TABLE document_placement_settings (
  placement text PRIMARY KEY,
  page_id text NOT NULL,
  section_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER document_placement_settings_updated_at
  BEFORE UPDATE ON document_placement_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE document_placement_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY document_placement_settings_public_select ON document_placement_settings
  FOR SELECT USING (true);

CREATE POLICY document_placement_settings_staff_all ON document_placement_settings
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

INSERT INTO document_placement_settings (placement, page_id, section_order) VALUES
  ('home', 'home', 80),
  ('about', 'about', 70),
  ('contact', 'contact', 60),
  ('insights', 'insights', 20)
ON CONFLICT (placement) DO NOTHING;

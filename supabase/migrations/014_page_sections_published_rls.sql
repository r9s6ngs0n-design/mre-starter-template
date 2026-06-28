-- Only expose published page sections to public; staff see all

DROP POLICY IF EXISTS page_sections_public_select ON page_sections;

CREATE POLICY page_sections_public_select ON page_sections
  FOR SELECT USING (is_published = true OR is_staff());

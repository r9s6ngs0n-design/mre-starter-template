-- Starter template — Row Level Security policies

-- ---------------------------------------------------------------------------
-- Helper: is_staff()
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role IN ('admin', 'agent')
      AND suspended_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND suspended_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id OR is_admin());

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id OR is_admin());

CREATE POLICY users_insert_admin ON users
  FOR INSERT WITH CHECK (is_admin() OR auth.uid() = id);

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_members_public_select ON team_members
  FOR SELECT USING (is_published = true OR is_staff());

CREATE POLICY team_members_staff_all ON team_members
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY listings_public_select ON listings
  FOR SELECT USING (is_published = true OR is_staff());

CREATE POLICY listings_staff_all ON listings
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY blog_posts_public_select ON blog_posts
  FOR SELECT USING (is_published = true OR is_staff());

CREATE POLICY blog_posts_staff_all ON blog_posts
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY testimonials_public_select ON testimonials
  FOR SELECT USING (is_published = true OR is_staff());

CREATE POLICY testimonials_staff_all ON testimonials
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_public_select ON documents
  FOR SELECT USING (is_active = true OR is_staff());

CREATE POLICY documents_staff_all ON documents
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- page_sections
-- ---------------------------------------------------------------------------

ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY page_sections_public_select ON page_sections
  FOR SELECT USING (true);

CREATE POLICY page_sections_staff_all ON page_sections
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- lead_statuses (read-only for all authenticated; public read for pipelines)
-- ---------------------------------------------------------------------------

ALTER TABLE lead_statuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY lead_statuses_public_select ON lead_statuses
  FOR SELECT USING (true);

CREATE POLICY lead_statuses_staff_write ON lead_statuses
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_anon_insert ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY leads_staff_select ON leads
  FOR SELECT USING (is_staff());

CREATE POLICY leads_staff_update ON leads
  FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY leads_staff_delete ON leads
  FOR DELETE USING (is_staff());

-- ---------------------------------------------------------------------------
-- lead_tasks / lead_activities
-- ---------------------------------------------------------------------------

ALTER TABLE lead_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY lead_tasks_staff_all ON lead_tasks
  FOR ALL USING (is_staff()) WITH CHECK (is_staff());

ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY lead_activities_staff_select ON lead_activities
  FOR SELECT USING (is_staff());

CREATE POLICY lead_activities_staff_insert ON lead_activities
  FOR INSERT WITH CHECK (is_staff());

CREATE POLICY lead_activities_staff_update ON lead_activities
  FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

-- ---------------------------------------------------------------------------
-- newsletter_subscribers
-- ---------------------------------------------------------------------------

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY newsletter_anon_insert ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY newsletter_staff_select ON newsletter_subscribers
  FOR SELECT USING (is_staff());

CREATE POLICY newsletter_staff_update ON newsletter_subscribers
  FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY newsletter_staff_delete ON newsletter_subscribers
  FOR DELETE USING (is_staff());

-- ---------------------------------------------------------------------------
-- Analytics — anon insert, staff select
-- ---------------------------------------------------------------------------

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY page_views_anon_insert ON page_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY page_views_staff_select ON page_views
  FOR SELECT USING (is_staff());

ALTER TABLE cta_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY cta_clicks_anon_insert ON cta_clicks
  FOR INSERT WITH CHECK (true);

CREATE POLICY cta_clicks_staff_select ON cta_clicks
  FOR SELECT USING (is_staff());

ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY search_queries_anon_insert ON search_queries
  FOR INSERT WITH CHECK (true);

CREATE POLICY search_queries_staff_select ON search_queries
  FOR SELECT USING (is_staff());

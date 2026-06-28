-- Starter template — initial schema
-- Conventions: uuid PK, created_at/updated_at, soft-delete via is_published / archived_at

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('admin', 'agent');
CREATE TYPE listing_category AS ENUM ('project', 'completed', 'commercial');
CREATE TYPE listing_status AS ENUM (
  'available', 'under_offer', 'sold', 'leased', 'coming_soon'
);
CREATE TYPE lead_category AS ENUM ('buyer', 'vendor', 'landlord', 'tenant');

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Auth / staff
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name text,
  role user_role NOT NULL DEFAULT 'agent',
  phone text,
  avatar_url text,
  suspended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  role_title text,
  bio text,
  avatar_url text,
  phone text,
  email text,
  display_order int NOT NULL DEFAULT 0,
  user_id uuid REFERENCES users (id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_team_members_published ON team_members (is_published, display_order);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category listing_category NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  status listing_status NOT NULL DEFAULT 'available',
  headline text,
  description text,
  suburb text,
  address text,
  price_display text,
  price_min int,
  price_max int,
  bedrooms int,
  bathrooms int,
  carspaces int,
  floor_area_sqm int,
  images text[] NOT NULL DEFAULT '{}',
  video_url text,
  featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  -- project-only (nullable)
  completion_date date,
  project_phase text,
  renders text[] NOT NULL DEFAULT '{}',
  floorplans text[] NOT NULL DEFAULT '{}',
  brochure_url text,
  register_interest_enabled boolean NOT NULL DEFAULT true,
  -- SEO slugs
  city_slug text,
  suburb_slug text,
  type_slug text,
  listing_slug text,
  intent_slugs text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_listings_category ON listings (category);
CREATE INDEX idx_listings_status ON listings (status);
CREATE INDEX idx_listings_published ON listings (is_published);
CREATE INDEX idx_listings_suburb_slug ON listings (suburb_slug);
CREATE INDEX idx_listings_featured ON listings (featured) WHERE is_published = true;

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  body text,
  category text,
  cover_image text,
  read_time int,
  keywords text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  faqs jsonb NOT NULL DEFAULT '[]',
  author_id uuid REFERENCES team_members (id) ON DELETE SET NULL,
  published_at timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_blog_posts_published ON blog_posts (is_published, published_at DESC);

CREATE TABLE testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  quote text NOT NULL,
  client_type text,
  suburb text,
  rating int NOT NULL DEFAULT 5,
  display_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_testimonials_published ON testimonials (is_published, display_order);

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  file_url text,
  external_url text,
  listing_id uuid REFERENCES listings (id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_documents_listing ON documents (listing_id);
CREATE INDEX idx_documents_active ON documents (is_active);

CREATE TABLE page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, section_key)
);

CREATE TRIGGER page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- CRM — lead status reference (per-category pipelines)
-- ---------------------------------------------------------------------------

CREATE TABLE lead_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category lead_category NOT NULL,
  status text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  label text NOT NULL,
  UNIQUE (category, status)
);

INSERT INTO lead_statuses (category, status, display_order, label) VALUES
  -- buyer
  ('buyer', 'new', 0, 'New'),
  ('buyer', 'contacted', 1, 'Contacted'),
  ('buyer', 'requirements_confirmed', 2, 'Requirements Confirmed'),
  ('buyer', 'recommendations_sent', 3, 'Recommendations Sent'),
  ('buyer', 'inspection_booked', 4, 'Inspection Booked'),
  ('buyer', 'offer_submitted', 5, 'Offer Submitted'),
  ('buyer', 'contract_issued', 6, 'Contract Issued'),
  ('buyer', 'sold', 7, 'Sold'),
  ('buyer', 'settlement', 8, 'Settlement'),
  ('buyer', 'future_followup', 9, 'Future Follow-up'),
  -- vendor
  ('vendor', 'appraisal_request', 0, 'Appraisal Request'),
  ('vendor', 'appraisal_booked', 1, 'Appraisal Booked'),
  ('vendor', 'market_presentation', 2, 'Market Presentation'),
  ('vendor', 'authority_signed', 3, 'Authority Signed'),
  ('vendor', 'marketing', 4, 'Marketing'),
  ('vendor', 'buyer_inspections', 5, 'Buyer Inspections'),
  ('vendor', 'offer_negotiation', 6, 'Offer Negotiation'),
  ('vendor', 'sold', 7, 'Sold'),
  ('vendor', 'settlement', 8, 'Settlement'),
  ('vendor', 'past_client', 9, 'Past Client'),
  -- landlord
  ('landlord', 'management_enquiry', 0, 'Management Enquiry'),
  ('landlord', 'rental_appraisal', 1, 'Rental Appraisal'),
  ('landlord', 'management_proposal', 2, 'Management Proposal'),
  ('landlord', 'authority_signed', 3, 'Authority Signed'),
  ('landlord', 'advertised', 4, 'Advertised'),
  ('landlord', 'tenant_secured', 5, 'Tenant Secured'),
  ('landlord', 'lease_executed', 6, 'Lease Executed'),
  ('landlord', 'ongoing_management', 7, 'Ongoing Management'),
  -- tenant
  ('tenant', 'new', 0, 'New'),
  ('tenant', 'contacted', 1, 'Contacted'),
  ('tenant', 'inspection_booked', 2, 'Inspection Booked'),
  ('tenant', 'application', 3, 'Application'),
  ('tenant', 'leased', 4, 'Leased');

-- ---------------------------------------------------------------------------
-- CRM — leads
-- ---------------------------------------------------------------------------

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text,
  preferred_location text,
  budget_range text,
  requirements text,
  category lead_category NOT NULL,
  subtype text,
  source text DEFAULT 'direct',
  enquiry_type text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES team_members (id) ON DELETE SET NULL,
  listing_id uuid REFERENCES listings (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT leads_status_fk FOREIGN KEY (category, status)
    REFERENCES lead_statuses (category, status)
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_leads_category ON leads (category);
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_assigned ON leads (assigned_to);
CREATE INDEX idx_leads_enquiry_type ON leads (enquiry_type);
CREATE INDEX idx_leads_created ON leads (created_at DESC);

CREATE TABLE lead_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES team_members (id) ON DELETE SET NULL,
  title text NOT NULL,
  due_at timestamptz,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER lead_tasks_updated_at
  BEFORE UPDATE ON lead_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_lead_tasks_lead ON lead_tasks (lead_id);
CREATE INDEX idx_lead_tasks_due ON lead_tasks (due_at) WHERE NOT completed;

CREATE TABLE lead_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  actor_id uuid REFERENCES users (id) ON DELETE SET NULL,
  type text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lead_activities_lead ON lead_activities (lead_id, created_at DESC);

CREATE TABLE newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  interest text,
  source text DEFAULT 'website',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Analytics
-- ---------------------------------------------------------------------------

CREATE TABLE page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES users (id) ON DELETE SET NULL,
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_path ON page_views (path);
CREATE INDEX idx_page_views_created ON page_views (created_at DESC);

CREATE TABLE cta_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cta_label text NOT NULL,
  destination_url text,
  page_path text,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_cta_clicks_created ON cta_clicks (created_at DESC);

CREATE TABLE search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text NOT NULL,
  result_count int,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_search_queries_created ON search_queries (created_at DESC);

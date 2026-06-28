-- Starter template — DEV SEED (placeholder data)
-- Run via: npm run db:reset (requires local Supabase + auth users created separately)
--
-- TODO(client): replace all sample rows below with the client's real content,
-- or delete this file entirely and manage content through the admin CRM.
-- Everything here is intentionally generic placeholder data.

-- Team members
INSERT INTO team_members (id, name, slug, role_title, bio, avatar_url, phone, email, display_order, is_published) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Placeholder Agent One', 'agent-one', 'Principal & Director', 'Short placeholder bio for the principal.', '/images/team-1.png', '+1 000 000 0001', 'agent-one@example.com', 0, true),
  ('a1000000-0000-4000-8000-000000000002', 'Placeholder Agent Two', 'agent-two', 'Sales Associate', 'Short placeholder bio.', '/images/team-2.png', '+1 000 000 0002', 'agent-two@example.com', 1, true);

-- Listings (one per category so each public route renders)
INSERT INTO listings (
  id, category, title, slug, status, headline, description, suburb, address,
  price_display, price_min, price_max, bedrooms, bathrooms, carspaces,
  images, featured, display_order, is_published,
  city_slug, suburb_slug, listing_slug, completion_date, project_phase, register_interest_enabled
) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'project', 'Sample Project Listing', 'sample-project-listing', 'available',
   'Placeholder project headline.',
   '<p>Placeholder project description.</p>',
   'Sample Suburb', '1 Example Street', '$000,000', 0, 0, 3, 2, 2,
   ARRAY['/images/project-1.png'], true, 0, true,
   'sample-city', 'sample-suburb', 'sample-project-listing', '2027-06-01', 'Construction', true),
  ('b1000000-0000-4000-8000-000000000002', 'buy', 'Sample Buy Listing', 'sample-buy-listing', 'available',
   'Placeholder buy headline.',
   '<p>Placeholder buy description.</p>',
   'Sample Suburb', '2 Example Street', '$000,000', 0, 0, 4, 3, 2,
   ARRAY['/images/project-2.png'], false, 1, true,
   'sample-city', 'sample-suburb', 'sample-buy-listing', NULL, NULL, false),
  ('b1000000-0000-4000-8000-000000000003', 'rent', 'Sample Rent Listing', 'sample-rent-listing', 'available',
   'Placeholder rent headline.',
   '<p>Placeholder rent description.</p>',
   'Sample Suburb', '3 Example Street', '$000 / week', 0, 0, 2, 1, 1,
   ARRAY['/images/project-3.png'], false, 2, true,
   'sample-city', 'sample-suburb', 'sample-rent-listing', NULL, NULL, false),
  ('b1000000-0000-4000-8000-000000000004', 'commercial', 'Sample Commercial Listing', 'sample-commercial-listing', 'available',
   'Placeholder commercial headline.',
   '<p>Placeholder commercial description.</p>',
   'Sample Suburb', '4 Example Street', '$000,000', 0, 0, NULL, NULL, NULL,
   ARRAY['/images/project-5.png'], false, 3, true,
   'sample-city', 'sample-suburb', 'sample-commercial-listing', NULL, NULL, false);

-- Blog posts
INSERT INTO blog_posts (
  id, title, slug, excerpt, body, category, cover_image, read_time, keywords,
  seo_title, seo_description, author_id, published_at, is_published
) VALUES
  ('c1000000-0000-4000-8000-000000000001',
   'Sample Insight Article',
   'sample-insight-article',
   'Placeholder excerpt for a sample insight article.',
   '<p>Placeholder article body.</p>',
   'MARKET', '/images/insight-1.png', 5, ARRAY['placeholder'],
   'Sample Insight Article', 'Placeholder SEO description.',
   'a1000000-0000-4000-8000-000000000001', now() - interval '30 days', true);

-- Testimonials
INSERT INTO testimonials (client_name, quote, client_type, suburb, rating, display_order, is_published) VALUES
  ('Placeholder Client', 'Placeholder testimonial quote.', 'buyer', 'Sample Suburb', 5, 0, true);

-- Page sections sample
INSERT INTO page_sections (page_id, section_key, content) VALUES
  ('home', 'hero', '{"headline": "{{HERO_HEADLINE}}"}'),
  ('contact', 'intro', '{"text": "{{CONTACT_INTRO}}"}');

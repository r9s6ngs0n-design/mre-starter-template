-- MR ESTATES dev seed
-- Run via: npm run db:reset (requires local Supabase + auth users created separately)

-- Team members (Lionel as principal)
INSERT INTO team_members (id, name, slug, role_title, bio, avatar_url, phone, email, display_order, is_published) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Lionel Marchetti', 'lionel-marchetti', 'Principal & Director', 'Founding director with three decades across Melbourne residential and project marketing.', '/images/team-1.png', '+61 3 9000 0001', 'lionel@mrestates.com.au', 0, true),
  ('a1000000-0000-4000-8000-000000000002', 'Sofia Renard', 'sofia-renard', 'Senior Sales Associate', 'Specialist in off-the-plan and completed apartment acquisitions.', '/images/team-2.png', '+61 3 9000 0002', 'sofia@mrestates.com.au', 1, true),
  ('a1000000-0000-4000-8000-000000000003', 'Marcus Hale', 'marcus-hale', 'Commercial Director', 'Commercial leasing and investment across the CBD and inner south.', '/images/team-3.png', '+61 3 9000 0003', 'marcus@mrestates.com.au', 2, true),
  ('a1000000-0000-4000-8000-000000000004', 'Priya Anand', 'priya-anand', 'Project Marketing', 'Project launches and buyer advocacy for boutique developments.', '/images/team-4.png', '+61 3 9000 0004', 'priya@mrestates.com.au', 3, true);

-- Listings
INSERT INTO listings (
  id, category, title, slug, status, headline, description, suburb, address,
  price_display, price_min, price_max, bedrooms, bathrooms, carspaces,
  images, featured, display_order, is_published,
  city_slug, suburb_slug, listing_slug, completion_date, project_phase, register_interest_enabled
) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'project', 'The Mercer', 'the-mercer-south-yarra', 'available',
   'A curved-glass landmark of one, two & three-bedroom residences.',
   '<p>Premium off-the-plan residences in South Yarra with parkland outlooks.</p>',
   'South Yarra', '1 Mercer Parade', '$685,000', 685000, 1200000, 3, 2, 2,
   ARRAY['/images/project-1.png'], true, 0, true,
   'melbourne', 'south-yarra', 'the-mercer-south-yarra', '2027-06-01', 'Construction', true),
  ('b1000000-0000-4000-8000-000000000002', 'project', 'Boulevard Residences', 'boulevard-residences-st-kilda-road', 'available',
   'Boulevard-facing apartments with parkland and city outlooks.',
   '<p>St Kilda Road apartments with commanding boulevard views.</p>',
   'St Kilda Road', '450 St Kilda Road', '$910,000', 910000, 1800000, 3, 2, 2,
   ARRAY['/images/project-2.png'], true, 1, true,
   'melbourne', 'st-kilda-road', 'boulevard-residences-st-kilda-road', '2026-12-01', 'Pre-launch', true),
  ('b1000000-0000-4000-8000-000000000003', 'buy', 'The Bayle', 'the-bayle-brighton', 'available',
   'Boutique garden residences, move-in ready by the bay.',
   '<p>Completed boutique residences steps from Brighton Beach.</p>',
   'Brighton', '12 Bay Street', '$1,250,000', 1250000, 2400000, 4, 3, 2,
   ARRAY['/images/project-3.png'], false, 2, true,
   'melbourne', 'brighton', 'the-bayle-brighton', NULL, NULL, false),
  ('b1000000-0000-4000-8000-000000000004', 'buy', 'Skyline Penthouse', 'skyline-penthouse-cbd', 'under_offer',
   'A singular penthouse with wraparound terrace and skyline views.',
   '<p>Exceptional penthouse with private terrace and city panorama.</p>',
   'Melbourne CBD', '88 Collins Street', '$3,400,000', 3400000, 3400000, 3, 3, 3,
   ARRAY['/images/project-4.png'], true, 3, true,
   'melbourne', 'melbourne-cbd', 'skyline-penthouse-cbd', NULL, NULL, false),
  ('b1000000-0000-4000-8000-000000000005', 'commercial', 'Collins Quarter', 'collins-quarter-commercial', 'available',
   'Mixed-use retail and A-grade office floors on Collins.',
   '<p>Prime Collins Street commercial floors with retail at podium.</p>',
   'Melbourne CBD', '200 Collins Street', '$2,100,000', 2100000, 8500000, NULL, NULL, NULL,
   ARRAY['/images/project-5.png'], false, 4, true,
   'melbourne', 'melbourne-cbd', 'collins-quarter-commercial', NULL, NULL, false),
  ('b1000000-0000-4000-8000-000000000006', 'project', 'Carlton Collective', 'carlton-collective', 'coming_soon',
   'Heritage-inspired residences wrapped in greenery.',
   '<p>Heritage-responsive apartments in the heart of Carlton.</p>',
   'Carlton', '45 Drummond Street', '$740,000', 740000, 1100000, 3, 2, 1,
   ARRAY['/images/project-6.png'], false, 5, true,
   'melbourne', 'carlton', 'carlton-collective', '2028-03-01', 'Planning', true);

UPDATE listings SET floor_area_sqm = 540 WHERE id = 'b1000000-0000-4000-8000-000000000005';

-- Blog posts
INSERT INTO blog_posts (
  id, title, slug, excerpt, body, category, cover_image, read_time, keywords,
  seo_title, seo_description, author_id, published_at, is_published
) VALUES
  ('c1000000-0000-4000-8000-000000000001',
   'The Melbourne Property Investment Outlook for 2026',
   'melbourne-property-investment-2026',
   'Where considered capital is moving across the city, and what it means for off-the-plan buyers this cycle.',
   '<p>Melbourne''s property market enters 2026 with disciplined capital favouring quality design and established precincts.</p><h2>Key trends</h2><p>Off-the-plan buyers are prioritising build quality and developer track record.</p>',
   'INVESTMENT', '/images/insight-1.png', 7, ARRAY['melbourne','investment','2026'],
   'Melbourne Property Investment Outlook 2026', 'Investment outlook for Melbourne property in 2026.',
   'a1000000-0000-4000-8000-000000000001', now() - interval '30 days', true),
  ('c1000000-0000-4000-8000-000000000002',
   'St Kilda Road: Melbourne''s Enduring Boulevard Investment',
   'st-kilda-road-investment',
   'Why the city''s grand boulevard continues to reward patient, design-led ownership.',
   '<p>St Kilda Road remains one of Melbourne''s most resilient boulevard addresses.</p>',
   'MARKET', '/images/insight-2.png', 6, ARRAY['st-kilda-road','boulevard'],
   'St Kilda Road Investment Guide', 'Why St Kilda Road endures as a Melbourne investment address.',
   'a1000000-0000-4000-8000-000000000001', now() - interval '45 days', true),
  ('c1000000-0000-4000-8000-000000000003',
   'Student Accommodation: A Quietly Resilient Asset Class',
   'student-accommodation-melbourne',
   'Demand, yields, and the locations that matter for Melbourne''s education-led rental market.',
   '<p>Student accommodation near major campuses continues to show resilient rental demand.</p>',
   'INVESTMENT', '/images/insight-3.png', 5, ARRAY['student','rental','yield'],
   'Student Accommodation Melbourne', 'Student accommodation as a resilient Melbourne asset class.',
   'a1000000-0000-4000-8000-000000000004', now() - interval '60 days', true);

-- Testimonials
INSERT INTO testimonials (client_name, quote, client_type, suburb, rating, display_order, is_published) VALUES
  ('Helena & James R.', 'MR Estates showed us a residence weeks before it was advertised. Their guidance turned a daunting process into something genuinely calm.', 'buyer', 'South Yarra', 5, 0, true),
  ('Daniel P.', 'Considered, honest, and impeccably organised from first call to settlement.', 'buyer', 'Brighton', 5, 1, true),
  ('Anita S.', 'They understood our investment brief precisely and matched it without the usual noise.', 'buyer', 'St Kilda Road', 5, 2, true),
  ('Robert & Claire M.', 'Our appraisal was thorough and the marketing campaign exceeded expectations.', 'vendor', 'Carlton', 5, 3, true);

-- Sample leads across pipelines
INSERT INTO leads (full_name, email, mobile, category, subtype, enquiry_type, status, source, budget_range, assigned_to, listing_id) VALUES
  ('James Whitfield', 'james@example.com', '0400111222', 'buyer', 'owner_occupier', 'general', 'contacted', 'google', '$1.25m – $2.5m', 'a1000000-0000-4000-8000-000000000002', NULL),
  ('Sarah Chen', 'sarah@example.com', '0400333444', 'buyer', NULL, 'register_interest', 'inspection_booked', 'portal', NULL, 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001'),
  ('Michael Torres', 'michael@example.com', NULL, 'vendor', 'sales_appraisal', 'appraisal', 'appraisal_booked', 'referral', NULL, 'a1000000-0000-4000-8000-000000000001', NULL),
  ('Emma Walsh', 'emma@example.com', '0400555666', 'landlord', 'property_management', 'property_management', 'rental_appraisal', 'direct', NULL, 'a1000000-0000-4000-8000-000000000003', NULL),
  ('Tom Nguyen', 'tom@example.com', '0400777888', 'tenant', 'rental', 'general', 'new', 'instagram', NULL, NULL, NULL);

-- Newsletter subscribers
INSERT INTO newsletter_subscribers (email, interest, source) VALUES
  ('buyer@example.com', 'buyer', 'website'),
  ('investor@example.com', 'buyer', 'website');

-- Page sections sample
INSERT INTO page_sections (page_id, section_key, content) VALUES
  ('home', 'hero', '{"headline": "Melbourne Living, Curated"}'),
  ('contact', 'intro', '{"text": "We respond within one business day."}');

-- Sample analytics
INSERT INTO page_views (path, session_id) VALUES
  ('/', 'seed-session-1'),
  ('/projects', 'seed-session-1'),
  ('/insights', 'seed-session-2');

INSERT INTO cta_clicks (cta_label, destination_url, page_path, session_id) VALUES
  ('Request an Appraisal', '/contact', '/', 'seed-session-1');

INSERT INTO search_queries (query, result_count, session_id) VALUES
  ('south yarra apartment', 3, 'seed-session-1');

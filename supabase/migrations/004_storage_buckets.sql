-- Storage buckets for site media

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('listing-images', 'listing-images', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('listing-renders', 'listing-renders', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('listing-floorplans', 'listing-floorplans', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('listing-brochures', 'listing-brochures', true, 20971520, ARRAY['application/pdf']),
  ('blog-covers', 'blog-covers', true, 10485760, ARRAY['image/jpeg','image/png','image/webp']),
  ('team-photos', 'team-photos', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('documents', 'documents', true, 20971520, ARRAY['application/pdf','image/jpeg','image/png'])
ON CONFLICT (id) DO NOTHING;

-- Public read on all buckets
CREATE POLICY storage_public_read ON storage.objects
  FOR SELECT USING (bucket_id IN (
    'listing-images', 'listing-renders', 'listing-floorplans',
    'listing-brochures', 'blog-covers', 'team-photos', 'documents'
  ));

-- Staff write
CREATE POLICY storage_staff_insert ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN (
      'listing-images', 'listing-renders', 'listing-floorplans',
      'listing-brochures', 'blog-covers', 'team-photos', 'documents'
    )
    AND is_staff()
  );

CREATE POLICY storage_staff_update ON storage.objects
  FOR UPDATE USING (is_staff()) WITH CHECK (is_staff());

CREATE POLICY storage_staff_delete ON storage.objects
  FOR DELETE USING (is_staff());

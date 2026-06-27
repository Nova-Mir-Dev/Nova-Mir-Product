-- Create storage bucket for portfolio project images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-images',
  'portfolio-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated admin users to upload
CREATE POLICY "Admin upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portfolio-images'
  AND auth.role() = 'authenticated'
  AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Allow public read access to portfolio images
CREATE POLICY "Public read portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Allow admins to delete their uploads
CREATE POLICY "Admin delete portfolio images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portfolio-images'
  AND auth.role() = 'authenticated'
  AND (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
);

-- Private storage bucket for client documents (Nova-Mir-Product-2xm.1). The
-- documents feature previously targeted a bucket that did not exist, so uploads
-- failed at the storage layer. Objects are namespaced by {user_id}/ and RLS
-- restricts authenticated users to their own prefix; the service role (admin
-- delivery) bypasses RLS.
-- Applied to production 2026-07-14 via Management API.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760,
  ARRAY[
    'application/pdf','image/png','image/jpeg','image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain','application/zip'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "documents_own_select" ON storage.objects;
CREATE POLICY "documents_own_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "documents_own_insert" ON storage.objects;
CREATE POLICY "documents_own_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "documents_own_delete" ON storage.objects;
CREATE POLICY "documents_own_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

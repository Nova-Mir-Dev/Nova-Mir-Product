import { createClient } from '@/lib/supabase'

export async function uploadFile(bucket: string, path: string, file: File) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) throw error
  return getPublicUrl(bucket, data.path)
}

export function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient()
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl
}

export async function deleteFile(bucket: string, path: string) {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}

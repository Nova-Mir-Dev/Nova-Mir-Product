'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/zip',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_')
}

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/documents?error=Unauthorized')

  const file = formData.get('file') as File
  if (!file) redirect('/dashboard/documents?error=No+file+selected')

  if (file.size > MAX_FILE_SIZE) {
    redirect('/dashboard/documents?error=File+too+large+%28max+10MB%29')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    redirect('/dashboard/documents?error=File+type+not+allowed')
  }

  const safeName = sanitizeFilename(file.name)
  const filePath = user.id + '/' + Date.now() + '_' + safeName

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError)
    redirect(
      '/dashboard/documents?error=' + encodeURIComponent(uploadError.message),
    )

  // The documents bucket is private; store the storage path and derive a signed
  // URL at read time rather than a public URL.
  const { error: dbError } = await supabase.from('documents').insert({
    user_id: user.id,
    name: safeName,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
  })

  if (dbError)
    redirect(
      '/dashboard/documents?error=' + encodeURIComponent(dbError.message),
    )

  revalidatePath('/dashboard/documents')
  redirect('/dashboard/documents')
}

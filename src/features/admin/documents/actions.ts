'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth-guard'
import { createServiceClient } from '@/lib/supabase-admin'

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
const CATEGORIES = ['contracts', 'guides', 'specs', 'credentials']

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\]/g, '_').replace(/[^a-zA-Z0-9._-]/g, '_')
}

/**
 * Delivers a document to a client: uploads the file to the private documents
 * bucket under the client's {user_id}/ prefix and records a documents row owned
 * by that client, so it appears in their portal. Admin-only; uses the service
 * client to write under another user's storage prefix.
 */
export async function uploadClientDocument(formData: FormData) {
  await requireAdmin()

  const back = '/admin/documents'
  const clientUserId = (formData.get('clientUserId') as string) || ''
  const category = (formData.get('category') as string) || ''
  const file = formData.get('file') as File | null

  if (!clientUserId) redirect(`${back}?error=Select+a+client`)
  if (!file || file.size === 0) redirect(`${back}?error=No+file+selected`)
  if (file.size > MAX_FILE_SIZE)
    redirect(`${back}?error=File+too+large+%28max+10MB%29`)
  if (!ALLOWED_TYPES.includes(file.type))
    redirect(`${back}?error=File+type+not+allowed`)

  const admin = createServiceClient()
  const safeName = sanitizeFilename(file.name)
  const filePath = `${clientUserId}/${Date.now()}_${safeName}`

  const { error: uploadError } = await admin.storage
    .from('documents')
    .upload(filePath, file)
  if (uploadError)
    redirect(`${back}?error=${encodeURIComponent(uploadError.message)}`)

  const { error: dbError } = await admin.from('documents').insert({
    user_id: clientUserId,
    name: safeName,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    category: CATEGORIES.includes(category) ? category : null,
  })
  if (dbError) redirect(`${back}?error=${encodeURIComponent(dbError.message)}`)

  revalidatePath(back)
  redirect(`${back}?success=1`)
}

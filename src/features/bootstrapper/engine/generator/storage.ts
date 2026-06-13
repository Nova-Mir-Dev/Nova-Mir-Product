import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generateStorageFiles(config: BootConfig): GeneratedFile[] {
  const { fileStorage } = config

  switch (fileStorage) {
    case 'none':
      return []

    case 's3': {
      const s3Client: GeneratedFile = {
        path: 'lib/s3.ts',
        content: `import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.S3_BUCKET_NAME!

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }))
  return getPublicUrl(key)
}

export async function getSignedDownloadUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
}

function getPublicUrl(key: string) {
  return \`https://\${BUCKET}.s3.\${process.env.AWS_REGION}.amazonaws.com/\${key}\`
}
`,
      }
      return [s3Client]
    }

    case 'cloudinary': {
      const cloudinaryLib: GeneratedFile = {
        path: 'lib/cloudinary.ts',
        content: `import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(file: File, folder = 'uploads') {
  const buffer = Buffer.from(await file.arrayBuffer())
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err)
      resolve({ url: result!.secure_url, publicId: result!.public_id })
    })
    upload.end(buffer)
  })
}

export function getOptimizedUrl(publicId: string, width = 800) {
  return cloudinary.url(publicId, { width, crop: 'scale', quality: 'auto', fetch_format: 'auto' })
}
`,
      }
      return [cloudinaryLib]
    }

    case 'supabase-storage': {
      const storageLib: GeneratedFile = {
        path: 'lib/storage.ts',
        content: `import { createClient } from '@/lib/supabase'

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
`,
      }
      return [storageLib]
    }

    case 'cloudflare-r2': {
      const r2Lib: GeneratedFile = {
        path: 'lib/r2.ts',
        content: `import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!

export async function uploadFile(key: string, body: Buffer, contentType: string) {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }))
}

export async function getSignedUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
}
`,
      }
      return [r2Lib]
    }

    case 'vercel-blob': {
      const blobLib: GeneratedFile = {
        path: 'lib/vercel-blob.ts',
        content: `import { put, del, list } from '@vercel/blob'

export async function uploadFile(pathname: string, file: File) {
  const blob = await put(pathname, file, { access: 'public' })
  return blob.url
}

export async function deleteFile(url: string) {
  await del(url)
}

export async function listFiles(prefix?: string) {
  const { blobs } = await list({ prefix })
  return blobs
}
`,
      }
      return [blobLib]
    }
  }
}

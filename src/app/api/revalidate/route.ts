import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

const VALID_TAGS = ['pricing', 'portfolio', 'nav-links', 'hero-headlines'] as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tag, secret } = body

    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    if (!tag || !VALID_TAGS.includes(tag)) {
      return NextResponse.json({ error: 'Invalid tag' }, { status: 400 })
    }

    revalidateTag(tag, { expire: 60 })
    return NextResponse.json({ revalidated: true, tag })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

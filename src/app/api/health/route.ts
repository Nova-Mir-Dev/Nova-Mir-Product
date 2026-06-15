import { NextResponse } from 'next/server'
import { internalError } from '@/lib/api-error'

export function GET() {
  try {
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  } catch {
    return internalError()
  }
}

export const dynamic = 'force-dynamic'

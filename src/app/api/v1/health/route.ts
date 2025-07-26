import { NextResponse } from 'next/server'
import { config } from '@/lib/config'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: config.app.version,
    environment: config.app.env,
    name: config.app.name
  })
}
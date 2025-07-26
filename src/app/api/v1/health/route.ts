import { NextResponse } from 'next/server'
import { config } from '@/lib/config'
import { log } from '@/lib/logger'

export async function GET() {
  const startTime = Date.now()
  
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      environment: config.app.env,
      name: config.app.name
    }
    
    const duration = Date.now() - startTime
    log.api('GET', '/api/v1/health', 200, duration)
    
    return NextResponse.json(response)
  } catch (error) {
    const duration = Date.now() - startTime
    log.api('GET', '/api/v1/health', 500, duration, { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
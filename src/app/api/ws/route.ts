import { NextRequest } from 'next/server'
import { wsServer } from '@/lib/websocket'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const protocol = request.headers.get('upgrade')

  if (protocol !== 'websocket') {
    return new Response('WebSocket endpoint - Use WebSocket protocol', {
      status: 426,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade'
      }
    })
  }

  return new Response('WebSocket handshake', {
    status: 101,
    headers: {
      'Upgrade': 'websocket',
      'Connection': 'Upgrade'
    }
  })
}
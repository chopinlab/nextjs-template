import { WebSocket } from 'ws'
import { log } from '@/lib/logger'
import type { WebSocketMessage, WebSocketEventType } from '@/types/websocket'

class WebSocketServer {
  private wss: WebSocket.Server | null = null
  private clients = new Set<WebSocket>()

  init(server: any) {
    this.wss = new WebSocket.Server({ server })

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws)
      log.info('WebSocket client connected', { clientCount: this.clients.size })

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString()) as WebSocketMessage
          this.handleMessage(ws, data)
        } catch (error) {
          log.error('WebSocket message parse error', { error })
        }
      })

      ws.on('close', () => {
        this.clients.delete(ws)
        log.info('WebSocket client disconnected', { clientCount: this.clients.size })
      })

      ws.on('error', (error) => {
        log.error('WebSocket client error', { error })
      })

      ws.send(JSON.stringify({
        type: 'system_notification',
        data: { level: 'info', message: 'Connected to WebSocket server' },
        timestamp: Date.now()
      } as WebSocketMessage))
    })

    log.info('WebSocket server initialized')
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage) {
    log.info('WebSocket message received', { type: message.type, id: message.id })
    
    switch (message.type) {
      case 'timeseries_update':
      case 'sensor_update':
        this.broadcast(message)
        break
      default:
        log.warn('Unknown WebSocket message type', { type: message.type })
    }
  }

  broadcast(message: WebSocketMessage) {
    const messageStr = JSON.stringify(message)
    let sentCount = 0

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr)
        sentCount++
      }
    })

    log.info('WebSocket message broadcasted', { 
      type: message.type, 
      clientCount: sentCount 
    })
  }

  sendToClient(ws: WebSocket, type: WebSocketEventType, data: any) {
    if (ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      ws.send(JSON.stringify(message))
    }
  }

  getClientCount() {
    return this.clients.size
  }
}

export const wsServer = new WebSocketServer()
// 독립적인 WebSocket 서버
import { createServer } from 'http'
import { WebSocketServer } from 'ws'

const port = process.env.WS_PORT || 8080

const server = createServer()
const wss = new WebSocketServer({ server, path: '/ws' })

const clients = new Set()

wss.on('connection', (ws, req) => {
  clients.add(ws)
  console.log(`[WS] 클라이언트 연결됨. 총 ${clients.size}명`)

  // 연결 확인
  ws.send(JSON.stringify({
    type: 'system_notification',
    data: { level: 'info', message: '독립 WebSocket 서버에 연결됨' },
    timestamp: Date.now()
  }))

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`[WS] 메시지 수신:`, data.type)

      // 브로드캐스트
      clients.forEach((client) => {
        if (client !== ws && client.readyState === ws.OPEN) {
          client.send(message.toString())
        }
      })
    } catch (error) {
      console.error('[WS] 메시지 파싱 오류:', error)
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    console.log(`[WS] 클라이언트 연결 해제. 총 ${clients.size}명`)
  })

  ws.on('error', (error) => {
    console.error('[WS] 클라이언트 오류:', error)
  })
})

server.listen(port, () => {
  console.log(`🚀 독립 WebSocket 서버가 포트 ${port}에서 실행 중`)
})

// 종료 시 정리
process.on('SIGTERM', () => {
  console.log('[WS] 서버 종료 중...')
  wss.close(() => {
    server.close(() => {
      console.log('[WS] 서버 종료 완료')
      process.exit(0)
    })
  })
})
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer } from 'ws'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // WebSocket 서버 설정
  const wss = new WebSocketServer({ 
    server,
    path: '/api/ws' 
  })

  const clients = new Set()

  wss.on('connection', (ws, req) => {
    clients.add(ws)
    console.log(`WebSocket 클라이언트 연결됨. 총 ${clients.size}명`)

    // 연결 확인 메시지
    ws.send(JSON.stringify({
      type: 'system_notification',
      data: { level: 'info', message: 'WebSocket 서버에 연결되었습니다' },
      timestamp: Date.now()
    }))

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString())
        console.log('WebSocket 메시지 수신:', data.type)

        // 모든 클라이언트에게 브로드캐스트
        clients.forEach((client) => {
          if (client !== ws && client.readyState === ws.OPEN) {
            client.send(message.toString())
          }
        })
      } catch (error) {
        console.error('WebSocket 메시지 파싱 오류:', error)
      }
    })

    ws.on('close', () => {
      clients.delete(ws)
      console.log(`WebSocket 클라이언트 연결 해제. 총 ${clients.size}명`)
    })

    ws.on('error', (error) => {
      console.error('WebSocket 오류:', error)
    })
  })

  server
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Next.js + WebSocket 서버가 http://${hostname}:${port}에서 실행 중`)
    })
})
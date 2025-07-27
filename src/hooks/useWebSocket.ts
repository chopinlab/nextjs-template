'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWebSocketStore } from '@/stores/websocket'
import type { WebSocketMessage, WebSocketEventType } from '@/types/websocket'

interface UseWebSocketOptions {
  url?: string
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectInterval?: number
}

interface UseWebSocketReturn {
  connect: () => void
  disconnect: () => void
  send: (type: WebSocketEventType, data: any) => void
  subscribe: (type: WebSocketEventType, callback: (data: any) => void) => () => void
  status: string
  error: string | undefined
  isConnected: boolean
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 
      (typeof window !== 'undefined' 
        ? `ws://${window.location.host}/api/ws`
        : 'ws://localhost:3000/api/ws'),
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options

  const {
    status,
    error,
    setStatus,
    setError,
    addMessage,
    clearError
  } = useWebSocketStore()

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectCountRef = useRef(0)
  const subscribersRef = useRef<Map<WebSocketEventType, Set<(data: any) => void>>>(new Map())

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')
    clearError()

    try {
      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setStatus('connected')
        reconnectCountRef.current = 0
        console.log('WebSocket connected')
      }

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          addMessage(message)

          const subscribers = subscribersRef.current.get(message.type)
          if (subscribers) {
            subscribers.forEach(callback => callback(message.data))
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      wsRef.current.onclose = (event) => {
        setStatus('disconnected')
        console.log('WebSocket disconnected:', event.code, event.reason)

        if (reconnectCountRef.current < reconnectAttempts && !event.wasClean) {
          reconnectCountRef.current++
          console.log(`Attempting to reconnect... (${reconnectCountRef.current}/${reconnectAttempts})`)
          setTimeout(connect, reconnectInterval)
        }
      }

      wsRef.current.onerror = (event) => {
        setStatus('error')
        setError('WebSocket connection error')
        console.error('WebSocket error:', event)
      }
    } catch (error) {
      setStatus('error')
      setError(error instanceof Error ? error.message : 'Unknown connection error')
    }
  }, [url, reconnectAttempts, reconnectInterval, setStatus, setError, clearError, addMessage])

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect')
      wsRef.current = null
    }
    setStatus('disconnected')
  }, [setStatus])

  const send = useCallback((type: WebSocketEventType, data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        timestamp: Date.now(),
        id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected. Message not sent:', { type, data })
    }
  }, [])

  const subscribe = useCallback((type: WebSocketEventType, callback: (data: any) => void) => {
    if (!subscribersRef.current.has(type)) {
      subscribersRef.current.set(type, new Set())
    }
    subscribersRef.current.get(type)!.add(callback)

    return () => {
      const subscribers = subscribersRef.current.get(type)
      if (subscribers) {
        subscribers.delete(callback)
        if (subscribers.size === 0) {
          subscribersRef.current.delete(type)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (autoConnect && !wsRef.current) {
      connect()
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount')
        wsRef.current = null
      }
    }
  }, [autoConnect])

  return {
    connect,
    disconnect,
    send,
    subscribe,
    status,
    error,
    isConnected: status === 'connected'
  }
}
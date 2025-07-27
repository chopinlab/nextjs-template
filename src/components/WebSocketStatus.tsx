'use client'

import { useWebSocket } from '@/hooks/useWebSocket'

export default function WebSocketStatus() {
  const { status, error, isConnected, connect, disconnect } = useWebSocket()

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'connecting': return 'text-yellow-600'
      case 'disconnected': return 'text-gray-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '🟢'
      case 'connecting': return '🟡'
      case 'disconnected': return '⚪'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      <span className="text-sm">{getStatusIcon()}</span>
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        WebSocket: {status}
      </span>
      
      {error && (
        <span className="text-xs text-red-500 ml-2">
          {error}
        </span>
      )}

      <div className="ml-auto flex gap-1">
        {!isConnected && (
          <button
            onClick={connect}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            연결
          </button>
        )}
        
        {isConnected && (
          <button
            onClick={disconnect}
            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
          >
            해제
          </button>
        )}
      </div>
    </div>
  )
}
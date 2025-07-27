import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  WebSocketState, 
  WebSocketMessage, 
  WebSocketConnectionStatus 
} from '@/types/websocket'

interface WebSocketStore extends WebSocketState {
  setStatus: (status: WebSocketConnectionStatus) => void
  setError: (error: string) => void
  clearError: () => void
  addMessage: (message: WebSocketMessage) => void
  clearHistory: () => void
  getLastMessageByType: (type: string) => WebSocketMessage | undefined
}

export const useWebSocketStore = create<WebSocketStore>()(
  devtools(
    (set, get) => ({
      status: 'disconnected',
      error: undefined,
      lastMessage: undefined,
      messageHistory: [],

      setStatus: (status) => 
        set({ status }, false, 'websocket/setStatus'),

      setError: (error) => 
        set({ error, status: 'error' }, false, 'websocket/setError'),

      clearError: () => 
        set({ error: undefined }, false, 'websocket/clearError'),

      addMessage: (message) => 
        set((state) => ({
          lastMessage: message,
          messageHistory: [
            message,
            ...state.messageHistory.slice(0, 99) // 최근 100개만 유지
          ]
        }), false, 'websocket/addMessage'),

      clearHistory: () => 
        set({ messageHistory: [], lastMessage: undefined }, false, 'websocket/clearHistory'),

      getLastMessageByType: (type) => {
        const history = get().messageHistory
        return history.find(msg => msg.type === type)
      }
    }),
    { name: 'websocket-store' }
  )
)
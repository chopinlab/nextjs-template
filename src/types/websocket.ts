export type WebSocketEventType = 
  | 'timeseries_update'
  | 'sensor_update'
  | 'user_status'
  | 'system_notification'

export interface WebSocketMessage<T = any> {
  type: WebSocketEventType
  data: T
  timestamp: number
  id?: string
}

export interface TimeSeriesUpdateData {
  metric: string
  value: number
  tags?: Record<string, string>
  timestamp: Date
}

export interface SensorUpdateData {
  sensorId: string
  temperature?: number
  humidity?: number
  pressure?: number
  location?: string
  timestamp: Date
}

export interface UserStatusData {
  userId: string
  status: 'online' | 'offline' | 'away'
  lastSeen?: Date
}

export interface SystemNotificationData {
  level: 'info' | 'warning' | 'error'
  message: string
  title?: string
}

export type WebSocketConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface WebSocketState {
  status: WebSocketConnectionStatus
  error?: string
  lastMessage?: WebSocketMessage
  messageHistory: WebSocketMessage[]
}
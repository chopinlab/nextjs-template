// Server Actions 공통 타입 정의
export type ActionState<T = unknown> = {
  success: boolean
  error?: string
  data?: T
}

// 도메인별 특화 ActionState 타입들
export type TimeSeriesActionState = ActionState<{
  id: number
  metric: string
  value: number
  tags?: Record<string, any>
  timestamp: Date
}>

export type SensorActionState = ActionState<{
  id: number
  sensorId: string
  temperature?: number | null
  humidity?: number | null
  pressure?: number | null
  location?: string | null
  timestamp: Date
}>

export type UserActionState = ActionState<{
  id: number
  email: string
  name?: string | null
  createdAt: Date
}>

// 목록 조회용 타입들
export type TimeSeriesListActionState = ActionState<{
  id: number
  metric: string
  value: number
  tags?: Record<string, any>
  timestamp: Date
}[]>

export type SensorListActionState = ActionState<{
  id: number
  sensorId: string
  temperature?: number | null
  humidity?: number | null
  pressure?: number | null
  location?: string | null
  timestamp: Date
}[]>

export type UserListActionState = ActionState<{
  id: number
  email: string
  name?: string | null
  createdAt: Date
}[]>
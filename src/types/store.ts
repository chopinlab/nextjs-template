// 스토어 관련 타입 정의

export interface User {
  id: string
  email: string
  name: string
}

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: Date
}


export type Theme = 'light' | 'dark'

export interface AppState {
  // 인증 상태
  user: User | null
  isAuthenticated: boolean
  
  // UI 상태
  theme: Theme
  sidebarOpen: boolean
  
  // 알림 상태
  notifications: Notification[]
  
  // Actions
  setUser: (user: User | null) => void
  logout: () => void
  toggleTheme: () => void
  toggleSidebar: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
}

// 편의 훅들의 반환 타입
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

export interface UIState {
  theme: Theme
  sidebarOpen: boolean
  toggleTheme: () => void
  toggleSidebar: () => void
}

export interface NotificationState {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
}
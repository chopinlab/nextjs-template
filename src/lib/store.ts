import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import { useEffect, useState, useCallback } from 'react'
import type { 
  AppState, 
  AuthState, 
  UIState, 
  NotificationState, 
  SensorDataState 
} from '@/types/store'

// Zustand 스토어 생성
export const useAppStore = create<AppState>()(
  persist(
    subscribeWithSelector((set, get) => ({
    // 초기 상태
    user: null,
    isAuthenticated: false,
    theme: 'light',
    sidebarOpen: false,
    notifications: [],
    sensorData: [],
    
    // 인증 관련 액션
    setUser: (user) => set({
      user,
      isAuthenticated: !!user
    }),
    
    logout: () => set({
      user: null,
      isAuthenticated: false
    }),
    
    // UI 관련 액션
    toggleTheme: () => set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light'
    })),
    
    toggleSidebar: () => set((state) => ({
      sidebarOpen: !state.sidebarOpen
    })),
    
    // 알림 관련 액션
    addNotification: (notification) => set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date()
        }
      ]
    })),
    
    removeNotification: (id) => set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    })),
    
    // 센서 데이터 관련 액션
    setSensorData: (data) => set({ sensorData: data }),
    
    addSensorData: (data) => set((state) => ({
      sensorData: [data, ...state.sensorData].slice(0, 100) // 최근 100개만 유지
    }))
    })),
    {
      name: 'app-storage', // localStorage 키
      partialize: (state) => ({
        // 영속화할 상태만 선택
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        // notifications와 sensorData는 세션 데이터이므로 저장하지 않음
      }),
      skipHydration: true, // SSR 호환을 위해 수동 하이드레이션
    }
  )
)

// 간단하고 안전한 SSR 호환 훅들
export const useAuth = (): AuthState => {
  const user = useAppStore(state => state.user)
  const isAuthenticated = useAppStore(state => state.isAuthenticated)
  const setUser = useAppStore(state => state.setUser)
  const logout = useAppStore(state => state.logout)
  
  return { user, isAuthenticated, setUser, logout }
}

export const useUI = (): UIState => {
  const theme = useAppStore(state => state.theme)
  const sidebarOpen = useAppStore(state => state.sidebarOpen)
  const toggleTheme = useAppStore(state => state.toggleTheme)
  const toggleSidebar = useAppStore(state => state.toggleSidebar)
  
  return { theme, sidebarOpen, toggleTheme, toggleSidebar }
}

export const useNotifications = (): NotificationState => {
  const notifications = useAppStore(state => state.notifications)
  const addNotification = useAppStore(state => state.addNotification)
  const removeNotification = useAppStore(state => state.removeNotification)
  
  return { notifications, addNotification, removeNotification }
}

export const useSensorData = (): SensorDataState => {
  const sensorData = useAppStore(state => state.sensorData)
  const setSensorData = useAppStore(state => state.setSensorData)
  const addSensorData = useAppStore(state => state.addSensorData)
  
  return { sensorData, setSensorData, addSensorData }
}
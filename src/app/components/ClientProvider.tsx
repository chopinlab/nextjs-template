'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import type { User } from '@/types/store'

interface ClientProviderProps {
  children: React.ReactNode
  initialUser?: User | null
}

/**
 * 클라이언트 컴포넌트에서 서버 데이터로 Zustand 스토어 초기화
 */
export default function ClientProvider({ children, initialUser }: ClientProviderProps) {
  const setUser = useAppStore((state) => state.setUser)
  
  useEffect(() => {
    // Zustand persist 수동 하이드레이션
    useAppStore.persist.rehydrate()
    
    // 서버에서 전달받은 초기 사용자 데이터로 스토어 초기화
    if (initialUser) {
      setUser(initialUser)
    }
  }, [initialUser, setUser])
  
  return <>{children}</>
}
'use client'

import { useEffect } from 'react'
import { useUI } from '@/stores'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUI()
  
  // CSR 필수: localStorage 접근 및 DOM 조작
  useEffect(() => {
    // HTML 태그에 dark 클래스 추가/제거
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // localStorage에 테마 설정 저장 (CSR에서만 가능)
    localStorage.setItem('user-theme-preference', theme)
  }, [theme])
  
  // 초기 로드 시 시스템 테마 감지 (CSR 필수)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      // 사용자가 직접 설정하지 않았다면 시스템 테마 따라감
      const userPreference = localStorage.getItem('user-theme-preference')
      if (!userPreference) {
        // 시스템 테마 변경에 따라 자동 변경
        if (e.matches && theme === 'light') {
          toggleTheme()
        } else if (!e.matches && theme === 'dark') {
          toggleTheme()
        }
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, toggleTheme])
  
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors"
        aria-label="테마 변경"
      >
        {theme === 'light' ? (
          <span className="text-xl">🌙</span>
        ) : (
          <span className="text-xl">☀️</span>
        )}
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {theme === 'light' ? '라이트' : '다크'}
      </span>
    </div>
  )
}
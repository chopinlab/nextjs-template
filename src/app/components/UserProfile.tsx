'use client'

import { useAuth } from '@/lib/store'

export default function UserProfile() {
  const { user, isAuthenticated, logout } = useAuth()
  
  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">로그인되지 않았습니다</p>
      </div>
    )
  }
  
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-blue-900">사용자 정보</h3>
          <p className="text-sm text-blue-700">이름: {user.name}</p>
          <p className="text-sm text-blue-700">이메일: {user.email}</p>
          <p className="text-xs text-blue-600">ID: {user.id}</p>
        </div>
        <button
          onClick={logout}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </div>
  )
}
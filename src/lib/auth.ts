// 서버에서 세션 데이터를 조회하는 함수들
// 실제 구현에서는 JWT, 쿠키, DB 등을 사용

import { cookies } from 'next/headers'
import type { User } from '@/types/store'

// 모의 세션 데이터 (실제로는 DB나 외부 인증 서비스에서 조회)
const mockUsers: Record<string, User> = {
  '1': { id: '1', email: 'user1@example.com', name: '홍길동' },
  '2': { id: '2', email: 'user2@example.com', name: '김철수' },
  '3': { id: '3', email: 'admin@example.com', name: '관리자' }
}

/**
 * 서버에서 현재 사용자 세션을 조회
 * Server Component에서만 사용 가능
 */
export async function getServerSession(): Promise<{ user: User } | null> {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session-token')?.value
    
    if (!sessionToken) {
      return null
    }
    
    // 실제로는 JWT 검증이나 DB 쿠리
    // 여기서는 단순히 쿠키 값으로 사용자 조회
    const user = mockUsers[sessionToken]
    
    if (!user) {
      return null
    }
    
    return { user }
  } catch (error) {
    console.error('세션 조회 실패:', error)
    return null
  }
}

/**
 * 서버에서 사용자 권한 확인
 */
export async function requireAuth(): Promise<User> {
  const session = await getServerSession()
  
  if (!session) {
    throw new Error('로그인이 필요합니다')
  }
  
  return session.user
}

/**
 * 서버에서 관리자 권한 확인
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  
  if (!user.email.includes('admin')) {
    throw new Error('관리자 권한이 필요합니다')
  }
  
  return user
}

/**
 * 개발용: 세션 토큰 설정 (실제로는 로그인 API에서 처리)
 */
export async function setDevSession(userId: string) {
  const cookieStore = await cookies()
  cookieStore.set('session-token', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7일
  })
}
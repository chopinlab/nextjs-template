import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  // 요청 시작 로그 (개발환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] [INFO] ${request.method} ${request.nextUrl.pathname}`)
  }
  
  // 응답 처리
  const response = NextResponse.next()
  
  // 응답 시간 측정
  const duration = Date.now() - start
  
  // 응답 헤더에 처리 시간 추가
  response.headers.set('X-Response-Time', `${duration}ms`)
  
  return response
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    // API 라우트에만 적용
    '/api/:path*',
    // 특정 페이지에만 적용하려면:
    // '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
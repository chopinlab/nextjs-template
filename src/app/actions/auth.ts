'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ActionState } from '@/types/actions'

export async function loginAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 입력값 검증
    if (!email || !password) {
      return {
        success: false,
        error: '이메일과 비밀번호를 모두 입력해주세요.'
      }
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: '올바른 이메일 형식을 입력해주세요.'
      }
    }

    // TODO: 실제 인증 로직 구현
    // - 데이터베이스에서 사용자 조회
    // - 비밀번호 해시 비교
    // - JWT 토큰 생성 또는 세션 생성
    // - 쿠키 설정

    // 임시 로직 (개발용)
    console.log('로그인 시도:', { email, password: '***' })
    
    // 성공 시뮬레이션 (실제로는 DB 조회 결과에 따라)
    if (email === 'test@example.com' && password === 'password') {
      // 성공 후 리다이렉트
      revalidatePath('/')
      redirect('/')
    }

    return {
      success: false,
      error: '이메일 또는 비밀번호가 올바르지 않습니다.'
    }

  } catch (error) {
    console.error('로그인 에러:', error)
    
    // redirect 에러는 정상적인 흐름이므로 다시 throw
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error
    }
    
    return {
      success: false,
      error: '로그인 중 문제가 발생했습니다. 다시 시도해주세요.'
    }
  }
}
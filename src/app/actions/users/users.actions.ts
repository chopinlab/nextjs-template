'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { UserActionState, UserListActionState } from '@/types/actions'

// 사용자 생성
export async function createUser(formData: FormData): Promise<UserActionState> {
  try {
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    if (!email) {
      throw new Error('이메일은 필수입니다')
    }

    const result = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    })

    revalidatePath('/users')
    return { success: true, data: result }
  } catch (error) {
    console.error('사용자 생성 오류:', error)
    return { success: false, error: '사용자 생성에 실패했습니다' }
  }
}

// 사용자 조회
export async function getUsers(): Promise<UserListActionState> {
  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data }
  } catch (error) {
    console.error('사용자 조회 오류:', error)
    return { success: false, error: '사용자 조회에 실패했습니다' }
  }
}
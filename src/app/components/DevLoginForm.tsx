'use client'

import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { devLogin } from '../actions/auth'
import type { ActionState } from '@/types/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {pending ? '로그인 중...' : '로그인'}
    </button>
  )
}

const initialState: ActionState = { success: false }

export default function DevLoginForm() {
  const [state, formAction] = useActionState(devLogin, initialState)
  
  return (
    <div className="max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4">개발용 로그인</h3>
      
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            사용자 ID (1, 2, 3 중 선택)
          </label>
          <select
            id="userId"
            name="userId"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">선택하세요</option>
            <option value="1">1 - 홍길동 (user1@example.com)</option>
            <option value="2">2 - 김철수 (user2@example.com)</option>
            <option value="3">3 - 관리자 (admin@example.com)</option>
          </select>
        </div>
        
        <SubmitButton />
      </form>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>개발용 로그인입니다. 실제 서비스에서는 이메일/패스워드를 사용하세요.</p>
      </div>
    </div>
  )
}
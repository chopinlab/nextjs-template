'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { createTimeSeriesData } from '../actions/timeseries'
import type { ActionState } from '@/types/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {pending ? '생성 중...' : '데이터 생성'}
    </button>
  )
}

const initialState: ActionState = { success: false }

export default function TimeSeriesForm() {
  const [state, formAction] = useFormState(createTimeSeriesData, initialState)
  
  return (
    <div>
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          데이터가 성공적으로 생성되었습니다!
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="metric" className="block text-sm font-medium text-gray-700">
          메트릭
        </label>
        <input
          type="text"
          id="metric"
          name="metric"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="temperature"
        />
      </div>
      
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-gray-700">
          값
        </label>
        <input
          type="number"
          step="0.01"
          id="value"
          name="value"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="23.5"
        />
      </div>
      
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          태그 (JSON)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder='{"location": "서울", "sensor": "001"}'
        />
      </div>
      
        <SubmitButton />
      </form>
    </div>
  )
}
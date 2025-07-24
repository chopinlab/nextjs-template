'use client'

import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { createSensorData } from '../actions/timeseries'
import type { ActionState } from '@/types/actions'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
    >
      {pending ? '등록 중...' : '센서 데이터 등록'}
    </button>
  )
}

const initialState: ActionState = { success: false }

export default function SensorForm() {
  const [state, formAction] = useActionState(createSensorData, initialState)
  
  return (
    <div>
      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          센서 데이터가 성공적으로 등록되었습니다!
        </div>
      )}
      
      <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="sensorId" className="block text-sm font-medium text-gray-700">
          센서 ID
        </label>
        <input
          type="text"
          id="sensorId"
          name="sensorId"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="sensor-001"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            온도 (°C)
          </label>
          <input
            type="number"
            step="0.1"
            id="temperature"
            name="temperature"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="23.5"
          />
        </div>
        
        <div>
          <label htmlFor="humidity" className="block text-sm font-medium text-gray-700">
            습도 (%)
          </label>
          <input
            type="number"
            step="0.1"
            id="humidity"
            name="humidity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="65.2"
          />
        </div>
        
        <div>
          <label htmlFor="pressure" className="block text-sm font-medium text-gray-700">
            기압 (hPa)
          </label>
          <input
            type="number"
            step="0.1"
            id="pressure"
            name="pressure"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="1013.25"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          위치
        </label>
        <input
          type="text"
          id="location"
          name="location"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="서울특별시"
        />
      </div>
      
        <SubmitButton />
      </form>
    </div>
  )
}
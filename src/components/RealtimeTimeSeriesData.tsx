'use client'

import { useEffect, useState } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import type { TimeSeriesUpdateData } from '@/types/websocket'

export default function RealtimeTimeSeriesData() {
  const { subscribe, send, isConnected } = useWebSocket()
  const [latestData, setLatestData] = useState<TimeSeriesUpdateData[]>([])

  useEffect(() => {
    const unsubscribe = subscribe('timeseries_update', (data: TimeSeriesUpdateData) => {
      setLatestData(prev => [data, ...prev.slice(0, 9)]) // 최근 10개만 유지
    })

    return unsubscribe
  }, [subscribe])

  const sendTestData = () => {
    const testData: TimeSeriesUpdateData = {
      metric: 'test_metric',
      value: Math.random() * 100,
      tags: { source: 'manual_test' },
      timestamp: new Date()
    }
    
    send('timeseries_update', testData)
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">실시간 시계열 데이터</h3>
        <button
          onClick={sendTestData}
          disabled={!isConnected}
          className={`px-3 py-1 text-sm rounded ${
            isConnected 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          테스트 데이터 전송
        </button>
      </div>

      {latestData.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          실시간 데이터를 기다리는 중...
        </p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {latestData.map((data, index) => (
            <div 
              key={index} 
              className="p-2 bg-gray-50 rounded border-l-4 border-blue-400"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-medium text-blue-600">
                    {data.metric}
                  </span>
                  <span className="ml-2 text-lg font-bold">
                    {data.value.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(data.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {data.tags && (
                <div className="mt-1">
                  {Object.entries(data.tags).map(([key, value]) => (
                    <span 
                      key={key}
                      className="inline-block mr-2 px-1 py-0.5 text-xs bg-gray-200 rounded"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
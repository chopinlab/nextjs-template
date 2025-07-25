'use client'

import { useEffect, useState } from 'react'
import { useSensorData } from '@/lib/store'

interface ChartDataPoint {
  timestamp: string
  temperature?: number
  humidity?: number
  pressure?: number
}

export default function RealtimeSensorChart() {
  const { sensorData } = useSensorData()
  const [isRealtime, setIsRealtime] = useState(false)
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // 실시간 데이터 시뮬레이션 (CSR 필수: WebSocket, 타이머 등)
  useEffect(() => {
    if (!isRealtime) return

    const interval = setInterval(() => {
      const now = new Date()
      const newData: ChartDataPoint = {
        timestamp: now.toLocaleTimeString(),
        temperature: Math.round((Math.random() * 10 + 20) * 10) / 10,
        humidity: Math.round((Math.random() * 20 + 40) * 10) / 10,
        pressure: Math.round((Math.random() * 50 + 1000) * 10) / 10,
      }
      
      setChartData(prev => [...prev.slice(-19), newData]) // 최근 20개만 유지
    }, 2000)

    return () => clearInterval(interval)
  }, [isRealtime])

  // 저장된 센서 데이터를 차트 형식으로 변환
  useEffect(() => {
    if (sensorData.length > 0 && !isRealtime) {
      const converted = sensorData
        .slice(0, 10)
        .reverse()
        .map(data => ({
          timestamp: data.timestamp.toLocaleTimeString(),
          temperature: data.temperature,
          humidity: data.humidity,
          pressure: data.pressure,
        }))
      setChartData(converted)
    }
  }, [sensorData, isRealtime])

  const getBarHeight = (value: number | undefined, max: number) => {
    if (!value) return 0
    return (value / max) * 100
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">실시간 센서 데이터 차트</h3>
        <button
          onClick={() => setIsRealtime(!isRealtime)}
          className={`px-4 py-2 rounded font-medium ${
            isRealtime 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isRealtime ? '실시간 중지' : '실시간 시작'}
        </button>
      </div>

      {chartData.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {isRealtime ? '데이터 수집 중...' : '표시할 데이터가 없습니다.'}
        </div>
      ) : (
        <>
          {/* 온도 차트 */}
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">온도 (°C)</h4>
            <div className="flex items-end space-x-1 h-32">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-red-500 w-full rounded-t"
                    style={{ 
                      height: `${getBarHeight(data.temperature, 40)}%`,
                      minHeight: data.temperature ? '4px' : '0'
                    }}
                  />
                  <span className="text-xs text-red-600 mt-1">
                    {data.temperature?.toFixed(1) || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 습도 차트 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">습도 (%)</h4>
            <div className="flex items-end space-x-1 h-32">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-blue-500 w-full rounded-t"
                    style={{ 
                      height: `${getBarHeight(data.humidity, 100)}%`,
                      minHeight: data.humidity ? '4px' : '0'
                    }}
                  />
                  <span className="text-xs text-blue-600 mt-1">
                    {data.humidity?.toFixed(1) || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 기압 차트 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">기압 (hPa)</h4>
            <div className="flex items-end space-x-1 h-32">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="bg-green-500 w-full rounded-t"
                    style={{ 
                      height: `${getBarHeight(data.pressure ? data.pressure - 950 : 0, 100)}%`,
                      minHeight: data.pressure ? '4px' : '0'
                    }}
                  />
                  <span className="text-xs text-green-600 mt-1">
                    {data.pressure?.toFixed(0) || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 시간 축 */}
          <div className="flex justify-between text-xs text-gray-500 px-4">
            {chartData.map((data, index) => (
              <span key={index} className={index % 2 === 0 ? '' : 'opacity-50'}>
                {data.timestamp}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        <p>• <strong>실시간 모드</strong>: 2초마다 새로운 랜덤 데이터 생성 (CSR 필수 기능)</p>
        <p>• <strong>히스토리 모드</strong>: Zustand 스토어의 저장된 센서 데이터 표시</p>
        <p>• 차트는 클라이언트에서만 렌더링됩니다 (타이머, 실시간 업데이트)</p>
      </div>
    </div>
  )
}
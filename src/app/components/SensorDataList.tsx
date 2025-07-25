'use client'

import { useSensorData } from '@/lib/store'

export default function SensorDataList() {
  const { sensorData } = useSensorData()
  
  if (sensorData.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        등록된 센서 데이터가 없습니다.
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">최근 센서 데이터</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sensorData.slice(0, 6).map((data) => (
          <div key={data.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{data.sensorId}</h4>
              <span className="text-xs text-gray-500">
                {data.timestamp.toLocaleTimeString()}
              </span>
            </div>
            
            <div className="space-y-1 text-sm">
              {data.temperature !== undefined && (
                <div className="flex justify-between">
                  <span>온도:</span>
                  <span className="font-mono">{data.temperature}°C</span>
                </div>
              )}
              {data.humidity !== undefined && (
                <div className="flex justify-between">
                  <span>습도:</span>
                  <span className="font-mono">{data.humidity}%</span>
                </div>
              )}
              {data.pressure !== undefined && (
                <div className="flex justify-between">
                  <span>기압:</span>
                  <span className="font-mono">{data.pressure}hPa</span>
                </div>
              )}
              {data.location && (
                <div className="flex justify-between">
                  <span>위치:</span>
                  <span className="text-gray-600">{data.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {sensorData.length > 6 && (
        <p className="text-sm text-gray-500 text-center">
          총 {sensorData.length}개의 데이터 중 최근 6개만 표시
        </p>
      )}
    </div>
  )
}
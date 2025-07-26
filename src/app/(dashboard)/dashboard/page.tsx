import {
  TimeSeriesForm,
  SensorForm,
  UserProfile
} from '@/components'

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            시계열 데이터와 센서 정보를 관리하세요
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <UserProfile />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">시계열 데이터 생성</h2>
            <TimeSeriesForm />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">센서 데이터 등록</h2>
          <SensorForm />
        </div>
      </div>
    </main>
  )
}
import TimeSeriesForm from './components/TimeSeriesForm'
import SensorForm from './components/SensorForm'
import ThemeToggle from './components/ThemeToggle'
import UserProfile from './components/UserProfile'
import DevLoginForm from './components/DevLoginForm'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Next.js 풀스택 템플릿
          </h1>
          <ThemeToggle />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <UserProfile />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <DevLoginForm />
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">시계열 데이터 생성</h2>
            <TimeSeriesForm />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">센서 데이터 등록</h2>
            <SensorForm />
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>Server Actions + TimescaleDB를 활용한 풀스택 개발 템플릿</p>
        </div>
      </div>
    </main>
  )
}
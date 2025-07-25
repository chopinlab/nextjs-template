import TimeSeriesForm from './components/TimeSeriesForm'
import SensorForm from './components/SensorForm'
import ThemeToggle from './components/ThemeToggle'
import SensorDataList from './components/SensorDataList'
import UserProfile from './components/UserProfile'
import DevLoginForm from './components/DevLoginForm'
import RealtimeSensorChart from './components/RealtimeSensorChart'

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Next.js SSR + CSR 하이브리드
          </h1>
          <ThemeToggle />
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <UserProfile />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <DevLoginForm />
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">CSR vs SSR 데모</h2>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p>🔴 <strong>CSR 필수</strong>: 차트, 테마, 알림</p>
              <p>🟢 <strong>SSR 효율</strong>: 폼, 인증, 데이터</p>
              <p>⚖️ <strong>하이브리드</strong>: 최적의 성능</p>
              <p>💾 <strong>영속화</strong>: localStorage 연동</p>
            </div>
          </div>
        </div>
        
        {/* CSR 필수 기능 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <RealtimeSensorChart />
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
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <SensorDataList />
        </div>
        
        <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
          <p>Server Actions + Zustand + localStorage를 활용한 현대적 풀스택 패턴</p>
        </div>
      </div>
    </main>
  )
}
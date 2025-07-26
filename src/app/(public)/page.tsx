import Link from 'next/link'
import {
  DevLoginForm,
  ThemeToggle,
  UserProfile
} from '@/components'

export default function HomePage() {
  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
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
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
            시작하기
          </h2>
          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors"
            >
              대시보드로 이동
            </Link>
            <p className="text-gray-600 dark:text-gray-400">
              대시보드에서 시계열 데이터와 센서 데이터를 관리할 수 있습니다.
            </p>
          </div>
        </div>
        
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>Server Actions + Zustand를 활용한 현대적 풀스택 개발 템플릿</p>
        </div>
      </div>
    </main>
  )
}
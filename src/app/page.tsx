import TimeSeriesForm from './components/TimeSeriesForm'
import SensorForm from './components/SensorForm'

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Next.js + TimescaleDB Template
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">시계열 데이터 생성</h2>
            <TimeSeriesForm />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">센서 데이터 등록</h2>
            <SensorForm />
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p>Server Actions를 사용한 TimescaleDB 연동 예제</p>
        </div>
      </div>
    </main>
  )
}
import { describe, it, expect, afterEach, beforeAll, jest } from '@jest/globals'
import { createTimeSeriesData, getLatestTimeSeriesData } from '../timeseries.actions'
import { prisma } from '@/lib/db'
import type { TimeSeriesActionState } from '@/types/actions'

// revalidatePath 모킹 (Jest 환경에서는 Next.js 캐시가 없음)
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

/**
 * 통합 테스트 - 실제 TimescaleDB 사용
 * 
 * 전제조건:
 * 1. docker-compose up으로 TimescaleDB 실행 중
 * 2. npm run dev로 개발 서버가 한번이라도 실행되어 마이그레이션 완료
 * 
 * 테스트 데이터 구분:
 * - 모든 테스트 데이터는 '__test__' prefix 사용
 * - 테스트 완료 후 자동으로 정리
 */
describe('TimeSeries Server Actions - Integration Test', () => {
  const TEST_PREFIX = '__test__'
  
  beforeAll(async () => {
    // DB 연결 확인
    try {
      await prisma.$connect()
      console.log('✅ TimescaleDB 연결 성공')
    } catch (error) {
      console.error('❌ TimescaleDB 연결 실패:', error)
      throw new Error('TimescaleDB가 실행 중인지 확인하세요: docker-compose up')
    }
  })

  afterEach(async () => {
    // 테스트 데이터만 정리 (실제 개발 데이터는 보존)
    await prisma.timeSeriesData.deleteMany({
      where: {
        metric: {
          startsWith: TEST_PREFIX
        }
      }
    })
  })

  describe('createTimeSeriesData', () => {
    it('should create time series data in real TimescaleDB', async () => {
      // FormData 생성
      const formData = new FormData()
      formData.append('metric', `${TEST_PREFIX}cpu_usage`)
      formData.append('value', '85.5')
      formData.append('tags', '{"server": "web-01", "region": "us-east-1"}')

      const initialState: TimeSeriesActionState = { success: false }

      // ✅ 실제 Server Action 실행 (모킹 없음!)
      const result = await createTimeSeriesData(initialState, formData)

      // 결과 검증
      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(result.data!.metric).toBe(`${TEST_PREFIX}cpu_usage`)
      expect(result.data!.value).toBe(85.5)
      expect(result.data!.tags).toEqual({
        server: 'web-01',
        region: 'us-east-1'
      })

      // ✅ 실제 TimescaleDB에서 직접 확인
      const savedData = await prisma.timeSeriesData.findMany({
        where: { metric: `${TEST_PREFIX}cpu_usage` }
      })

      expect(savedData).toHaveLength(1)
      expect(savedData[0].value).toBe(85.5)
      expect(savedData[0].tags).toEqual({ server: 'web-01', region: 'us-east-1' })
    })

    it('should handle validation errors properly', async () => {
      const formData = new FormData()
      formData.append('metric', '') // 빈 값으로 검증 에러 유발
      formData.append('value', '85.5')

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('metric과 value는 필수입니다')

      // DB에 저장되지 않았는지 확인
      const count = await prisma.timeSeriesData.count({
        where: { metric: { startsWith: TEST_PREFIX } }
      })
      expect(count).toBe(0)
    })

    it('should handle invalid JSON tags', async () => {
      const formData = new FormData()
      formData.append('metric', `${TEST_PREFIX}test_metric`)
      formData.append('value', '100')
      formData.append('tags', 'invalid-json') // 잘못된 JSON

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('태그 JSON 형식이 올바르지 않습니다')

      // DB에 저장되지 않았는지 확인
      const count = await prisma.timeSeriesData.count({
        where: { metric: { startsWith: TEST_PREFIX } }
      })
      expect(count).toBe(0)
    })

    it('should work without tags', async () => {
      const formData = new FormData()
      formData.append('metric', `${TEST_PREFIX}memory_usage`)
      formData.append('value', '45.2')
      // tags 없음

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(true)
      expect(result.data!.tags).toBeNull()

      // DB 검증
      const savedData = await prisma.timeSeriesData.findMany({
        where: { metric: `${TEST_PREFIX}memory_usage` }
      })
      expect(savedData[0].tags).toBeNull()
    })

    it('should handle concurrent requests correctly', async () => {
      // 동시에 여러 요청 처리 테스트
      const promises = []

      for (let i = 0; i < 5; i++) {
        const formData = new FormData()
        formData.append('metric', `${TEST_PREFIX}concurrent_test_${i}`)
        formData.append('value', `${i * 10}`)

        const initialState: TimeSeriesActionState = { success: false }
        promises.push(createTimeSeriesData(initialState, formData))
      }

      const results = await Promise.all(promises)

      // 모든 요청이 성공했는지 확인
      results.forEach((result, index) => {
        expect(result.success).toBe(true)
        expect(result.data!.value).toBe(index * 10)
      })

      // TimescaleDB에 모든 데이터가 저장되었는지 확인
      const count = await prisma.timeSeriesData.count({
        where: { metric: { startsWith: `${TEST_PREFIX}concurrent_test_` } }
      })
      expect(count).toBe(5)
    })
  })

  describe('getLatestTimeSeriesData', () => {
    beforeEach(async () => {
      // 테스트 데이터 직접 생성
      await prisma.timeSeriesData.createMany({
        data: [
          {
            metric: `${TEST_PREFIX}disk_usage`,
            value: 70.0,
            timestamp: new Date('2024-01-01T10:00:00Z')
          },
          {
            metric: `${TEST_PREFIX}disk_usage`,
            value: 80.0,
            timestamp: new Date('2024-01-01T11:00:00Z')
          },
          {
            metric: `${TEST_PREFIX}disk_usage`,
            value: 90.0,
            timestamp: new Date('2024-01-01T12:00:00Z')
          }
        ]
      })
    })

    it('should retrieve latest data from TimescaleDB', async () => {
      const result = await getLatestTimeSeriesData(`${TEST_PREFIX}disk_usage`, 2)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)

      // TimescaleDB의 시계열 정렬 확인 (최신 데이터가 먼저)
      expect(result.data![0].value).toBe(90.0)
      expect(result.data![1].value).toBe(80.0)
    })

    it('should return empty array for non-existent metric', async () => {
      const result = await getLatestTimeSeriesData(`${TEST_PREFIX}nonexistent_metric`)

      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })

    it('should respect limit parameter', async () => {
      const result = await getLatestTimeSeriesData(`${TEST_PREFIX}disk_usage`, 1)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data![0].value).toBe(90.0) // 가장 최신 데이터만
    })

    it('should use default limit when not specified', async () => {
      const result = await getLatestTimeSeriesData(`${TEST_PREFIX}disk_usage`)

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(3) // 모든 데이터 반환
    })
  })
})
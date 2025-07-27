import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { createTimeSeriesData, getLatestTimeSeriesData } from '../timeseries.actions'
import { prisma } from '@/lib/db'
import type { TimeSeriesActionState } from '@/types/actions'

// Prisma 모킹
jest.mock('@/lib/db', () => ({
  prisma: {
    timeSeriesData: {
      create: jest.fn(),
      findMany: jest.fn(),
    }
  },
  timeSeriesQueries: {
    getLatestData: jest.fn(),
  }
}))

// Logger 모킹
jest.mock('@/lib/logger', () => ({
  log: {
    action: jest.fn(),
  }
}))

// Next.js cache 모킹
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

const mockPrisma = prisma as any

describe('TimeSeries Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTimeSeriesData', () => {
    it('should create time series data successfully', async () => {
      // Mock data
      const mockResult = {
        id: 1,
        metric: 'cpu_usage',
        value: 85.5,
        tags: { server: 'web-01' },
        timestamp: new Date()
      }

      mockPrisma.timeSeriesData.create.mockResolvedValue(mockResult)

      // FormData 생성
      const formData = new FormData()
      formData.append('metric', 'cpu_usage')
      formData.append('value', '85.5')
      formData.append('tags', '{"server": "web-01"}')

      const initialState: TimeSeriesActionState = { success: false }

      // 실행
      const result = await createTimeSeriesData(initialState, formData)

      // 검증
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult)
      expect(mockPrisma.timeSeriesData.create).toHaveBeenCalledWith({
        data: {
          metric: 'cpu_usage',
          value: 85.5,
          tags: { server: 'web-01' },
        }
      })
    })

    it('should return error when required fields are missing', async () => {
      const formData = new FormData()
      formData.append('metric', '') // 빈 값
      formData.append('value', '85.5')

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('metric과 value는 필수입니다')
      expect(mockPrisma.timeSeriesData.create).not.toHaveBeenCalled()
    })

    it('should return error when tags JSON is invalid', async () => {
      const formData = new FormData()
      formData.append('metric', 'cpu_usage')
      formData.append('value', '85.5')
      formData.append('tags', 'invalid-json') // 잘못된 JSON

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('태그 JSON 형식이 올바르지 않습니다')
      expect(mockPrisma.timeSeriesData.create).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      mockPrisma.timeSeriesData.create.mockRejectedValue(new Error('Database connection failed'))

      const formData = new FormData()
      formData.append('metric', 'cpu_usage')
      formData.append('value', '85.5')

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('데이터 생성에 실패했습니다')
    })

    it('should work without tags', async () => {
      const mockResult = {
        id: 1,
        metric: 'memory_usage',
        value: 45.2,
        tags: null,
        timestamp: new Date()
      }

      mockPrisma.timeSeriesData.create.mockResolvedValue(mockResult)

      const formData = new FormData()
      formData.append('metric', 'memory_usage')
      formData.append('value', '45.2')
      // tags 없음

      const initialState: TimeSeriesActionState = { success: false }

      const result = await createTimeSeriesData(initialState, formData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResult)
      expect(mockPrisma.timeSeriesData.create).toHaveBeenCalledWith({
        data: {
          metric: 'memory_usage',
          value: 45.2,
          tags: null,
        }
      })
    })
  })

  describe('getLatestTimeSeriesData', () => {
    it('should return latest time series data successfully', async () => {
      const mockData = [
        {
          id: 1,
          metric: 'cpu_usage',
          value: 85.5,
          tags: { server: 'web-01' },
          timestamp: new Date()
        },
        {
          id: 2,
          metric: 'cpu_usage',
          value: 78.2,
          tags: { server: 'web-01' },
          timestamp: new Date()
        }
      ]

      // timeSeriesQueries.getLatestData 모킹
      const { timeSeriesQueries } = require('@/lib/db')
      timeSeriesQueries.getLatestData.mockResolvedValue(mockData)

      const result = await getLatestTimeSeriesData('cpu_usage', 10)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockData)
      expect(timeSeriesQueries.getLatestData).toHaveBeenCalledWith('cpu_usage', 10)
    })

    it('should handle query errors gracefully', async () => {
      const { timeSeriesQueries } = require('@/lib/db')
      timeSeriesQueries.getLatestData.mockRejectedValue(new Error('Query failed'))

      const result = await getLatestTimeSeriesData('cpu_usage')

      expect(result.success).toBe(false)
      expect(result.error).toBe('데이터 조회에 실패했습니다')
    })

    it('should use default limit when not provided', async () => {
      const { timeSeriesQueries } = require('@/lib/db')
      timeSeriesQueries.getLatestData.mockResolvedValue([])

      await getLatestTimeSeriesData('cpu_usage')

      expect(timeSeriesQueries.getLatestData).toHaveBeenCalledWith('cpu_usage', 100)
    })
  })
})
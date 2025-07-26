'use server'

import { revalidatePath } from 'next/cache'
import { prisma, timeSeriesQueries } from '@/lib/db'
import { log } from '@/lib/logger'
import type { TimeSeriesActionState, TimeSeriesListActionState } from '@/types/actions'

// 시계열 데이터 생성
export async function createTimeSeriesData(prevState: TimeSeriesActionState, formData: FormData): Promise<TimeSeriesActionState> {
  log.action('createTimeSeriesData', 'start')
  
  try {
    const metric = formData.get('metric') as string
    const value = formData.get('value') as string
    const tags = formData.get('tags') as string

    if (!metric || !value) {
      log.action('createTimeSeriesData', 'error', { error: 'Required fields missing', metric, value })
      return { success: false, error: 'metric과 value는 필수입니다' }
    }

    // JSON 파싱 처리
    let parsedTags = null
    if (tags) {
      try {
        parsedTags = JSON.parse(tags)
      } catch (error) {
        log.action('createTimeSeriesData', 'error', { error: 'JSON parse failed', tags })
        return { success: false, error: '태그 JSON 형식이 올바르지 않습니다' }
      }
    }

    const result = await prisma.timeSeriesData.create({
      data: {
        metric,
        value: parseFloat(value),
        tags: parsedTags,
      },
    })

    revalidatePath('/')
    log.action('createTimeSeriesData', 'success', { dataId: result.id, metric })
    return { success: true, data: result }
  } catch (error) {
    log.action('createTimeSeriesData', 'error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return { success: false, error: '데이터 생성에 실패했습니다' }
  }
}

// 시계열 데이터 조회 (시간 범위)
export async function getTimeSeriesDataInRange(
  metric: string,
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesListActionState> {
  try {
    const data = await timeSeriesQueries.getDataInRange(metric, startTime, endTime)
    return { success: true, data }
  } catch (error) {
    console.error('시계열 데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}

// 최신 시계열 데이터 조회
export async function getLatestTimeSeriesData(metric: string, limit: number = 100): Promise<TimeSeriesListActionState> {
  try {
    const data = await timeSeriesQueries.getLatestData(metric, limit)
    return { success: true, data }
  } catch (error) {
    console.error('최신 시계열 데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}

// 집계된 시계열 데이터 조회
export async function getAggregatedTimeSeriesData(
  metric: string,
  interval: string,
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesListActionState> {
  try {
    const data = await timeSeriesQueries.getAggregatedData(metric, interval, startTime, endTime)
    return { success: true, data }
  } catch (error) {
    console.error('집계 시계열 데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}
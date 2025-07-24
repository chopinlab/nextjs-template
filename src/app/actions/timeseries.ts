'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma, timeSeriesQueries } from '@/lib/db'
import type { ActionState } from '@/types/actions'

// 시계열 데이터 생성
export async function createTimeSeriesData(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const metric = formData.get('metric') as string
    const value = formData.get('value') as string
    const tags = formData.get('tags') as string

    if (!metric || !value) {
      return { success: false, error: 'metric과 value는 필수입니다' }
    }

    // JSON 파싱 처리
    let parsedTags = null
    if (tags) {
      try {
        parsedTags = JSON.parse(tags)
      } catch (error) {
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
    return { success: true, data: result }
  } catch (error) {
    console.error('시계열 데이터 생성 오류:', error)
    return { success: false, error: '데이터 생성에 실패했습니다' }
  }
}

// 시계열 데이터 조회 (시간 범위)
export async function getTimeSeriesDataInRange(
  metric: string,
  startTime: Date,
  endTime: Date
) {
  try {
    const data = await timeSeriesQueries.getDataInRange(metric, startTime, endTime)
    return { success: true, data }
  } catch (error) {
    console.error('데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}

// 최신 시계열 데이터 조회
export async function getLatestTimeSeriesData(metric: string, limit: number = 100) {
  try {
    const data = await timeSeriesQueries.getLatestData(metric, limit)
    return { success: true, data }
  } catch (error) {
    console.error('최신 데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}

// 집계된 시계열 데이터 조회
export async function getAggregatedTimeSeriesData(
  metric: string,
  interval: string,
  startTime: Date,
  endTime: Date
) {
  try {
    const data = await timeSeriesQueries.getAggregatedData(
      metric,
      interval,
      startTime,
      endTime
    )
    return { success: true, data }
  } catch (error) {
    console.error('집계 데이터 조회 오류:', error)
    return { success: false, error: '데이터 조회에 실패했습니다' }
  }
}

// 센서 데이터 생성
export async function createSensorData(prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const sensorId = formData.get('sensorId') as string
    const temperature = formData.get('temperature') as string
    const humidity = formData.get('humidity') as string
    const pressure = formData.get('pressure') as string
    const location = formData.get('location') as string

    if (!sensorId) {
      return { success: false, error: 'sensorId는 필수입니다' }
    }

    const result = await prisma.sensorData.create({
      data: {
        sensorId,
        temperature: temperature ? parseFloat(temperature) : null,
        humidity: humidity ? parseFloat(humidity) : null,
        pressure: pressure ? parseFloat(pressure) : null,
        location: location || null,
      },
    })

    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    console.error('센서 데이터 생성 오류:', error)
    return { success: false, error: '센서 데이터 생성에 실패했습니다' }
  }
}

// 센서 데이터 조회
export async function getSensorData(sensorId?: string, limit: number = 100) {
  try {
    const data = await prisma.sensorData.findMany({
      where: sensorId ? { sensorId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return { success: true, data }
  } catch (error) {
    console.error('센서 데이터 조회 오류:', error)
    return { success: false, error: '센서 데이터 조회에 실패했습니다' }
  }
}

// 사용자 생성
export async function createUser(formData: FormData) {
  try {
    const email = formData.get('email') as string
    const name = formData.get('name') as string

    if (!email) {
      throw new Error('이메일은 필수입니다')
    }

    const result = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    })

    revalidatePath('/users')
    return { success: true, data: result }
  } catch (error) {
    console.error('사용자 생성 오류:', error)
    return { success: false, error: '사용자 생성에 실패했습니다' }
  }
}

// 사용자 조회
export async function getUsers() {
  try {
    const data = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data }
  } catch (error) {
    console.error('사용자 조회 오류:', error)
    return { success: false, error: '사용자 조회에 실패했습니다' }
  }
}
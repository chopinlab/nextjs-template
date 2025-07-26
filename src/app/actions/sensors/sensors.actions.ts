'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { SensorActionState, SensorListActionState } from '@/types/actions'

// 센서 데이터 생성
export async function createSensorData(prevState: SensorActionState, formData: FormData): Promise<SensorActionState> {
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
export async function getSensorData(sensorId?: string, limit: number = 100): Promise<SensorListActionState> {
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
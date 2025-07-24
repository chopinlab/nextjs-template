import { NextRequest, NextResponse } from 'next/server'
import { prisma, timeSeriesQueries } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const metric = searchParams.get('metric')
    const startTime = searchParams.get('startTime')
    const endTime = searchParams.get('endTime')
    const limit = searchParams.get('limit')

    if (!metric) {
      return NextResponse.json(
        { error: 'metric parameter is required' },
        { status: 400 }
      )
    }

    let data

    if (startTime && endTime) {
      // Get data within time range
      data = await timeSeriesQueries.getDataInRange(
        metric,
        new Date(startTime),
        new Date(endTime)
      )
    } else {
      // Get latest data
      const limitNum = limit ? parseInt(limit) : 100
      data = await timeSeriesQueries.getLatestData(metric, limitNum)
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching time series data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { metric, value, tags } = body

    if (!metric || value === undefined) {
      return NextResponse.json(
        { error: 'metric and value are required' },
        { status: 400 }
      )
    }

    const result = await prisma.timeSeriesData.create({
      data: {
        metric,
        value: parseFloat(value),
        tags: tags || null,
      },
    })

    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error) {
    console.error('Error creating time series data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
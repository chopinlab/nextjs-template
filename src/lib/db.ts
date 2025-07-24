import { PrismaClient } from '../../generated/prisma'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = globalThis.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

// TimescaleDB specific functions
export async function createHypertable(tableName: string, timeColumn: string = 'timestamp') {
  try {
    await prisma.$executeRawUnsafe(`
      SELECT create_hypertable('${tableName}', '${timeColumn}', if_not_exists => TRUE);
    `)
    console.log(`Hypertable created for ${tableName}`)
  } catch (error) {
    console.error(`Error creating hypertable for ${tableName}:`, error)
  }
}

// Initialize TimescaleDB hypertables
export async function initializeTimescaleDB() {
  try {
    // Create hypertables for time-series tables
    await createHypertable('time_series_data', 'timestamp')
    await createHypertable('sensor_data', 'timestamp')
    
    console.log('TimescaleDB initialization completed')
  } catch (error) {
    console.error('Error initializing TimescaleDB:', error)
  }
}

// Query helpers for time-series data
export const timeSeriesQueries = {
  // Get data within time range
  async getDataInRange(metric: string, startTime: Date, endTime: Date) {
    return prisma.timeSeriesData.findMany({
      where: {
        metric,
        timestamp: {
          gte: startTime,
          lte: endTime,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    })
  },

  // Get latest data for a metric
  async getLatestData(metric: string, limit: number = 100) {
    return prisma.timeSeriesData.findMany({
      where: { metric },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    })
  },

  // Aggregate data by time bucket
  async getAggregatedData(
    metric: string,
    interval: string,
    startTime: Date,
    endTime: Date
  ) {
    return prisma.$queryRaw`
      SELECT 
        time_bucket(${interval}::interval, timestamp) as bucket,
        AVG(value) as avg_value,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as count
      FROM time_series_data
      WHERE metric = ${metric}
        AND timestamp >= ${startTime}
        AND timestamp <= ${endTime}
      GROUP BY bucket
      ORDER BY bucket ASC
    `
  },
}

export default prisma
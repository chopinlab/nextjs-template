// Jest setup file

// 실제 개발 DB 사용 (TimescaleDB)
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://admin:admin@localhost:5432/nextjs_dev'
process.env.LOG_LEVEL = 'error'
process.env.LOGGING_ENABLED = 'true'
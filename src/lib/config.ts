// 환경 설정 중앙 관리
export const config = {
  // 앱 기본 설정
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
    name: 'NextJS Template',
    version: process.env.npm_package_version || '1.0.0'
  },

  // 데이터베이스 설정
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    timeout: parseInt(process.env.DB_TIMEOUT || '5000')
  },

  // 인증 설정
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret-key',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '3600'), // 1시간
    cookieName: process.env.COOKIE_NAME || 'auth-token'
  },

  // API 설정
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: parseInt(process.env.API_TIMEOUT || '10000')
  },

  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enabled: process.env.LOGGING_ENABLED !== 'false'
  }
} as const

// 개발 환경 체크 헬퍼
export const isDev = config.app.env === 'development'
export const isProd = config.app.env === 'production'
export const isTest = config.app.env === 'test'

// 필수 환경변수 체크 (서버 시작 시 검증)
export function validateConfig() {
  const requiredVars = []
  
  if (isProd) {
    if (!process.env.DATABASE_URL) requiredVars.push('DATABASE_URL')
    if (!process.env.JWT_SECRET) requiredVars.push('JWT_SECRET')
  }
  
  if (requiredVars.length > 0) {
    console.error('Missing required environment variables:', requiredVars)
    process.exit(1)
  }
  
  console.log(`🚀 Config loaded for ${config.app.env} environment`)
}
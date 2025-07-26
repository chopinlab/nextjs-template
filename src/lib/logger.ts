import { config } from './config'

// 로그 레벨 정의
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

// 로그 레벨 매핑
const LOG_LEVEL_MAP = {
  error: LogLevel.ERROR,
  warn: LogLevel.WARN,
  info: LogLevel.INFO,
  debug: LogLevel.DEBUG,
} as const

// 현재 환경의 로그 레벨
const CURRENT_LOG_LEVEL = LOG_LEVEL_MAP[config.logging.level as keyof typeof LOG_LEVEL_MAP] ?? LogLevel.INFO

// 로그 메타데이터 타입
interface LogMeta {
  timestamp: string
  level: string
  context?: string
  userId?: string
  requestId?: string
  [key: string]: any
}

// 환경 감지
const isServer = typeof window === 'undefined'
const isProduction = config.app.env === 'production'

class Logger {
  private formatMessage(level: string, message: string, meta?: Record<string, any>): LogMeta {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: isServer ? 'server' : 'client',
      environment: config.app.env,
      ...meta,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!config.logging.enabled) return false
    return level <= CURRENT_LOG_LEVEL
  }

  private writeLog(level: string, message: string, meta?: Record<string, any>) {
    if (!this.shouldLog(LOG_LEVEL_MAP[level as keyof typeof LOG_LEVEL_MAP])) {
      return
    }

    const logData = this.formatMessage(level, message, meta)

    if (isServer) {
      // 서버사이드 로깅
      if (isProduction) {
        // 프로덕션: 구조화된 JSON 로그
        console.log(JSON.stringify(logData))
      } else {
        // 개발: 읽기 쉬운 형태
        const prefix = `[${logData.timestamp}] [${level.toUpperCase()}]`
        console.log(`${prefix} ${message}`, meta ? meta : '')
      }
    } else {
      // 클라이언트사이드 로깅
      if (isProduction) {
        // 프로덕션: 에러만 콘솔에, 나머지는 외부 서비스로 전송
        if (level === 'error') {
          console.error(message, meta)
          // TODO: 외부 로깅 서비스로 전송 (Sentry, LogRocket 등)
        }
      } else {
        // 개발: 브라우저 콘솔에 표시
        const consoleMethod = level === 'error' ? 'error' : 
                            level === 'warn' ? 'warn' : 
                            level === 'debug' ? 'debug' : 'log'
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, meta || '')
      }
    }
  }

  error(message: string, meta?: Record<string, any>) {
    this.writeLog('error', message, meta)
  }

  warn(message: string, meta?: Record<string, any>) {
    this.writeLog('warn', message, meta)
  }

  info(message: string, meta?: Record<string, any>) {
    this.writeLog('info', message, meta)
  }

  debug(message: string, meta?: Record<string, any>) {
    this.writeLog('debug', message, meta)
  }

  // Server Actions용 특별 메서드
  action(actionName: string, level: 'start' | 'success' | 'error', meta?: Record<string, any>) {
    const message = `Action ${actionName} ${level}`
    
    if (level === 'error') {
      this.error(message, { actionName, ...meta })
    } else {
      this.info(message, { actionName, ...meta })
    }
  }

  // API Routes용 특별 메서드
  api(method: string, path: string, status: number, duration?: number, meta?: Record<string, any>) {
    const message = `${method} ${path} ${status}`
    const logMeta = { method, path, status, duration, ...meta }
    
    if (status >= 500) {
      this.error(message, logMeta)
    } else if (status >= 400) {
      this.warn(message, logMeta)
    } else {
      this.info(message, logMeta)
    }
  }
}

// 싱글톤 인스턴스
export const logger = new Logger()

// 편의용 함수들
export const log = {
  error: (message: string, meta?: Record<string, any>) => logger.error(message, meta),
  warn: (message: string, meta?: Record<string, any>) => logger.warn(message, meta),
  info: (message: string, meta?: Record<string, any>) => logger.info(message, meta),
  debug: (message: string, meta?: Record<string, any>) => logger.debug(message, meta),
  action: (actionName: string, level: 'start' | 'success' | 'error', meta?: Record<string, any>) => 
    logger.action(actionName, level, meta),
  api: (method: string, path: string, status: number, duration?: number, meta?: Record<string, any>) => 
    logger.api(method, path, status, duration, meta),
}
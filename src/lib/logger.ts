import pino from 'pino'
import { config } from './config'

// 환경 감지
const isServer = typeof window === 'undefined'
const isDevelopment = config.app.env === 'development'

// Pino 로거 설정
const createLogger = () => {
  if (isServer) {
    // 서버사이드 로거
    return pino({
      name: 'backend',
      level: config.logging.enabled ? config.logging.level : 'silent',
      transport: isDevelopment ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        }
      } : undefined,
      base: {
        env: config.app.env,
        context: 'backend'
      }
    })
  } else {
    // 클라이언트사이드 로거 (에러만)
    return pino({
      name: 'frontend',
      level: 'error', // 프론트엔드는 에러만 로깅
      browser: {
        asObject: true,
        formatters: {
          level: (label) => ({ level: label }),
        }
      },
      base: {
        env: config.app.env,
        context: 'frontend'
      }
    })
  }
}

const pinoLogger = createLogger()

class Logger {
  error(message: string, meta?: Record<string, any>) {
    pinoLogger.error(meta || {}, message)
  }

  warn(message: string, meta?: Record<string, any>) {
    if (isServer) {
      pinoLogger.warn(meta || {}, message)
    }
  }

  info(message: string, meta?: Record<string, any>) {
    if (isServer) {
      pinoLogger.info(meta || {}, message)
    }
  }

  debug(message: string, meta?: Record<string, any>) {
    if (isServer) {
      pinoLogger.debug(meta || {}, message)
    }
  }

  // Server Actions용 특별 메서드
  action(actionName: string, level: 'start' | 'success' | 'error', meta?: Record<string, any>) {
    if (!isServer) return
    
    const message = `Action ${actionName} ${level}`
    const logMeta = { actionName, type: 'server_action', ...meta }
    
    if (level === 'error') {
      this.error(message, logMeta)
    } else {
      this.info(message, logMeta)
    }
  }

  // API Routes용 특별 메서드
  api(method: string, path: string, status: number, duration?: number, meta?: Record<string, any>) {
    if (!isServer) return
    
    const message = `${method} ${path} ${status}`
    const logMeta = { method, path, status, duration, type: 'api_route', ...meta }
    
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
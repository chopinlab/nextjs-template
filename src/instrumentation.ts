// Next.js 서버 초기화 시 실행
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 서버 시작 시 환경 설정 검증
    const { validateConfig } = await import('./lib/config')
    validateConfig()
    
    // 데이터베이스 초기화 (선택적)
    if (process.env.AUTO_INIT_DB === 'true') {
      const { initializeTimescaleDB } = await import('./lib/db')
      await initializeTimescaleDB()
    }
  }
}
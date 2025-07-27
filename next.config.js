/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker 프로덕션 빌드 최적화
  output: 'standalone',
  
  // 개발 환경 설정
  turbopack: {},
  
  // 환경별 설정
  experimental: {
    // Server Actions 최적화
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },

  // 이미지 최적화 설정
  images: {
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // 로깅 설정
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },
}

export default nextConfig
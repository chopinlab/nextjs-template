# Next.js 15 + TypeScript + Prisma 프로덕션 Dockerfile
# Multi-stage build for optimal image size

# ============================================
# Stage 1: Dependencies (Node.js Alpine)
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Package files 복사 및 dependencies 설치
COPY package.json package-lock.json ./
# Clean install for production
RUN npm ci --only=production && npm cache clean --force

# ============================================
# Stage 2: Builder (Build application)
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Prisma 클라이언트 생성
RUN npx prisma generate

# Next.js 애플리케이션 빌드
RUN npm run build

# ============================================
# Stage 3: Runner (Production runtime)
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# 보안: non-root 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 프로덕션 환경 설정
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 필요한 파일들만 복사
COPY --from=builder /app/public ./public

# Next.js standalone 빌드 파일 복사 (소유자 변경)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma 클라이언트 복사
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Prisma 스키마 및 마이그레이션 파일 복사 (DB 초기화용)
COPY --chown=nextjs:nodejs prisma ./prisma/

# 헬스체크 스크립트 복사
COPY --chown=nextjs:nodejs scripts/healthcheck.js ./healthcheck.js

# 포트 노출
EXPOSE 3000

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node healthcheck.js || exit 1

# non-root 사용자로 전환
USER nextjs

# 애플리케이션 시작
CMD ["node", "server.js"]
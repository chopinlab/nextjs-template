# Next.js Fullstack Template

TypeScript, Tailwind CSS, Prisma ORM, Server Actions가 설정된 Next.js 풀스택 템플릿입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (개발용) / TimescaleDB (운영용)
- **ORM**: Prisma
- **Package Manager**: npm
- **Architecture**: Server Actions 중심 풀스택

## 📦 설치 및 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 데이터베이스 설정
```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션
npx prisma migrate dev --name init
```

### 3. 개발 서버 실행
```bash
npm run dev
```

## 🏗️ 프로젝트 구조

```
├── src/
│   ├── app/
│   │   ├── actions/          # Server Actions
│   │   │   └── timeseries.ts
│   │   ├── components/       # React 컴포넌트
│   │   │   ├── TimeSeriesForm.tsx
│   │   │   └── SensorForm.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   └── db.ts            # Prisma 클라이언트 & DB 유틸리티
│   └── types/
│       └── actions.ts       # Server Actions 타입 정의
├── prisma/
│   ├── schema.prisma        # 데이터베이스 스키마
│   └── migrations/          # 마이그레이션 파일
├── .env                     # 환경 변수 (gitignore)
├── .env.example            # 환경 변수 템플릿
└── dev.db                  # SQLite 데이터베이스 (개발용)
```

## ⚡ 주요 기능

### 1. Server Actions 기반 풀스택 아키텍처
- **폼 처리**: `useFormState` + Server Actions
- **실시간 상태 관리**: `useFormStatus`로 로딩 상태
- **에러 처리**: 통합된 성공/실패 메시지 시스템

### 2. 데이터베이스 모델
- **TimeSeriesData**: 시계열 데이터 (메트릭, 값, 태그)
- **SensorData**: 센서 데이터 (온도, 습도, 압력, 위치)
- **User**: 사용자 정보

### 3. 개발 편의성
- ES Modules 지원
- TypeScript 완전 지원
- Tailwind CSS 스타일링
- Prisma Studio UI 지원

## 🗄️ 로컬 개발 환경 설정

### 1. 빠른 시작 (SQLite) - 권장
현재 SQLite를 사용하여 **추가 설치 없이** 바로 시작할 수 있습니다.

```bash
# 이미 설정됨 - 추가 설정 불필요
DATABASE_URL="file:./dev.db"

# 바로 시작
npm run dev
```

### 2. 실제 인프라 환경 (Docker) - 운영 환경과 동일

#### Docker Compose로 PostgreSQL + Redis 실행
```bash
# 인프라 시작 (백그라운드 실행)
docker-compose up -d

# 환경 변수 복사
cp .env.docker .env

# 데이터베이스 스키마 변경 (PostgreSQL용)  
# prisma/schema.prisma에서 provider를 "postgresql"로 변경

# 마이그레이션 실행
npx prisma migrate dev --name switch-to-postgresql

# 개발 서버 시작
npm run dev

# TimescaleDB 하이퍼테이블 생성 (마이그레이션 후 한 번만)
docker-compose exec timescaledb psql -U dev -d nextjs_dev -c "SELECT create_hypertables();"
```

#### 포함된 서비스들
- **TimescaleDB**: PostgreSQL + 시계열 확장
- **Redis**: 캐싱 및 세션 스토리지
- **자동 데이터 영속화**: 재시작해도 데이터 유지

#### 인프라 관리 명령어
```bash
# 서비스 시작
docker-compose up -d

# 서비스 중지
docker-compose down

# 데이터까지 완전 삭제
docker-compose down -v

# 로그 확인
docker-compose logs timescaledb
docker-compose logs redis

# TimescaleDB 접속 (디버깅/쿼리 테스트용)
docker-compose exec timescaledb psql -U dev -d nextjs_dev
```

### 3. 클라우드 개발 DB (팀 개발용)
```env
# .env - 클라우드 서비스 사용
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
REDIS_URL="redis://default:pass@redis-xyz.upstash.io:6379"
```

**추천 서비스:**
- **Supabase**: PostgreSQL + 실시간 기능
- **Upstash**: 서버리스 Redis
- **PlanetScale**: MySQL 호환 (서버리스)

### 🤔 어떤 방식을 선택할까?

| 상황 | 추천 방식 | 이유 |
|------|-----------|------|
| **혼자 개발** | SQLite | 간단, 빠른 시작 |
| **팀 개발** | Docker Compose | 환경 통일, 쉬운 설정 |
| **운영 환경 테스트** | Docker Compose | 실제 인프라와 동일 |
| **빠른 프로토타입** | 클라우드 DB | 설치 없이 확장 가능 |

## 🛠️ 개발 도구

### Prisma 명령어
```bash
# 스키마 변경 후 마이그레이션
npx prisma migrate dev --name your-migration-name

# 클라이언트 재생성 (스키마 변경 후 필수)
npx prisma generate

# 데이터베이스 스키마 확인
npx prisma db pull

# 데이터베이스 초기화 (데이터 삭제됨!)
npx prisma migrate reset

# Prisma Studio (GUI) 실행 - 브라우저에서 DB 확인
npx prisma studio
```

### Next.js 명령어
```bash
# 개발 서버 (Turbopack 사용)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트 검사
npm run lint
```

### 디버깅 가이드

#### Server Actions 디버깅 (서버 사이드)
```typescript
// ✅ 터미널 로그 출력
'use server'
export async function createTimeSeriesData() {
  console.log('📊 서버에서 실행:', { metric, value })
  // VS Code 브레이크포인트도 기본 dev 모드에서 작동
}
```

- **터미널에서 확인**: `npm run dev` 실행 후 터미널에서 로그 확인
- **VS Code 디버깅**: 코드 라인 번호 왼쪽 클릭으로 브레이크포인트 설정
- **NPM Scripts 패널**: VS Code Explorer에서 직접 실행 및 디버깅 가능

#### 클라이언트 컴포넌트 디버깅 (브라우저)
```typescript
// ✅ 브라우저 콘솔 출력
'use client'
export default function SensorForm() {
  console.log('🖥️ 브라우저에서 실행:', state)
  // 브라우저 DevTools Sources에서 디버깅 가능
}
```

- **브라우저 DevTools**: F12 → Sources/Console 탭에서 확인
- **React DevTools**: 컴포넌트 상태 실시간 모니터링

#### 고급 디버깅 (필요시)
```json
// package.json에 추가 (선택사항)
{
  "scripts": {
    "debug": "NODE_OPTIONS=--inspect next dev --turbo"
  }
}
```

- **VS Code 고급 디버깅**: Run and Debug 패널에서 "Attach to Node Process" 선택
- **Chrome DevTools**: `chrome://inspect`에서 Remote Target 연결
- **주의**: Server Actions는 브라우저에서 소스 보기 불가 (보안상 정상)

## 💻 Server Actions 사용법

### 기본 폼 구조 (`useFormState` + `useFormStatus`)

```typescript
'use client'

import { useFormStatus, useFormState } from 'react-dom'
import { createTimeSeriesData } from '@/app/actions/timeseries'
import type { ActionState } from '@/types/actions'

const initialState: ActionState = { success: false }

export default function ExampleForm() {
  const [state, formAction] = useFormState(createTimeSeriesData, initialState)
  
  return (
    <div>
      {/* 에러 메시지 */}
      {state.error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {state.error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {state.success && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          성공적으로 저장되었습니다!
        </div>
      )}
      
      <form action={formAction}>
        <input name="metric" placeholder="temperature" required />
        <input name="value" type="number" placeholder="23.5" required />
        <SubmitButton />
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button type="submit" disabled={pending}>
      {pending ? '저장 중...' : '저장'}
    </button>
  )
}
```

### Server Action 정의

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import type { ActionState } from '@/types/actions'

export async function createTimeSeriesData(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  try {
    const metric = formData.get('metric') as string
    const value = formData.get('value') as string

    if (!metric || !value) {
      return { success: false, error: '필수 항목을 입력해주세요' }
    }

    const result = await prisma.timeSeriesData.create({
      data: {
        metric,
        value: parseFloat(value),
      },
    })

    revalidatePath('/') // 페이지 새로고침
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: '저장에 실패했습니다' }
  }
}
```

## 🎯 현재 구현된 기능

### ✅ 작동하는 폼들
1. **시계열 데이터 폼**: 메트릭, 값, 태그 입력
2. **센서 데이터 폼**: 센서 ID, 온도, 습도, 압력, 위치 입력

### ✅ 실시간 UI 피드백
- 폼 제출 중 로딩 상태 표시
- 성공/실패 메시지 자동 표시
- 타입 안전한 에러 처리

### ✅ 데이터베이스 연동
- SQLite 개발 환경 (즉시 시작 가능)
- Prisma ORM을 통한 타입 안전한 DB 접근
- 자동 마이그레이션 지원

## 🚧 추후 확장 가능한 기능

### 인증 시스템
```typescript
// 권한 검사 예시
export async function createTimeSeriesData(prevState: ActionState, formData: FormData) {
  const session = await auth()
  if (!session) {
    return { success: false, error: '로그인이 필요합니다' }
  }
  
  // 기존 로직...
}
```

### 실시간 데이터 조회
```typescript
// 데이터 조회 Server Action
export async function getLatestData() {
  const data = await prisma.timeSeriesData.findMany({
    orderBy: { timestamp: 'desc' },
    take: 10
  })
  return { success: true, data }
}
```

### API 엔드포인트 (외부 접근용)
```typescript
// app/api/data/route.ts - 필요시 추가
export async function GET() {
  // 외부 서비스나 모바일 앱용 API
}
```

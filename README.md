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

## 🗄️ 데이터베이스 설정

### 개발 환경 (SQLite)
현재 SQLite를 사용하여 바로 시작할 수 있습니다.

```bash
# 이미 설정됨 - 추가 설정 불필요
DATABASE_URL="file:./dev.db"
```

### 운영 환경 (TimescaleDB/PostgreSQL)
1. `.env` 파일에서 `DATABASE_URL` 수정:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
```

2. `prisma/schema.prisma`에서 provider 변경:
```prisma
datasource db {
  provider = "postgresql"  // sqlite → postgresql
  url      = env("DATABASE_URL")
}
```

3. 스키마를 PostgreSQL 호환으로 수정 후 마이그레이션:
```bash
npx prisma migrate dev --name switch-to-postgresql
```

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

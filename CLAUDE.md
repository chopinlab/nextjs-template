# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 이 저장소에서 작업할 때 참고하는 프로젝트 가이드입니다.

## 프로젝트 개요

Next.js 15 App Router 기반의 **Server Actions 중심 풀스택 템플릿**입니다.

- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript (완전 타입 지원)
- **Styling**: Tailwind CSS
- **Database**: SQLite (개발용) / PostgreSQL 호환
- **ORM**: Prisma
- **Architecture**: Server Actions 기반 풀스택

## 현재 구현된 상태

### ✅ 완성된 기능들
- **데이터베이스**: Prisma + SQLite 연동 완료
- **Server Actions**: 시계열/센서 데이터 CRUD 구현
- **폼 시스템**: `useFormState` + `useFormStatus` 패턴
- **타입 시스템**: ActionState 공통 타입 정의
- **UI 컴포넌트**: 실시간 피드백이 있는 폼들
- **에러 처리**: 통합된 성공/실패 메시지 시스템

### 📁 프로젝트 구조
```
src/
├── app/
│   ├── actions/          # Server Actions (핵심 비즈니스 로직)
│   │   └── timeseries.ts
│   ├── components/       # React 컴포넌트
│   │   ├── TimeSeriesForm.tsx
│   │   └── SensorForm.tsx
│   └── page.tsx         # 메인 페이지 (폼 데모)
├── lib/
│   └── db.ts            # Prisma 클라이언트 + DB 유틸리티
└── types/
    └── actions.ts       # Server Actions 공통 타입
```

## 개발 패턴 및 규칙

### 1. Server Actions 작성 규칙
```typescript
'use server'

// 반드시 ActionState 타입 사용
export async function actionName(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  try {
    // 비즈니스 로직
    revalidatePath('/') // 페이지 업데이트
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: 'error message' }
  }
}
```

### 2. 폼 컴포넌트 패턴
```typescript
'use client'

const initialState: ActionState = { success: false }

export default function MyForm() {
  const [state, formAction] = useFormState(serverAction, initialState)
  
  return (
    <div>
      {/* 에러/성공 메시지 UI */}
      <form action={formAction}>
        {/* 폼 필드들 */}
        <SubmitButton />
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>...</button>
}
```

### 3. 데이터베이스 모델
- **TimeSeriesData**: 시계열 데이터 (metric, value, tags, timestamp)
- **SensorData**: 센서 데이터 (sensorId, temperature, humidity, pressure, location)
- **User**: 사용자 정보 (email, name)

## 개발 명령어

### 필수 명령어
```bash
# 개발 서버 (Turbopack)
npm run dev

# Prisma 클라이언트 생성 (스키마 변경 후 필수)
npx prisma generate

# 데이터베이스 마이그레이션  
npx prisma migrate dev --name migration-name

# Prisma Studio (DB GUI)
npx prisma studio
```

### 빌드 & 배포
```bash
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm run lint     # 린트 검사
```

## 중요한 설계 원칙

1. **Server Actions 우선**: API Routes 대신 Server Actions 사용
2. **타입 안전성**: 모든 Server Actions에 ActionState 타입 적용
3. **에러 처리**: try-catch 대신 성공/실패 객체 반환
4. **폼 패턴**: useFormState + useFormStatus 조합 사용
5. **리액티브 UI**: 로딩/에러/성공 상태 실시간 표시

## 향후 확장 시 고려사항

### 외부 API 필요 시
- 모바일 앱, 써드파티 연동 → API Routes 추가
- 내부 로직 → Server Actions 유지

### 인증 시스템 추가 시
```typescript
// Server Actions에 권한 검사 추가
const session = await auth()
if (!session) {
  return { success: false, error: '로그인이 필요합니다' }
}
```

### PostgreSQL 전환 시
1. `prisma/schema.prisma`에서 provider 변경
2. 스키마에서 SQLite 타입 제거 (VarChar, Timestamptz 복원)
3. `DATABASE_URL` 변경 후 마이그레이션

이 프로젝트는 **현대적인 Next.js 풀스택 개발 패턴**을 보여주는 완성된 템플릿입니다.
# Next.js 15 SSR + CSR 하이브리드 템플릿

Server Actions + Zustand를 활용한 현대적 풀스택 템플릿입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + 다크모드 지원
- **Database**: SQLite (개발용) / PostgreSQL (운영용)
- **ORM**: Prisma
- **State Management**: Zustand 5.0.6 + persist middleware
- **Architecture**: SSR + CSR 하이브리드

## 📦 빠른 시작

```bash
# 1. 의존성 설치
npm install

# 2. 환경 설정
cp .env.example .env.local
# .env.local 파일을 열어서 필요한 값들을 설정하세요

# 3. 데이터베이스 설정
npx prisma generate
npx prisma migrate dev --name init

# 4. 개발 서버 실행
npm run dev
```

## 🏗️ 프로젝트 구조

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # 🔐 인증 관련 페이지
│   │   └── login/        # 로그인 페이지
│   ├── (dashboard)/      # 📊 대시보드 관련 페이지
│   │   └── dashboard/    # 메인 대시보드
│   ├── (public)/         # 🌐 공개 페이지
│   │   └── page.tsx      # 홈페이지
│   ├── actions/          # Server Actions (도메인별 분리)
│   │   ├── auth/         # 인증 관련 Actions
│   │   ├── sensors/      # 센서 데이터 Actions
│   │   ├── timeseries/   # 시계열 데이터 Actions
│   │   └── users/        # 사용자 관리 Actions
│   ├── api/              # REST API Routes
│   │   └── v1/health/    # 헬스체크 엔드포인트
│   ├── globals.css       # 전역 스타일
│   └── layout.tsx        # 루트 레이아웃
├── components/           # React 컴포넌트 (기능별 분리)
│   ├── forms/            # 폼 관련 컴포넌트
│   ├── ui/               # 재사용 UI 컴포넌트
│   ├── features/         # 기능별 컴포넌트
│   └── index.ts          # 컴포넌트 중앙 export
├── hooks/                # 커스텀 훅
├── stores/               # Zustand 상태 관리
│   ├── store.ts          # 메인 앱 스토어
│   └── index.ts          # 스토어 중앙 export
├── lib/                  # 유틸리티 및 설정
│   ├── config.ts         # 환경 설정
│   ├── db.ts            # Prisma 클라이언트
│   └── auth.ts          # 서버 세션 관리
├── types/               # TypeScript 타입 정의
│   ├── actions.ts       # Server Actions 타입 (제네릭 지원)
│   └── store.ts         # Zustand 스토어 타입
└── instrumentation.ts   # 서버 초기화
docs/                    # 📚 학습 문서
└── fundamentals/        # 기초 개념 가이드
```

## 📚 학습 문서

이 템플릿에는 체계적인 학습 문서가 포함되어 있습니다:

### 🎯 핵심 가이드
- **[CSR vs SSR 완전 가이드](./docs/fundamentals/csr-vs-ssr.md)** - 렌더링 방식 선택 기준과 실무 패턴
- **[브라우저 저장소 가이드](./docs/fundamentals/browser-storage.md)** - 쿠키, localStorage, sessionStorage 완전 정리

### 📖 학습 순서 (추천)
1. [기초 개념](./docs/fundamentals/) - CSR/SSR, 브라우저 저장소, 인증
2. [Next.js 심화](./docs/nextjs/) - Server Actions, App Router, 배포
3. [React 패턴](./docs/react/) - 상태 관리, 훅 패턴, 성능 최적화
4. [보안](./docs/security/) - XSS 방어, CSRF 보호, 토큰 보안

> 💡 각 문서는 **실무에서 바로 사용할 수 있는 코드와 패턴**을 포함하고 있습니다.

---

# ⚡ 핵심 패턴 요약

## CSR vs SSR 선택 기준

### 🔴 CSR 필수 상황
- **브라우저 API**: localStorage, WebSocket, navigator
- **실시간 상호작용**: 채팅, 라이브 업데이트  
- **복잡한 UI**: 드래그앤드롭, 리치 에디터
- **전역 상태**: Zustand, React Context

### 🟢 SSR 효율적 상황  
- **SEO 중요**: 블로그, 쇼핑몰, 마케팅 페이지
- **초기 로딩 중요**: 랜딩 페이지, 대시보드
- **간단한 폼**: 로그인, 회원가입, 설정
- **데이터 표시**: 목록, 프로필, 통계

> 💡 **상세한 선택 기준과 실무 예제**는 [CSR vs SSR 완전 가이드](./docs/fundamentals/csr-vs-ssr.md)를 참고하세요.

---

# 🎯 이 프로젝트의 적용 사례

## SSR 적용 사례

### 1. 사용자 세션 관리
```typescript
// layout.tsx - Server Component
export default async function RootLayout() {
  const session = await getServerSession()  // 서버에서 쿠키 조회
  
  return (
    <ClientProvider initialUser={session?.user}>
      {children}
    </ClientProvider>
  )
}
```

### 2. 폼 처리 (Server Actions)
```typescript
// actions/auth.ts
'use server'
export async function devLogin(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // 서버에서 직접 처리, API Routes 불필요
  const userId = formData.get('userId')
  // 쿠키 설정, DB 업데이트 등
}
```

## CSR 적용 사례

### 1. 전역 상태 관리 (Zustand)
```typescript
// lib/store.ts
export const useAppStore = create(() => ({
  user: null,
  notifications: [],
  theme: 'light',
  // 클라이언트 전용 상태
}))
```

### 2. 실시간 UI 피드백
```typescript
// components/NotificationToast.tsx
'use client'
export default function NotificationToast() {
  const { notifications, removeNotification } = useNotifications()
  
  useEffect(() => {
    // 자동 제거 타이머 (클라이언트 전용)
    const timer = setTimeout(() => removeNotification(id), 5000)
  }, [])
}
```

### 3. 테마 토글
```typescript
// components/ThemeToggle.tsx
'use client'
export default function ThemeToggle() {
  const { theme, toggleTheme } = useUI()
  
  // 클라이언트에서만 가능한 localStorage 접근
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])
}
```

## 하이브리드 패턴

### Server → Client 데이터 전달
```typescript
// 1. 서버에서 초기 데이터 조회
const session = await getServerSession()

// 2. 클라이언트 컴포넌트에 전달
<ClientProvider initialUser={session?.user}>

// 3. 클라이언트에서 Zustand 초기화
useEffect(() => {
  if (initialUser) setUser(initialUser)
}, [])
```

---

# ⚡ 핵심 패턴

## Server Actions 패턴
```typescript
'use server'
export async function createData(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  try {
    // 서버에서 직접 DB 처리
    const result = await db.create({...})
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: 'Error message' }
  }
}
```

## 클라이언트 상태 관리
```typescript
'use client'
const [state, formAction] = useActionState(serverAction, initialState)
const { addNotification } = useNotifications()

// 성공 시 알림 추가
if (state.success) {
  addNotification({ type: 'success', message: '완료!' })
}
```

## SSR 호환 초기화
```typescript
'use client'
export default function ClientProvider({ initialUser, children }) {
  const setUser = useAppStore(state => state.setUser)
  
  useEffect(() => {
    // 서버 데이터로 클라이언트 상태 초기화
    if (initialUser) setUser(initialUser)
  }, [initialUser])
  
  return <>{children}</>
}
```

---

# 🛠️ 개발 명령어

### 기본 명령어
```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # 린트 검사
```

### API 엔드포인트
```bash
GET /api/v1/health    # 헬스체크 (서버 상태 확인)
```

## 📁 폴더 구조 가이드

### Next.js 표준 구조 적용
이 템플릿은 **확장성과 유지보수성**을 고려한 Next.js 표준 구조를 사용합니다:

```typescript
// ✅ 절대 경로 사용 (권장)
import { useAuth } from '@/stores'
import { config } from '@/lib/config'
import { Button } from '@/components/Button'
import { createUser } from '@/app/actions/auth'

// ❌ 상대 경로 사용 (지양)
import { useAuth } from '../../../stores'
import { config } from '../../lib/config'
```

### 폴더별 역할
- **`app/`**: Next.js App Router 기반 페이지 및 API
  - **Route Groups**: `(auth)`, `(dashboard)`, `(public)` 의미적 분리
  - **Server Actions**: 도메인별 분리된 서버 로직
- **`components/`**: 기능별로 분리된 React 컴포넌트
  - **`forms/`**: 폼 관련 컴포넌트
  - **`ui/`**: 재사용 가능한 UI 컴포넌트  
  - **`features/`**: 기능별 비즈니스 로직 컴포넌트
- **`stores/`**: Zustand 상태 관리 (중앙 export 구조)
- **`lib/`**: 유틸리티, 설정, 외부 라이브러리 래퍼
- **`types/`**: 제네릭 지원 TypeScript 타입 정의

### 확장 시 고려사항
- **Server Actions**: 도메인별 폴더 구조로 확장 용이
- **컴포넌트**: 이미 기능별 분리 완료, 하위 카테고리 추가 가능
- **타입 안전성**: 제네릭 ActionState로 완전한 타입 지원

## ⚙️ 환경 설정

### 환경변수 관리
```bash
# 환경변수 파일 우선순위
.env.local          # 개발용 (gitignore, 최우선)
.env.production     # 프로덕션용
.env.development    # 개발 기본값
.env                # 전체 기본값
```

### 설정 사용법
```typescript
// 중앙 관리된 설정 사용
import { config, isDev, isProd } from '@/lib/config'

// 스토어 사용 (타입 안전)
import { useAuth, useUI, useNotifications } from '@/stores'

// 컴포넌트 사용 (중앙 import)
import { TimeSeriesForm, ThemeToggle, UserProfile } from '@/components'

// Server Actions 사용 (도메인별)
import { createSensorData } from '@/app/actions/sensors'
import { createTimeSeriesData } from '@/app/actions/timeseries'

// 데이터베이스 설정
const dbUrl = config.database.url
const maxConnections = config.database.maxConnections

// 환경별 분기
if (isDev) {
  console.log('개발 환경입니다')
}

// 상태 관리 사용
const { user, isAuthenticated } = useAuth()
const { theme, toggleTheme } = useUI()
```

### 필수 환경변수 (프로덕션)
```bash
DATABASE_URL        # 데이터베이스 연결 문자열
JWT_SECRET         # JWT 토큰 암호화 키 (32자 이상)
```

## 📊 로깅 시스템

### 통합 로깅 아키텍처
- **서버사이드**: 구조화된 JSON 로그 (프로덕션) / 읽기 쉬운 형태 (개발)
- **클라이언트사이드**: 브라우저 콘솔 (개발) / 외부 서비스 전송 (프로덕션)
- **자동 환경 감지**: `typeof window === 'undefined'`로 서버/클라이언트 구분

### 로깅 사용법
```typescript
import { log } from '@/lib/logger'

// 기본 로깅
log.info('사용자 로그인', { userId: '123', email: 'user@example.com' })
log.error('데이터베이스 연결 실패', { error: 'Connection timeout' })

// Server Actions 전용
log.action('createUser', 'start')
log.action('createUser', 'success', { userId: newUser.id })
log.action('createUser', 'error', { error: 'Email already exists' })

// API Routes 전용  
log.api('POST', '/api/users', 201, 150, { userId: '123' })
```

### 로그 레벨 설정
```bash
# 환경변수로 제어
LOG_LEVEL=debug    # debug, info, warn, error
LOGGING_ENABLED=true
```

### 프로덕션 권장사항
- **서버 로그**: 파일 시스템 또는 중앙 로깅 서비스 (ELK, Splunk)
- **클라이언트 로그**: Sentry, LogRocket, Datadog 등 외부 서비스
- **로그 레벨**: 프로덕션에서는 `info` 이상, 개발에서는 `debug`

### Prisma 명령어
```bash
npx prisma generate                    # 클라이언트 생성
npx prisma migrate dev --name <name>   # 마이그레이션
npx prisma studio                      # DB GUI
```

---

# 📊 현재 구현된 데모

| 컴포넌트 | 렌더링 방식 | 이유 |
|----------|-------------|------|
| **UserProfile** | SSR → CSR | 서버에서 초기 데이터, 클라이언트에서 상호작용 |
| **DevLoginForm** | CSR | 폼 상태 관리 필요 |
| **NotificationToast** | CSR | 실시간 알림, 타이머 필요 |
| **ThemeToggle** | CSR | localStorage 접근 필요 |
| **SensorForm** | SSR (Server Actions) | 간단한 데이터 입력 |
| **SensorDataList** | CSR | Zustand 상태 의존 |

---

## 브라우저 저장소 핵심 요약

| 저장소 | 크기 | 만료 | 서버 전송 | 보안 | 주요 용도 |
|--------|------|------|-----------|------|-----------|
| **httpOnly 쿠키** | 4KB | 설정 가능 | ✅ 자동 | 🔒 높음 | JWT, 세션 |
| **일반 쿠키** | 4KB | 설정 가능 | ✅ 자동 | ⚠️ 보통 | 추적, 분석 |
| **localStorage** | 5-10MB | 영구 | ❌ 수동 | ⚠️ XSS 위험 | 설정, 캐시 |
| **sessionStorage** | 5-10MB | 탭 종료시 | ❌ 수동 | ⚠️ XSS 위험 | 임시 데이터 |

### 🔑 httpOnly 쿠키의 핵심
```typescript
// ❌ 오해: "HTTP만 지원, HTTPS 안됨"
// ✅ 실제: "JavaScript 접근 차단, 서버만 접근 가능"

cookies().set('jwt-token', token, { 
  httpOnly: true,  // XSS 공격 차단
  secure: true,    // HTTPS 필수
  sameSite: 'lax'  // CSRF 방어
})
```

> 💡 **상세한 저장소 특징과 보안 가이드**는 [브라우저 저장소 가이드](./docs/fundamentals/browser-storage.md)를 참고하세요.

---

이 템플릿은 **SSR과 CSR의 장점을 모두 활용**하는 현대적 Next.js 패턴을 보여줍니다.
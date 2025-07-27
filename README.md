# Next.js 15 Server Actions 중심 풀스택 템플릿

TimescaleDB + Server Actions + WebSocket + Jest 통합 테스트를 활용한 현대적 풀스택 템플릿입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript (완전 타입 지원)
- **Styling**: Tailwind CSS
- **Database**: TimescaleDB (PostgreSQL + 시계열 확장)
- **ORM**: Prisma
- **State Management**: Zustand 5.0.6 + persist middleware
- **Real-time**: WebSocket (ws 라이브러리 + 커스텀 서버)
- **Testing**: Jest + Integration Tests (실제 DB 사용)
- **Logging**: Pino (고성능 로거)
- **Deployment**: Docker + Docker Compose
- **Architecture**: Server Actions 중심 풀스택

## 📦 빠른 시작

### 개발 환경 설정

```bash
# 1. 인프라 실행 (TimescaleDB)
docker-compose up -d

# 2. 의존성 설치
npm install

# 3. 데이터베이스 초기화
npx prisma generate
npx prisma migrate dev --name init

# 4. 개발 서버 실행 (Next.js + WebSocket 통합)
npm run dev
```

### 테스트 실행

```bash
# 통합 테스트 (실제 TimescaleDB 사용)
npm test
```

### 프로덕션 배포

```bash
# Docker Compose로 전체 스택 배포
docker-compose -f docker-compose.prod.yml up --build
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
│   ├── api/              # REST API Routes + WebSocket
│   │   ├── v1/health/    # 헬스체크 엔드포인트
│   │   └── ws/           # WebSocket 엔드포인트
│   ├── globals.css       # 전역 스타일
│   └── layout.tsx        # 루트 레이아웃
├── components/           # React 컴포넌트 (기능별 분리)
│   ├── forms/            # 폼 관련 컴포넌트
│   ├── ui/               # 재사용 UI 컴포넌트
│   ├── features/         # 기능별 컴포넌트
│   └── index.ts          # 컴포넌트 중앙 export
├── hooks/                # 커스텀 훅
│   └── useWebSocket.ts   # WebSocket 클라이언트 훅
├── stores/               # Zustand 상태 관리
│   ├── store.ts          # 메인 앱 스토어
│   ├── websocket.ts      # WebSocket 상태 관리
│   └── index.ts          # 스토어 중앙 export
├── lib/                  # 유틸리티 및 설정
│   ├── config.ts         # 환경 설정
│   ├── db.ts            # Prisma 클라이언트
│   ├── auth.ts          # 서버 세션 관리
│   └── websocket.ts     # WebSocket 서버 로직
├── types/               # TypeScript 타입 정의
│   ├── actions.ts       # Server Actions 타입 (제네릭 지원)
│   ├── store.ts         # Zustand 스토어 타입
│   └── websocket.ts     # WebSocket 메시지 타입
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

## 🧪 테스트 시스템

### Jest 기반 통합 테스트

**실제 TimescaleDB를 사용한 통합 테스트**로 Server Actions의 전체 플로우를 검증합니다.

```typescript
// 테스트 예시: createTimeSeriesData 통합 테스트
describe('createTimeSeriesData', () => {
  it('should create time series data in real TimescaleDB', async () => {
    const formData = new FormData()
    formData.append('metric', '__test__cpu_usage')
    formData.append('value', '85.5')
    formData.append('tags', '{"server": "web-01"}')

    // ✅ 실제 Server Action 호출 (모킹 없음)
    const result = await createTimeSeriesData(initialState, formData)
    
    expect(result.success).toBe(true)
    
    // ✅ 실제 TimescaleDB에서 확인
    const saved = await prisma.timeSeriesData.findMany({
      where: { metric: '__test__cpu_usage' }
    })
    expect(saved[0].value).toBe(85.5)
  })
})
```

### 테스트 특징

- **🔄 실제 DB 연동**: 모킹 없이 실제 TimescaleDB 사용
- **🧹 자동 정리**: `__test__` prefix로 테스트 데이터 구분 및 자동 정리
- **⚡ 빠른 실행**: Jest + VSCode Jest Runner 확장으로 개별 테스트 실행
- **🎯 핵심 로직 검증**: Server Actions의 실제 동작 검증

### VSCode에서 테스트 실행

1. **Jest Runner 확장 설치** (추천)
   - `Ctrl+Shift+X` → "Jest Runner" 검색/설치
   - 테스트 파일에서 `Run|Debug` 버튼 클릭

2. **터미널에서 실행**
   ```bash
   npm run test:integration  # 통합 테스트
   npm run test:unit        # 단위 테스트 (모킹)
   npm test                 # 모든 테스트
   ```

## 🐳 Docker 구성

### 개발 환경
```bash
# 인프라만 실행 (TimescaleDB)
docker-compose up -d

# 애플리케이션은 로컬에서 개발
npm run dev
```

### 프로덕션 환경
```bash
# 전체 스택 배포 (Next.js 앱 + TimescaleDB)
docker-compose -f docker-compose.prod.yml up --build
```

### Docker 파일 구조
```
├── Dockerfile                  # Next.js 앱 멀티스테이지 빌드
├── .dockerignore              # Docker 제외 파일
├── docker-compose.yml         # 개발용 (인프라만)
├── docker-compose.prod.yml    # 프로덕션용 (전체 스택)
└── scripts/
    ├── healthcheck.js         # 헬스체크 스크립트
    └── init-db.sql           # TimescaleDB 초기화
```

## 🛠️ 개발 명령어

### 기본 명령어
```bash
npm run dev      # 개발 서버 (Next.js + WebSocket 통합)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
npm test         # 통합 테스트 (실제 TimescaleDB 사용)
```

### 데이터베이스
```bash
npx prisma generate                    # 클라이언트 생성
npx prisma migrate dev --name <name>   # 마이그레이션
npx prisma studio                      # DB GUI
```

### API 엔드포인트
```bash
GET /api/health         # 헬스체크 (서버 상태 확인)
WS  /api/ws            # WebSocket 실시간 통신
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

## 📊 로깅 시스템 (Pino 기반)

### Pino 로깅 아키텍처
- **라이브러리**: [Pino](https://getpino.io/) - Node.js 최고 성능 로거 (Winston 대비 5배 빠름)
- **백엔드**: 모든 로그 레벨 지원, `context: 'backend'` 라벨
- **프론트엔드**: **에러만** 로깅, `context: 'frontend'` 라벨
- **개발환경**: `pino-pretty`로 컬러풀한 읽기 쉬운 출력
- **프로덕션**: 구조화된 JSON 로그

### 로깅 사용법
```typescript
import { log } from '@/lib/logger'

// 기본 로깅 (백엔드만)
log.info('사용자 로그인', { userId: '123', email: 'user@example.com' })
log.warn('잠재적 문제', { issue: 'slow query' })
log.debug('디버그 정보', { details: 'trace info' })

// 에러 로깅 (백엔드 + 프론트엔드)
log.error('데이터베이스 연결 실패', { error: 'Connection timeout' })

// Server Actions 전용 (백엔드)
log.action('createUser', 'start')
log.action('createUser', 'success', { userId: newUser.id })
log.action('createUser', 'error', { error: 'Email already exists' })

// API Routes 전용 (백엔드)
log.api('POST', '/api/users', 201, 150, { userId: '123' })
```

### 환경별 동작
```bash
# 개발환경
- 백엔드: 컬러풀한 pretty 출력 (모든 레벨)
- 프론트엔드: 브라우저 콘솔에 에러만

# 프로덕션
- 백엔드: JSON 구조화 로그 (stdout)
- 프론트엔드: 브라우저 콘솔에 에러만
```

### 로그 레벨 설정
```bash
# 환경변수로 제어
LOG_LEVEL=debug    # debug, info, warn, error
LOGGING_ENABLED=true

# 개발용 의존성
npm install pino pino-pretty
```

### 로그 출력 예시
```bash
# 개발환경 (pino-pretty)
[2024-01-15 10:30:45] INFO (backend): Action createUser start {"actionName":"createUser","type":"server_action"}

# 프로덕션 (JSON)
{"level":30,"time":1705301445123,"name":"backend","context":"backend","msg":"Action createUser start","actionName":"createUser","type":"server_action"}
```

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

## 🔌 WebSocket 실시간 통신

### 아키텍처
- **커스텀 서버**: Next.js + WebSocket을 단일 프로세스로 통합
- **클라이언트 훅**: `useWebSocket`으로 자동 연결/재연결 관리
- **상태 관리**: Zustand 기반 실시간 메시지 히스토리
- **타입 안전**: TypeScript로 메시지 타입 완전 지원

### 기본 사용법

```typescript
'use client'
import { useWebSocket } from '@/hooks/useWebSocket'

export default function RealtimeComponent() {
  const { subscribe, send, isConnected } = useWebSocket()

  useEffect(() => {
    const unsubscribe = subscribe('timeseries_update', (data) => {
      console.log('실시간 데이터:', data)
    })
    return unsubscribe
  }, [subscribe])

  const sendTestData = () => {
    send('timeseries_update', {
      metric: 'cpu_usage',
      value: 85.5,
      timestamp: new Date()
    })
  }

  return (
    <div>
      <p>연결 상태: {isConnected ? '🟢 연결됨' : '🔴 끊어짐'}</p>
      <button onClick={sendTestData}>테스트 데이터 전송</button>
    </div>
  )
}
```

### 연결 정보
- **개발환경**: `ws://localhost:3000/api/ws`
- **자동 재연결**: 최대 5회, 3초 간격
- **브라우저 제한**: 도메인당 최대 255개 동시 연결 (Chrome 기준)

### 메시지 타입
```typescript
// 지원하는 메시지 타입
type WebSocketEventType = 
  | 'timeseries_update'   // 시계열 데이터 업데이트
  | 'sensor_update'       // 센서 데이터 업데이트  
  | 'user_status'         // 사용자 상태 변경
  | 'system_notification' // 시스템 알림
```

---

이 템플릿은 **SSR과 CSR의 장점을 모두 활용**하는 현대적 Next.js 패턴을 보여줍니다.
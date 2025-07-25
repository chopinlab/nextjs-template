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

# 2. 데이터베이스 설정
npx prisma generate
npx prisma migrate dev --name init

# 3. 개발 서버 실행
npm run dev
```

## 🏗️ 프로젝트 구조

```
src/
├── app/
│   ├── actions/          # Server Actions (인증, 데이터 처리)
│   ├── components/       # React 컴포넌트 (SSR + CSR)
│   └── page.tsx         # 메인 페이지
├── lib/
│   ├── db.ts            # Prisma 클라이언트
│   ├── store.ts         # Zustand 전역 상태 관리
│   └── auth.ts          # 서버 세션 관리
├── types/
│   ├── actions.ts       # Server Actions 타입
│   └── store.ts         # Zustand 스토어 타입
└── docs/                # 📚 학습 문서
    └── fundamentals/    # 기초 개념 가이드
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
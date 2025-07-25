# 🔄 CSR vs SSR 완전 가이드

모던 웹 개발에서 가장 중요한 선택 중 하나인 렌더링 방식에 대해 정리했습니다. 언제 어떤 방식을 사용해야 하는지 실무 관점에서 설명합니다.

## 📖 기본 개념

### SSR (Server-Side Rendering)
- **서버에서 HTML을 완성**한 후 클라이언트로 전송
- **초기 로딩이 빠르고** SEO에 유리
- Next.js에서는 **Server Components** 사용

### CSR (Client-Side Rendering)  
- **클라이언트에서 JavaScript로 DOM을 생성**
- **상호작용이 풍부**하고 실시간 업데이트 가능
- Next.js에서는 **'use client'** 지시어 필요

### 하이브리드 패턴 (권장)
- **페이지별로 SSR/CSR을 선택적으로 적용**
- **성능과 사용자 경험을 모두 최적화**

## 🔴 CSR이 **필수**인 경우

### 1. 브라우저 전용 API 사용

```typescript
'use client'

function GeolocationComponent() {
  const [location, setLocation] = useState(null)
  
  useEffect(() => {
    // 브라우저에서만 사용 가능한 API
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      })
    })
  }, [])
  
  // localStorage, sessionStorage 접근
  const theme = localStorage.getItem('theme')
  
  // window 객체 사용
  const handleResize = () => {
    console.log(window.innerWidth)
  }
}
```

### 2. 실시간 상호작용

```typescript
'use client'

function RealtimeChat() {
  const [messages, setMessages] = useState([])
  
  useEffect(() => {
    // WebSocket 연결 (브라우저에서만 가능)
    const ws = new WebSocket('ws://localhost:8080')
    
    ws.onmessage = (event) => {
      const newMessage = JSON.parse(event.data)
      setMessages(prev => [...prev, newMessage])
    }
    
    // EventSource (Server-Sent Events)
    const eventSource = new EventSource('/api/notifications')
    eventSource.onmessage = (event) => {
      showNotification(JSON.parse(event.data))
    }
    
    return () => {
      ws.close()
      eventSource.close()
    }
  }, [])
}
```

### 3. 복잡한 사용자 입력 처리

```typescript
'use client'

function AdvancedEditor() {
  // 드래그 앤 드롭
  const handleDragOver = (e) => {
    e.preventDefault()
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    // 파일 처리 로직
  }
  
  // 키보드 단축키
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        saveDocument()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // 마우스 이벤트, 터치 이벤트 등
}
```

### 4. 클라이언트 상태 관리

```typescript
'use client'

function StateManagementExample() {
  // React state
  const [count, setCount] = useState(0)
  
  // Zustand 전역 상태
  const { user, setUser } = useAuth()
  
  // 컴포넌트 간 상태 공유
  const { notifications, addNotification } = useNotifications()
  
  // 로컬 캐시 관리
  const { data, isLoading } = useSWR('/api/data', fetcher)
}
```

## 🟢 SSR이 **효율적**인 경우

### 1. 단순 데이터 표시

```typescript
// Server Component (기본값, 'use client' 없음)
export default async function ProductList() {
  // 서버에서 직접 데이터 조회
  const products = await fetch('https://api.example.com/products')
    .then(res => res.json())
  
  // 또는 데이터베이스 직접 접근
  const products = await db.product.findMany()
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 2. 폼 처리 (Server Actions)

```typescript
// Server Action
'use server'
export async function createUser(formData: FormData) {
  const name = formData.get('name')
  const email = formData.get('email')
  
  // 서버에서 직접 DB 처리
  const user = await db.user.create({
    data: { name, email }
  })
  
  revalidatePath('/users')
  return { success: true, user }
}

// Server Component에서 사용
export default function UserForm() {
  return (
    <form action={createUser}>  {/* API Routes 불필요 */}
      <input name="name" required />
      <input name="email" type="email" required />
      <button type="submit">생성</button>
    </form>
  )
}
```

### 3. 인증 상태 확인

```typescript
// layout.tsx - Server Component
import { getServerSession } from '@/lib/auth'

export default async function Layout({ children }) {
  // 서버에서 세션 조회 (쿠키 접근)
  const session = await getServerSession()
  
  return (
    <html>
      <body>
        <Header user={session?.user} />
        <ClientProvider initialUser={session?.user}>
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}
```

## ⚖️ 선택 가능한 경우

| 기능 | SSR 장점 | CSR 장점 | 권장 방식 |
|------|----------|----------|-----------|
| **사용자 프로필** | 초기 로딩 빠름, SEO | 상호작용 풍부 | **SSR → CSR** |
| **데이터 입력 폼** | Server Actions 간편 | 실시간 유효성 검사 | **SSR** |
| **설정 페이지** | 초기값 서버에서 제공 | 즉시 피드백 | **혼합** |
| **대시보드** | SEO (검색 노출) | 실시간 업데이트 | **상황에 따라** |
| **댓글 시스템** | SEO, 초기 로딩 | 실시간 추가/삭제 | **SSR + CSR** |

## 🎯 Next.js 15에서의 구현 패턴

### 1. Server Component → Client Component 데이터 전달

```typescript
// app/layout.tsx (Server Component)
export default async function RootLayout({ children }) {
  // 서버에서 초기 데이터 조회
  const session = await getServerSession()
  const settings = await getGlobalSettings()
  
  return (
    <html>
      <body>
        {/* 클라이언트 컴포넌트에 초기 데이터 전달 */}
        <ClientProvider 
          initialUser={session?.user}
          initialSettings={settings}
        >
          {children}
        </ClientProvider>
      </body>
    </html>
  )
}

// components/ClientProvider.tsx
'use client'
export default function ClientProvider({ 
  children, 
  initialUser, 
  initialSettings 
}) {
  const setUser = useAppStore(state => state.setUser)
  const setSettings = useAppStore(state => state.setSettings)
  
  useEffect(() => {
    // 서버 데이터로 클라이언트 상태 초기화
    if (initialUser) setUser(initialUser)
    if (initialSettings) setSettings(initialSettings)
  }, [initialUser, initialSettings])
  
  return <>{children}</>
}
```

### 2. 하이브리드 폼 패턴

```typescript
// Server Action
'use server'
export async function updateProfile(formData: FormData) {
  const name = formData.get('name')
  const bio = formData.get('bio')
  
  const user = await db.user.update({
    where: { id: getCurrentUserId() },
    data: { name, bio }
  })
  
  revalidatePath('/profile')
  return { success: true, user }
}

// Client Component (실시간 피드백)
'use client'
export default function ProfileForm({ initialUser }) {
  const [state, formAction] = useActionState(updateProfile, { success: false })
  const [name, setName] = useState(initialUser.name)
  
  return (
    <form action={formAction}>
      {/* 실시간 문자 수 카운트 (CSR) */}
      <input 
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <span>{name.length}/50자</span>
      
      {/* 서버 응답 피드백 */}
      {state.success && <div>✅ 저장 완료!</div>}
      {state.error && <div>❌ {state.error}</div>}
      
      <SubmitButton />
    </form>
  )
}
```

### 3. 조건부 렌더링 패턴

```typescript
// app/dashboard/page.tsx
export default async function Dashboard() {
  const session = await getServerSession()
  
  if (!session) {
    // 인증되지 않은 사용자: SSR로 로그인 페이지
    return <LoginForm />
  }
  
  // 인증된 사용자: 클라이언트 컴포넌트로 대시보드
  return (
    <div>
      <ServerSideStats userId={session.user.id} />
      <ClientSideDashboard initialUser={session.user} />
    </div>
  )
}

async function ServerSideStats({ userId }) {
  // 서버에서 통계 데이터 조회 (SEO, 빠른 로딩)
  const stats = await db.getUserStats(userId)
  
  return (
    <div className="stats-grid">
      <StatCard title="총 방문" value={stats.visits} />
      <StatCard title="활성 세션" value={stats.activeSessions} />
    </div>
  )
}

'use client'
function ClientSideDashboard({ initialUser }) {
  // 실시간 업데이트가 필요한 부분만 클라이언트에서
  const [realtimeData, setRealtimeData] = useState(null)
  
  useEffect(() => {
    // WebSocket 연결
    const ws = new WebSocket('/api/realtime')
    ws.onmessage = (event) => {
      setRealtimeData(JSON.parse(event.data))
    }
  }, [])
  
  return (
    <div>
      <RealtimeChart data={realtimeData} />
      <InteractiveFilters />
    </div>
  )
}
```

## 🚀 성능 최적화 패턴

### 1. 선택적 하이드레이션

```typescript
// 중요하지 않은 컴포넌트는 지연 로딩
'use client'
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

export default function Dashboard() {
  return (
    <div>
      {/* 즉시 필요한 컴포넌트 */}
      <QuickStats />
      
      {/* 무거운 컴포넌트는 지연 로딩 */}
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  )
}
```

### 2. 스트리밍 SSR

```typescript
// app/page.tsx
export default function HomePage() {
  return (
    <div>
      {/* 즉시 렌더링 */}
      <Header />
      
      {/* 데이터 로딩 중에도 페이지 표시 */}
      <Suspense fallback={<PostsSkeleton />}>
        <Posts />
      </Suspense>
      
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </div>
  )
}

async function Posts() {
  // 느린 API 호출이어도 다른 부분은 먼저 렌더링됨
  const posts = await fetchPosts() // 3초 소요
  
  return (
    <div>
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
```

## 📊 실무 의사결정 체크리스트

### ✅ SSR을 선택해야 하는 경우

- [ ] SEO가 중요한 페이지인가?
- [ ] 초기 로딩 속도가 중요한가?
- [ ] 단순한 데이터 표시가 주목적인가?
- [ ] 서버에서 민감한 데이터를 처리해야 하는가?
- [ ] API Routes를 만들기 번거로운가?

### ✅ CSR을 선택해야 하는 경우

- [ ] 브라우저 API를 사용해야 하는가?
- [ ] 실시간 업데이트가 필요한가?
- [ ] 복잡한 사용자 상호작용이 있는가?
- [ ] 클라이언트 상태 관리가 복잡한가?
- [ ] SPA 같은 경험이 필요한가?

### ⚖️ 상황별 추천

| 프로젝트 유형 | 추천 전략 | 이유 |
|--------------|-----------|------|
| **블로그/뉴스 사이트** | 주로 SSR | SEO, 빠른 로딩 |
| **관리자 대시보드** | 주로 CSR | 복잡한 상호작용 |
| **전자상거래** | SSR + CSR 혼합 | SEO + 장바구니 UX |
| **소셜 미디어** | SSR + CSR 혼합 | SEO + 실시간 피드 |
| **내부 툴** | 주로 CSR | 개발 속도, SEO 불필요 |

---

이 가이드를 통해 프로젝트의 요구사항에 맞는 최적의 렌더링 전략을 선택하세요. Next.js 15의 App Router는 두 방식을 자유롭게 조합할 수 있어 상황에 맞는 최적화가 가능합니다.
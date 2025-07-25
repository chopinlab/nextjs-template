# 💧 하이드레이션(Hydration) 완전 가이드

하이드레이션은 SSR에서 가장 중요하면서도 까다로운 개념입니다. 서버와 클라이언트 간의 상태 동기화를 이해하고 문제를 해결하는 방법을 정리했습니다.

## 📖 하이드레이션이란?

### 기본 개념

**하이드레이션(Hydration)**은 서버에서 생성된 정적 HTML에 **JavaScript 기능을 연결하는 과정**입니다.

```
🏗️ 서버: HTML 뼈대 생성
    ↓
🌐 브라우저: HTML 수신 (빠른 초기 로딩)
    ↓  
💧 하이드레이션: JavaScript로 생명력 부여
    ↓
✨ 완전한 인터랙티브 앱
```

### SSR + 하이드레이션 과정

```typescript
// 1단계: 서버에서 HTML 생성
export default async function HomePage() {
  const user = await getUser() // 서버에서 데이터 조회
  
  return (
    <div>
      <h1>안녕하세요, {user.name}님!</h1>
      <button onClick={handleClick}>클릭</button> {/* 아직 동작 안함 */}
    </div>
  )
}

// 2단계: 브라우저에서 받은 HTML
<div>
  <h1>안녕하세요, 홍길동님!</h1>
  <button>클릭</button> <!-- 정적 HTML, 클릭 안됨 -->
</div>

// 3단계: 하이드레이션 후
<div>
  <h1>안녕하세요, 홍길동님!</h1>
  <button onClick={handleClick}>클릭</button> <!-- 이제 클릭 가능! -->
</div>
```

## ❌ 하이드레이션 에러가 발생하는 이유

### 핵심 문제: 서버 ≠ 클라이언트

React는 하이드레이션 시 **서버 HTML과 클라이언트 렌더링 결과를 비교**합니다. 다르면 에러가 발생합니다.

```typescript
// ❌ 문제 상황
function ThemeComponent() {
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    // 클라이언트에서만 실행
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved) // 'dark'로 변경
  }, [])
  
  return <div>현재 테마: {theme}</div>
}

// 결과:
// 서버: <div>현재 테마: light</div>
// 클라이언트: <div>현재 테마: dark</div>
// → 하이드레이션 에러!
```

### 일반적인 에러 메시지들

```bash
# React 18+
Warning: Text content did not match. Server: "light" Client: "dark"

# Next.js
Warning: Prop `className` did not match. Server: "theme-light" Client: "theme-dark"

# Zustand + SSR
The result of getServerSnapshot should be cached to avoid an infinite loop
```

## 🛠️ 하이드레이션 에러 해결 패턴

### 1. **Two-Pass Rendering 패턴**

```typescript
'use client'

function SafeThemeComponent() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState('light')
  
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('theme')
    if (saved) setTheme(saved)
  }, [])
  
  // 첫 번째 렌더링: 서버와 동일한 내용
  if (!mounted) {
    return <div>현재 테마: light</div>
  }
  
  // 두 번째 렌더링: 실제 클라이언트 상태
  return <div>현재 테마: {theme}</div>
}
```

### 2. **suppressHydrationWarning 사용**

```typescript
function TimeComponent() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  return (
    <div suppressHydrationWarning>
      {/* 시간은 서버와 클라이언트가 항상 다르므로 경고 억제 */}
      현재 시간: {time.toLocaleTimeString()}
    </div>
  )
}
```

### 3. **useIsomorphicLayoutEffect 패턴**

```typescript
import { useEffect, useLayoutEffect } from 'react'

// SSR에서는 useEffect, 클라이언트에서는 useLayoutEffect
const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect

function ResponsiveComponent() {
  const [width, setWidth] = useState(0)
  
  useIsomorphicLayoutEffect(() => {
    setWidth(window.innerWidth)
    
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return <div>화면 너비: {width}px</div>
}
```

## 🏪 Zustand + SSR 하이드레이션 패턴

### 문제: Zustand Persist + SSR

```typescript
// ❌ 문제가 되는 코드
const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light'
    }),
    { name: 'app-storage' }
  )
)

function App() {
  const theme = useStore(state => state.theme)
  
  // 서버: 'light' (기본값)
  // 클라이언트: 'dark' (localStorage 복원)
  // → 하이드레이션 에러!
  return <div className={`theme-${theme}`}>...</div>
}
```

### 해결책 1: skipHydration + 수동 하이드레이션

```typescript
// ✅ 해결된 코드
const useStore = create(
  persist(
    (set) => ({
      user: null,
      theme: 'light'
    }),
    { 
      name: 'app-storage',
      skipHydration: true // 자동 하이드레이션 비활성화
    }
  )
)

// ClientProvider에서 수동 하이드레이션
'use client'
function ClientProvider({ children }) {
  useEffect(() => {
    // 클라이언트에서만 localStorage 데이터 복원
    useStore.persist.rehydrate()
  }, [])
  
  return <>{children}</>
}
```

### 해결책 2: 개별 셀렉터 사용

```typescript
// ✅ 안전한 훅 패턴
export const useTheme = () => {
  const theme = useStore(state => state.theme)
  const setTheme = useStore(state => state.setTheme)
  
  return { theme, setTheme }
}

// ❌ 피해야 할 패턴
export const useTheme = () => {
  return useStore(state => ({
    theme: state.theme,     // 매번 새로운 객체 생성
    setTheme: state.setTheme // → 무한 루프 발생
  }))
}
```

## 🔍 실무에서 자주 발생하는 케이스들

### 1. **날짜/시간 관련**

```typescript
// ❌ 문제
function ServerTimeComponent() {
  return <div>생성일: {new Date().toLocaleDateString()}</div>
}

// ✅ 해결
function SafeTimeComponent() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return <div>생성일: 로딩 중...</div>
  
  return <div>생성일: {new Date().toLocaleDateString()}</div>
}
```

### 2. **Math.random() 사용**

```typescript
// ❌ 문제
function RandomComponent() {
  const id = Math.random().toString(36)
  return <div id={id}>랜덤 컴포넌트</div>
}

// ✅ 해결
function SafeRandomComponent() {
  const [id, setId] = useState('')
  
  useEffect(() => {
    setId(Math.random().toString(36))
  }, [])
  
  return <div id={id}>랜덤 컴포넌트</div>
}
```

### 3. **브라우저 API 직접 사용**

```typescript
// ❌ 문제
function WindowSizeComponent() {
  const width = window.innerWidth // 서버에서 에러
  return <div>너비: {width}</div>
}

// ✅ 해결
function SafeWindowSizeComponent() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  
  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }
    
    updateSize() // 초기값 설정
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  
  return <div>너비: {size.width}px</div>
}
```

### 4. **외부 라이브러리 (차트, 에디터 등)**

```typescript
// ✅ 동적 임포트 사용
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('./Chart'), {
  ssr: false, // 서버 렌더링 비활성화
  loading: () => <div>차트 로딩 중...</div>
})

function Dashboard() {
  return (
    <div>
      <h1>대시보드</h1>
      <Chart data={data} />
    </div>
  )
}
```

## 🛡️ 하이드레이션 에러 방지 체크리스트

### ✅ 개발 시 확인사항

- [ ] `localStorage`, `sessionStorage` 직접 사용하지 않기
- [ ] `window`, `document` 객체를 서버에서 접근하지 않기  
- [ ] `Math.random()`, `Date.now()` 등 매번 다른 값 반환하는 함수 주의
- [ ] 외부 라이브러리는 `dynamic import` + `ssr: false` 고려
- [ ] 브라우저별 차이가 있는 API 사용 시 주의

### ✅ 디버깅 방법

```typescript
// 1. 개발 모드에서 상세 에러 확인
if (process.env.NODE_ENV === 'development') {
  console.log('서버 상태:', serverValue)
  console.log('클라이언트 상태:', clientValue)
}

// 2. React DevTools Profiler 사용
// Components 탭에서 하이드레이션 에러 확인

// 3. suppressHydrationWarning으로 임시 해결 후 근본 원인 찾기
<div suppressHydrationWarning>
  {/* 임시로 경고 억제 */}
</div>
```

## 📊 성능 최적화

### 하이드레이션 최적화 전략

```typescript
// 1. 선택적 하이드레이션
import { Suspense, lazy } from 'react'

const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <div>
      {/* 중요한 컨텐츠는 즉시 렌더링 */}
      <Header />
      <MainContent />
      
      {/* 무거운 컴포넌트는 지연 로딩 */}
      <Suspense fallback={<div>로딩...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  )
}

// 2. 점진적 하이드레이션
function InteractiveCard({ data }) {
  const [isInteractive, setIsInteractive] = useState(false)
  
  return (
    <div
      onMouseEnter={() => setIsInteractive(true)}
      className={isInteractive ? 'interactive' : 'static'}
    >
      {/* 마우스 호버 시에만 인터랙티브 기능 활성화 */}
      {data.title}
      {isInteractive && <InteractiveButtons />}
    </div>
  )
}
```

## 🔧 이 프로젝트의 하이드레이션 해결 과정

### 문제 상황
```typescript
// Zustand persist + SSR에서 발생한 에러
The result of getServerSnapshot should be cached to avoid an infinite loop
```

### 해결 과정

1. **skipHydration 설정**
```typescript
const useAppStore = create(
  persist(
    // ... 스토어 설정
    {
      name: 'app-storage',
      skipHydration: true // 자동 하이드레이션 비활성화
    }
  )
)
```

2. **수동 하이드레이션**
```typescript
// ClientProvider.tsx
useEffect(() => {
  useAppStore.persist.rehydrate() // 안전한 시점에 복원
}, [])
```

3. **개별 셀렉터 사용**
```typescript
// ✅ 안전한 패턴
export const useUI = () => {
  const theme = useAppStore(state => state.theme)
  const toggleTheme = useAppStore(state => state.toggleTheme)
  
  return { theme, toggleTheme }
}
```

---

이 가이드를 통해 하이드레이션의 개념을 이해하고, 실무에서 발생하는 문제들을 예방하고 해결할 수 있을 것입니다. 하이드레이션은 SSR의 핵심이므로 꼭 숙지하시기 바랍니다!
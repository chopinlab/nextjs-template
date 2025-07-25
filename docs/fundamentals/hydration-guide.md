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

## 🔧 Webpack과 브라우저의 역할 분담

### 하이드레이션 과정에서 누가 뭘 하는가?

```typescript
// 개발자가 작성한 코드
import React, { useState } from 'react'
import { useAppStore } from '@/lib/store'

function MyComponent() {
  const [count, setCount] = useState(0)
  const theme = useAppStore(state => state.theme)
  return <div onClick={() => setCount(c => c + 1)}>{count}</div>
}
```

### **Webpack의 역할** (빌드 시):
```javascript
// 1. 의존성 분석 및 청크 분할
Dependencies found:
├── React → framework-abc123.js (182KB)
├── Zustand → vendor-def456.js (50KB)  
└── MyComponent → page-ghi789.js (5KB)

// 2. 코드 압축 및 최적화
// 3. import 문을 실제 코드 참조로 변환
const useState = __webpack_require__("react").useState
```

### **브라우저의 역할** (런타임):
```javascript
// 1. HTML 먼저 표시 (정적)
<div>0</div> // 클릭 안됨

// 2. JS 청크들 다운로드 & 로딩
framework.js → React.useState 메모리에 적재
page.js → MyComponent 코드 로딩

// 3. 하이드레이션 실행 (React가 담당)  
ReactDOM.hydrateRoot(root, <MyComponent />)
// → 기존 <div>에 onClick 이벤트 연결

// 4. 완성!
<div onClick={...}>0</div> // 이제 클릭 가능!
```

### 빌드 최적화 결과

```
🐌 개발 모드 (npm run dev):
- 코드 압축 없음
- 소스맵 포함  
- Hot Reload 코드 포함
- 총 크기: ~10MB

⚡ 프로덕션 모드 (npm run build):
- Tree Shaking (안 쓰는 코드 제거)
- 코드 압축 & 난독화
- 청크 분할 최적화
- 총 크기: ~106KB (100배 감소!)
```

---

## 🗄️ 브라우저 캐시 vs 사용자 추적

### 캐시: 성능을 위한 파일 저장

```
📂 브라우저 캐시 (도메인별 격리):
├── google.com/cache/
│   ├── search-framework.js
│   └── maps-app.js
├── facebook.com/cache/  
│   ├── social-react.js
│   └── chat-components.js
└── our-site.com/cache/
    ├── framework-abc123.js ← React 라이브러리
    └── page-def456.js ← 우리 페이지 코드

🔒 보안 원칙: 다른 도메인 캐시 접근 불가
```

### 로딩 시간 차이

```
🐌 첫 방문 (네트워크 다운로드):
- React framework: 182KB → 200-500ms
- 페이지 코드: 16KB → 50-100ms

⚡ 재방문 (캐시에서 로딩):  
- React framework: 캐시 → 1-5ms
- 페이지 코드: 캐시 → 1-2ms

결과: 약 100배 속도 향상! 🚀
```

### 추적: 사용자 행동 분석

```javascript
// 🕷️ 크로스 도메인 추적 메커니즘

// 1. A 쇼핑몰에서:
<script src="https://google-analytics.com/analytics.js"></script>
<img src="https://google-analytics.com/collect?user_id=123&page=shoes">
// → google.com 쿠키에 기록: user_id=123, interests=["shoes"]

// 2. B 뉴스사이트에서:  
<script src="https://google-analytics.com/analytics.js"></script>
<img src="https://google-analytics.com/collect?user_id=123&page=tech-news">
// → 동일한 google.com 쿠키 업데이트: interests=["shoes", "tech"]

// 3. C 여행사이트에서:
// → Google: "user_123은 신발, 기술에 관심있음" → 맞춤 광고 노출
```

### 핵심 차이점

| 구분 | 캐시 | 추적 |
|------|------|------|
| **목적** | 성능 최적화 | 사용자 분석 |
| **저장 내용** | JS/CSS 파일 | 행동 패턴 |
| **도메인 접근** | 격리됨 | 연결됨 |
| **사용자 영향** | 빠른 로딩 | 개인정보 수집 |

---

## 🛡️ CORS와 추적 방지의 차이

### CORS의 실제 목적

```javascript
// ❌ CORS가 막는 악성 공격
// evil-site.com에서:
fetch('https://your-bank.com/api/transfer', {
  method: 'POST',
  body: JSON.stringify({ to: 'hacker', amount: 1000000 }),
  credentials: 'include' // 사용자 로그인 쿠키 포함
})
// → CORS 에러로 차단! 🛡️

// ❌ CORS가 막는 데이터 탈취
fetch('https://facebook.com/api/friends')
// → 개인정보 접근 차단!
```

### CORS의 한계

```html
<!-- ✅ 이런 추적은 CORS와 무관하게 허용됨 -->
<img src="https://tracker.com/pixel?user=123&visited=bank-site">
<script src="https://analytics.com/track.js"></script>
<iframe src="https://ads.com/targeting?interests=finance"></iframe>

→ 추적 회사들이 이 허점을 활용! 🕷️
```

### 보안 정책의 진화

```
📅 1990년대: 완전 개방
- 모든 크로스 도메인 요청 허용
- 보안 개념 부족

📅 2000년대: Same-Origin Policy  
- JavaScript AJAX는 동일 출처만
- <script>, <img> 태그는 여전히 허용

📅 2010년대: CORS 도입
- 서버가 명시적으로 허용하면 크로스 도메인 허용
- Access-Control-Allow-Origin 헤더로 제어

📅 2020년대: 추적 방지 강화
- 서드파티 쿠키 차단 (Safari, Firefox, Chrome)
- Tracking Prevention 활성화
- Privacy Sandbox 도입
```

### 다층 보안 체계

```
🛡️ Layer 1: Same-Origin Policy (기본 차단)
🛡️ Layer 2: CORS (선택적 허용)
🛡️ Layer 3: Cookie SameSite (쿠키 제한)  
🛡️ Layer 4: Tracking Prevention (추적 차단)
🛡️ Layer 5: Content Security Policy (스크립트 제한)
```

### 브라우저별 추적 방지

```
🍎 Safari (2017~):
- Intelligent Tracking Prevention (ITP)
- 서드파티 쿠키 7일 후 자동 삭제

🦊 Firefox (2019~):
- Enhanced Tracking Protection  
- 알려진 추적 스크립트 목록 기반 차단

🎯 Chrome (2024~):
- Privacy Sandbox 도입
- 서드파티 쿠키 단계적 폐지
- Topics API (관심사 기반 광고)
```

---

이 가이드를 통해 하이드레이션부터 웹 보안까지, 현대 웹 개발의 핵심 개념들을 종합적으로 이해할 수 있을 것입니다. 이러한 지식은 성능 최적화와 보안을 모두 고려한 웹 애플리케이션 개발에 필수적입니다!
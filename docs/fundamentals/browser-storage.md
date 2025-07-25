# 🗄️ 브라우저 저장소 완전 가이드

프론트엔드 개발에서 데이터를 저장하는 방법은 여러 가지가 있습니다. 각각의 특징과 적절한 사용 사례를 정리했습니다.

## 📊 저장소 종류와 특징

### 1. **쿠키 (Cookies)**

```typescript
// 특징
- 크기: 4KB 제한
- 만료: 설정 가능 (없으면 브라우저 종료 시 삭제)
- 서버 전송: 모든 HTTP 요청에 자동 포함
- 도메인: 설정한 도메인에서만 접근
- JavaScript 접근: httpOnly 설정에 따라 결정

// 클라이언트에서 설정
document.cookie = "name=value; expires=Fri, 31 Dec 2023 23:59:59 GMT; path=/; domain=.example.com"

// Next.js 서버에서 설정 (권장)
import { cookies } from 'next/headers'
cookies().set('token', value, { 
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7 // 7일
})
```

### 2. **로컬스토리지 (localStorage)**

```typescript
// 특징  
- 크기: 5-10MB (브라우저마다 다름)
- 만료: 영구 저장 (사용자가 직접 삭제해야 함)
- 서버 전송: 자동 전송 안됨 (수동으로 fetch에 포함)
- 도메인: 같은 origin에서만 접근
- JavaScript 접근: 항상 가능

// 사용 예시
localStorage.setItem('theme', 'dark')
localStorage.setItem('userPreferences', JSON.stringify(preferences))

const theme = localStorage.getItem('theme')
const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}')

// 삭제
localStorage.removeItem('theme')
localStorage.clear() // 모든 데이터 삭제
```

### 3. **세션스토리지 (sessionStorage)**

```typescript
// 특징
- 크기: 5-10MB  
- 만료: 브라우저 탭 종료 시 삭제
- 서버 전송: 자동 전송 안됨
- 도메인: 같은 origin에서만 접근
- JavaScript 접근: 항상 가능

// 사용 예시 (localStorage와 API 동일)
sessionStorage.setItem('temp-data', 'value')
sessionStorage.setItem('currentStep', '3')

const tempData = sessionStorage.getItem('temp-data')
```

## 📋 저장소 비교표

| 특징 | 쿠키 | localStorage | sessionStorage |
|------|------|--------------|----------------|
| **크기** | 4KB | 5-10MB | 5-10MB |
| **만료** | 설정 가능 | 영구 | 탭 종료 시 |
| **서버 전송** | ✅ 자동 | ❌ 수동 | ❌ 수동 |
| **JavaScript 접근** | 설정에 따라 | ✅ 항상 | ✅ 항상 |
| **탭 간 공유** | ✅ 공유 | ✅ 공유 | ❌ 독립 |
| **보안** | httpOnly 설정 가능 | XSS 취약 | XSS 취약 |
| **브라우저 지원** | 모든 브라우저 | IE8+ | IE8+ |

## 🔒 httpOnly 쿠키 심화

### httpOnly 이름의 혼란

```typescript
// ❌ 잘못된 해석 (이름만 보면)
httpOnly: true  // "HTTP에서만 동작, HTTPS 안됨?"

// ✅ 실제 의미
httpOnly: true  // "HTTP 요청으로만 전송, JavaScript 접근 차단"
```

### 네이밍 유래 (역사적 배경)

- **1994년**: 넷스케이프가 쿠키 발명
- **1990년대 말**: XSS 공격 등장으로 보안 문제 대두
- **2002년**: Microsoft가 IE6에서 httpOnly 도입
- **개발자 의도**: "HTTP 통신을 통해서만 접근하고, 클라이언트 스크립트는 차단"

### httpOnly 동작 방식

```typescript
// 서버에서 httpOnly 쿠키 설정
cookies().set('secure-token', token, { httpOnly: true })

// 클라이언트에서 접근 시도
console.log(document.cookie) // secure-token 안 보임!

// 하지만 HTTP 요청에는 자동으로 포함됨
fetch('/api/data') // 쿠키가 자동으로 서버에 전송됨
```

## 🎯 실무 사용 패턴

### 🔐 보안이 중요한 데이터

```typescript
// JWT 토큰, 세션 ID → httpOnly 쿠키 (가장 안전)
cookies().set('jwt-token', token, { 
  httpOnly: true,    // JavaScript 접근 차단
  secure: true,      // HTTPS만 허용  
  sameSite: 'lax',   // CSRF 공격 방어
  maxAge: 60 * 60 * 24 * 7 // 7일
})

// API 키는 절대 클라이언트에 저장하지 않음
// 서버 환경변수나 서버 세션에만 보관
```

### ⚙️ 사용자 설정/캐시

```typescript
// 테마, 언어, UI 설정 → localStorage (영구 저장)
const saveUserSettings = (settings) => {
  localStorage.setItem('userSettings', JSON.stringify({
    theme: settings.theme,
    language: settings.language,
    sidebarCollapsed: settings.sidebarCollapsed,
    notificationsEnabled: settings.notifications
  }))
}

// 페이지 로드 시 설정 복원
const loadUserSettings = () => {
  const saved = localStorage.getItem('userSettings')
  return saved ? JSON.parse(saved) : defaultSettings
}
```

### 📝 임시/세션 데이터

```typescript
// 폼 임시 저장, 탭별 상태 → sessionStorage
const saveDraftContent = (content) => {
  sessionStorage.setItem('draft-content', content)
  sessionStorage.setItem('lastSaved', new Date().toISOString())
}

// 현재 페이지 상태 (탭별로 독립)
sessionStorage.setItem('currentStep', '3')
sessionStorage.setItem('wizardData', JSON.stringify(wizardState))
```

### 🍪 추적/분석 데이터

```typescript
// 광고 추적, 분석 → 일반 쿠키 (서드파티 접근 필요)
document.cookie = "analytics_id=abc123; path=/; domain=.example.com; expires=" + 
  new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString()

// 사용자 행동 분석
document.cookie = "visitor_id=12345; path=/; expires=" + 
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()
```

## 🛡️ 보안 관점에서의 선택

| 데이터 종류 | 추천 저장소 | 이유 | 설정 예시 |
|-------------|-------------|------|-----------|
| **JWT 토큰** | httpOnly 쿠키 | XSS 공격 차단 | `{ httpOnly: true, secure: true }` |
| **API 키** | 서버 환경변수 | 클라이언트 노출 방지 | `process.env.API_KEY` |
| **사용자 설정** | localStorage | 영구 저장, 편의성 | `localStorage.setItem('theme', 'dark')` |
| **임시 상태** | sessionStorage | 탭 종료 시 자동 삭제 | `sessionStorage.setItem('step', '2')` |
| **캐시 데이터** | localStorage | 성능 향상 | `localStorage.setItem('cache-key', data)` |

## ⚠️ 주의사항과 베스트 프랙티스

### 1. **XSS 공격 방어**

```typescript
// ❌ 위험: localStorage에 민감한 데이터
localStorage.setItem('jwt-token', token) // XSS로 쉽게 탈취됨

// ✅ 안전: httpOnly 쿠키 사용
cookies().set('jwt-token', token, { httpOnly: true })
```

### 2. **용량 제한 대응**

```typescript
// localStorage 용량 체크
const checkStorageSpace = () => {
  try {
    const testKey = 'storage-test'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    console.warn('localStorage가 가득 참:', e)
    return false
  }
}

// 큰 데이터는 압축 후 저장
import { compress, decompress } from 'lz-string'

const saveLargeData = (key, data) => {
  const compressed = compress(JSON.stringify(data))
  localStorage.setItem(key, compressed)
}
```

### 3. **브라우저 호환성**

```typescript
// localStorage 지원 체크
const isLocalStorageSupported = () => {
  try {
    return 'localStorage' in window && window.localStorage !== null
  } catch (e) {
    return false
  }
}

// 폴백 처리
const storage = {
  setItem: (key, value) => {
    if (isLocalStorageSupported()) {
      localStorage.setItem(key, value)
    } else {
      // 쿠키로 폴백
      document.cookie = `${key}=${value}; path=/`
    }
  }
}
```

## 🔍 디버깅과 개발 도구

### Chrome DevTools에서 확인

```bash
# Application 탭 → Storage 섹션에서 확인 가능
- Cookies: 도메인별 쿠키 목록
- Local Storage: origin별 localStorage 데이터
- Session Storage: origin별 sessionStorage 데이터
```

### 프로그래밍 방식으로 확인

```typescript
// 모든 저장소 상태 확인
const getStorageInfo = () => {
  return {
    cookies: document.cookie,
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
    storageUsage: {
      localStorage: JSON.stringify(localStorage).length,
      sessionStorage: JSON.stringify(sessionStorage).length
    }
  }
}

console.log(getStorageInfo())
```

---

이 가이드를 통해 각 저장소의 특징을 이해하고, 상황에 맞는 최적의 선택을 할 수 있을 것입니다. 보안이 중요한 데이터는 반드시 httpOnly 쿠키를 사용하고, 사용자 편의성 데이터는 localStorage를 활용하세요.
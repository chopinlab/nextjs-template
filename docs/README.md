# 📚 학습 문서 가이드

이 폴더는 Next.js, React, 웹 개발과 관련된 **학습 자료와 심화 가이드**를 모아둔 곳입니다.

## 📁 문서 구조

```
docs/
├── README.md                    # 이 파일 (문서 목차)
├── fundamentals/                # 기초 개념
│   ├── csr-vs-ssr.md           # CSR vs SSR 완전 가이드
│   ├── browser-storage.md       # 브라우저 저장소 비교
│   ├── hydration-guide.md       # 하이드레이션 + 웹팩 + 브라우저 캐시 + CORS 종합 가이드
│   └── authentication.md        # 인증 시스템 패턴
├── nextjs/                      # Next.js 관련
│   ├── server-actions.md        # Server Actions 패턴
│   ├── app-router.md           # App Router 사용법
│   └── deployment.md           # 배포 전략
├── react/                       # React 관련
│   ├── state-management.md      # 상태 관리 (Zustand, Redux 등)
│   ├── hooks-patterns.md        # 커스텀 훅 패턴
│   └── performance.md          # 성능 최적화
└── security/                    # 보안 관련
    ├── xss-prevention.md        # XSS 공격 방어
    ├── csrf-protection.md       # CSRF 공격 방어
    └── token-security.md        # 토큰 보안
```

## 🎯 학습 순서 (추천)

### 1. **기초 개념 (Fundamentals)**
1. [CSR vs SSR 가이드](./fundamentals/csr-vs-ssr.md) - 렌더링 방식의 차이점과 선택 기준
2. [브라우저 저장소](./fundamentals/browser-storage.md) - 쿠키, localStorage, sessionStorage 완전 정리
3. [하이드레이션 종합 가이드](./fundamentals/hydration-guide.md) - 하이드레이션 + Webpack + 브라우저 캐시 + CORS 완전 이해
4. [인증 시스템](./fundamentals/authentication.md) - JWT, 세션, httpOnly 쿠키

### 2. **Next.js 심화**
1. [Server Actions](./nextjs/server-actions.md) - API Routes 없이 서버 로직 처리
2. [App Router](./nextjs/app-router.md) - 최신 Next.js 라우팅 시스템
3. [배포 전략](./nextjs/deployment.md) - Vercel, Docker, 자체 서버

### 3. **React 패턴**
1. [상태 관리](./react/state-management.md) - Zustand, Redux, Context API
2. [훅 패턴](./react/hooks-patterns.md) - 재사용 가능한 커스텀 훅
3. [성능 최적화](./react/performance.md) - 메모이제이션, 코드 스플리팅

### 4. **보안 (중급 이상)**
1. [XSS 방어](./security/xss-prevention.md) - 스크립트 주입 공격 차단
2. [CSRF 보호](./security/csrf-protection.md) - 사이트 간 요청 위조 방어
3. [토큰 보안](./security/token-security.md) - JWT, 쿠키 보안 설정

## 💡 문서 사용법

### 학습 목적별 가이드

| 목적 | 추천 문서 | 난이도 |
|------|-----------|--------|
| **프론트엔드 입문** | CSR vs SSR → 브라우저 저장소 | 초급 |
| **Next.js 마스터** | Server Actions → App Router → 배포 | 중급 |
| **상태 관리 고민** | 상태 관리 → 훅 패턴 | 중급 |
| **보안 강화** | 인증 → XSS 방어 → 토큰 보안 | 고급 |

### 실습 프로젝트 연결

각 문서의 예제 코드는 **이 템플릿 프로젝트**에서 실제로 확인할 수 있습니다:

- `src/app/components/` - React 컴포넌트 패턴
- `src/app/actions/` - Server Actions 예제
- `src/lib/store.ts` - Zustand 상태 관리
- `src/lib/auth.ts` - 인증 시스템

## 🔗 외부 참고 자료

### 공식 문서
- [Next.js 공식 문서](https://nextjs.org/docs)
- [React 공식 문서](https://react.dev)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs)

### 추천 블로그/유튜브
- [Vercel 블로그](https://vercel.com/blog) - Next.js 최신 소식
- [React 개발자 도구](https://react.dev/learn/react-developer-tools)
- [웹 보안 가이드](https://web.dev/security/)

---

**이 문서들은 실무에서 바로 사용할 수 있는 패턴과 베스트 프랙티스를 담고 있습니다.**
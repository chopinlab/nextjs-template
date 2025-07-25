# Next.js 15 Fullstack Template

Server Actions 중심의 Next.js 15 풀스택 템플릿입니다.

## 🚀 기술 스택

- **Framework**: Next.js 15.4.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS  
- **Database**: TimescaleDB
- **ORM**: Prisma
- **Architecture**: Server Actions 중심

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
│   ├── actions/          # Server Actions
│   ├── components/       # React 컴포넌트
│   └── page.tsx         # 메인 페이지
├── lib/
│   └── db.ts            # Prisma 클라이언트
└── types/
    └── actions.ts       # 공통 타입
```

## ⚡ 핵심 기능

### Server Actions 패턴
```typescript
'use server'
export async function createData(
  prevState: ActionState, 
  formData: FormData
): Promise<ActionState> {
  try {
    // 비즈니스 로직
    revalidatePath('/')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: 'Error message' }
  }
}
```

### 폼 컴포넌트 패턴
```typescript
'use client'
const [state, formAction] = useFormState(serverAction, initialState)

return (
  <form action={formAction}>
    {/* 폼 필드 */}
    <SubmitButton />
  </form>
)
```

## 🗄️ 데이터베이스 환경

### TimescaleDB (Docker)
시계열 데이터 최적화된 PostgreSQL

```bash
# 1. 컨테이너 시작
docker-compose up -d

# 2. 마이그레이션
npx prisma migrate dev --name init

# 3. 하이퍼테이블 변환
docker exec nextjs-template-timescaledb-1 psql -U admin -d nextjs_dev -c "SELECT create_hypertables_manual();"
```

## 🛠️ 개발 명령어

### 기본 명령어
```bash
npm run dev      # 개발 서버
npm run build    # 빌드
npm run lint     # 린트 검사
```

### Prisma 명령어
```bash
npx prisma generate                    # 클라이언트 생성
npx prisma migrate dev --name <name>   # 마이그레이션
npx prisma studio                      # DB GUI
```

### Docker 명령어
```bash
docker-compose up -d      # 서비스 시작
docker-compose down       # 서비스 중지
docker-compose logs       # 로그 확인
```

### NPM 패키지 정보 조회
```bash
npm view <패키지명>           # 패키지 전체 정보 확인
npm view <패키지명> version   # 최신 버전 확인
npm view <패키지명> versions  # 모든 버전 리스트
npm view <패키지명> homepage  # 홈페이지 URL
npm view <패키지명> dependencies  # 의존성 목록
```

#### VS Code에서 빠르게 사용하기
1. `package.json`에서 패키지명 선택 (더블클릭으로 단어 선택)
2. `Cmd+Shift+P` → "Terminal: Run Selected Text in Active Terminal" 실행
3. 터미널에 `npm view ` 입력 후 `Cmd+V`로 패키지명 붙여넣기

또는 VS Code 확장:
- **NPM Intellisense**: package.json에서 패키지 정보 툴팁으로 바로 확인

## 💡 디버깅

### Server Actions (터미널)
```typescript
'use server'
export async function action() {
  console.log('📊 서버 로그')  // 터미널에서 확인
}
```

### Client Components (브라우저)
```typescript  
'use client'
export default function Component() {
  console.log('🖥️ 브라우저 로그')  // DevTools Console에서 확인
}
```

## 📊 현재 구현된 데모

- **시계열 데이터 폼**: 메트릭, 값, 태그 입력
- **센서 데이터 폼**: 온도, 습도, 압력 데이터
- **실시간 UI 피드백**: 로딩/성공/에러 상태
- **타입 안전성**: 완전한 TypeScript 지원

---

이 템플릿은 현대적인 Next.js 풀스택 개발 패턴을 보여주는 완성된 예제입니다.
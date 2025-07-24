# Next.js Template

TypeScript와 Tailwind CSS가 설정된 Next.js 템플릿 프로젝트입니다.

## 기술 스택

- **Framework**: Next.js 15.4.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm

## 시작하기

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 프로덕션 서버 실행

```bash
npm start
```

### 린트 실행

```bash
npm run lint
```

## 프로젝트 구조

```
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── .gitignore
├── next.config.js
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 설정된 기능

- ES Modules 지원 (package.json의 type: "module")
- TypeScript 설정
- Tailwind CSS 설정
- ESLint 설정
- 적절한 .gitignore 설정 (.next, node_modules 등 제외)
- **Prisma ORM** - TimescaleDB 연동 설정
- **TimescaleDB** - 시계열 데이터베이스 지원

## 데이터베이스 설정

### 1. 환경 변수 설정

`.env` 파일을 생성하고 TimescaleDB 연결 정보를 입력하세요:

```bash
cp .env.example .env
```

`.env` 파일에서 `DATABASE_URL`을 수정하세요:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/timescale_db"
```

### 2. Prisma 클라이언트 생성

```bash
npx prisma generate
```

### 3. 데이터베이스 마이그레이션

```bash
npx prisma migrate dev --name init
```

### 4. TimescaleDB 하이퍼테이블 초기화

애플리케이션 시작 시 자동으로 하이퍼테이블이 생성됩니다. 수동으로 초기화하려면:

```typescript
import { initializeTimescaleDB } from '@/lib/db'

await initializeTimescaleDB()
```

## 데이터베이스 모델

- **TimeSeriesData**: 일반적인 시계열 데이터
- **User**: 사용자 정보
- **SensorData**: 센서 데이터 (온도, 습도, 압력 등)

## TimescaleDB 쿼리 예시

```typescript
import { timeSeriesQueries } from '@/lib/db'

// 시간 범위 내 데이터 조회
const data = await timeSeriesQueries.getDataInRange(
  'temperature', 
  new Date('2024-01-01'), 
  new Date('2024-01-02')
)

// 시간 버킷으로 집계된 데이터
const aggregated = await timeSeriesQueries.getAggregatedData(
  'temperature',
  '1 hour',
  new Date('2024-01-01'),
  new Date('2024-01-02')
)
```

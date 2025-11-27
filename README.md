# Zerocraft Backend API

AI 사업계획서 생성 플랫폼 **Zerocraft**의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js + TypeScript
- **Database**: MySQL + Prisma ORM
- **Authentication**: Google OAuth 2.0 + JWT
- **Document Generation**: docx

## 프로젝트 구조

```
src/
├── app.ts                 # 메인 애플리케이션
├── types/                 # TypeScript 타입 정의
│   ├── index.ts
│   └── express.d.ts
├── utils/                 # 유틸리티 함수
│   ├── prisma.ts          # Prisma 클라이언트
│   ├── jwt.ts             # JWT 유틸리티
│   └── pagination.ts      # 페이지네이션
├── middlewares/           # 미들웨어
│   ├── auth.middleware.ts # 인증 미들웨어
│   ├── error.middleware.ts# 에러 핸들러
│   └── validation.middleware.ts
└── routes/                # API 라우트
    ├── auth.routes.ts     # 인증 API
    ├── credits.routes.ts  # 이용권 API
    ├── payments.routes.ts # 결제 API
    ├── businessPlans.routes.ts # 사업계획서 API
    ├── favorites.routes.ts # 찜 API
    ├── grants.routes.ts   # 지원사업 API
    └── mypage.routes.ts   # 마이페이지 API
```

## 시작하기

### 1. 필수 조건

- Node.js 18+
- MySQL 8.0+
- Google Cloud Console 프로젝트 (OAuth 설정)

### 2. 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값 입력
```

### 3. 환경변수 설정

`.env` 파일에 다음 값들을 설정합니다:

```env
# 서버 설정
PORT=3001
NODE_ENV=development

# 데이터베이스 설정
DATABASE_URL="mysql://username:password@localhost:3306/zerocraft"

# JWT 설정
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Google OAuth 설정
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000
```

### 4. 데이터베이스 설정

```bash
# MySQL 데이터베이스 생성
mysql -u root -p -e "CREATE DATABASE zerocraft;"

# Prisma 마이그레이션 실행
npx prisma migrate dev --name init

# (선택) 테스트 데이터 시드
npx ts-node prisma/seed.ts
```

### 5. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## API 엔드포인트

### 인증 (Auth)

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/auth/google`          | Google 로그인 URL 요청 |
| GET    | `/api/auth/google/callback` | Google OAuth 콜백      |
| POST   | `/api/auth/logout`          | 로그아웃               |
| GET    | `/api/auth/me`              | 내 정보 조회           |

### 이용권/결제 (Credits/Payments)

| Method | Endpoint                    | Description      |
| ------ | --------------------------- | ---------------- |
| GET    | `/api/credits`              | 이용권 잔액 조회 |
| GET    | `/api/credits/history`      | 이용권 사용 내역 |
| POST   | `/api/credits/use`          | 이용권 사용      |
| POST   | `/api/payments`             | 결제 요청        |
| POST   | `/api/payments/:id/confirm` | 결제 확인        |
| GET    | `/api/payments`             | 결제 내역 조회   |

### 사업계획서 (Business Plans)

| Method | Endpoint                           | Description   |
| ------ | ---------------------------------- | ------------- |
| GET    | `/api/business-plans`              | 목록 조회     |
| GET    | `/api/business-plans/:id`          | 상세 조회     |
| POST   | `/api/business-plans`              | 생성          |
| PUT    | `/api/business-plans/:id`          | 수정          |
| DELETE | `/api/business-plans/:id`          | 삭제          |
| GET    | `/api/business-plans/:id/download` | DOCX 다운로드 |

### 찜한 지원사업 (Favorites)

| Method | Endpoint                               | Description  |
| ------ | -------------------------------------- | ------------ |
| GET    | `/api/favorites/grants`                | 찜 목록 조회 |
| POST   | `/api/favorites/grants`                | 찜 추가      |
| DELETE | `/api/favorites/grants/:grantId`       | 찜 해제      |
| GET    | `/api/favorites/grants/:grantId/check` | 찜 여부 확인 |

### 지원사업 (Grants)

| Method | Endpoint          | Description |
| ------ | ----------------- | ----------- |
| GET    | `/api/grants`     | 목록 조회   |
| GET    | `/api/grants/:id` | 상세 조회   |

### 마이페이지 (MyPage)

| Method | Endpoint      | Description      |
| ------ | ------------- | ---------------- |
| GET    | `/api/mypage` | 통합 데이터 조회 |

## 인증

모든 인증이 필요한 API는 HTTP 헤더에 Bearer Token을 포함해야 합니다:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 개발 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # TypeScript 컴파일
npm start            # 프로덕션 서버 실행
npm run prisma:generate  # Prisma Client 생성
npm run prisma:migrate   # 마이그레이션 실행
npm run prisma:push      # 스키마 푸시 (개발용)
```

## 라이선스

ISC

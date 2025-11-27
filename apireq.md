# API 명세서

## 1. 인증 (Auth) - Google OAuth 2.0

### 1.1 Google 로그인 URL 요청

- **URL**: `/api/auth/google`
- **Method**: `GET`
- **Description**: Google OAuth 인증 페이지로 리다이렉트할 URL을 반환합니다.
- **Response (200 OK)**:
  ```json
  {
    "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=email%20profile"
  }
  ```

### 1.2 Google OAuth 콜백

- **URL**: `/api/auth/google/callback`
- **Method**: `GET`
- **Description**: Google OAuth 인증 후 콜백을 처리하고 JWT 토큰을 발급합니다.
- **Query Parameters**:
  - `code`: Google에서 전달받은 인증 코드
  - `state`: CSRF 방지용 상태 값
- **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4",
      "email": "user@gmail.com",
      "name": "홍길동",
      "profileImage": "https://lh3.googleusercontent.com/...",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "message": "Google 인증에 실패했습니다."
  }
  ```

### 1.3 로그아웃

- **URL**: `/api/auth/logout`
- **Method**: `POST`
- **Description**: 서버 측에서 세션을 종료하거나 쿠키를 삭제합니다.
- **Response (200 OK)**:
  ```json
  {
    "message": "로그아웃 되었습니다."
  }
  ```

### 1.4 내 정보 조회

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Description**: 현재 로그인한 사용자의 정보를 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-v4",
    "email": "user@example.com",
    "name": "홍길동",
    "profileImage": "https://lh3.googleusercontent.com/...",
    "credits": 2,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "message": "인증되지 않은 사용자입니다."
  }
  ```

---

## 2. 이용권/결제 (Credits/Payments)

### 2.1 이용권 잔액 조회

- **URL**: `/api/credits`
- **Method**: `GET`
- **Description**: 현재 사용자의 이용권 잔액을 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "credits": 2,
    "usedCredits": 5,
    "totalPurchased": 7
  }
  ```

### 2.2 결제 요청

- **URL**: `/api/payments`
- **Method**: `POST`
- **Description**: 이용권 구매를 위한 결제를 요청합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "productId": "credit-1",
    "paymentMethod": "card",
    "amount": 29900
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "paymentId": "uuid-v4",
    "orderId": "ORDER-2024-001",
    "amount": 29900,
    "status": "pending",
    "paymentUrl": "https://payment-gateway.com/pay/..."
  }
  ```

### 2.3 결제 확인/완료

- **URL**: `/api/payments/:paymentId/confirm`
- **Method**: `POST`
- **Description**: 결제 완료를 확인하고 이용권을 지급합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Path Parameters**:
  - `paymentId`: 결제 ID
- **Response (200 OK)**:
  ```json
  {
    "paymentId": "uuid-v4",
    "status": "completed",
    "creditsAdded": 1,
    "currentCredits": 3,
    "message": "결제가 완료되었습니다. 이용권 1회가 지급되었습니다."
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "message": "결제 처리에 실패했습니다."
  }
  ```

### 2.4 결제 내역 조회

- **URL**: `/api/payments`
- **Method**: `GET`
- **Description**: 사용자의 결제 내역을 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Query Parameters**:
  - `page` (optional): 페이지 번호 (기본값: 1)
  - `limit` (optional): 페이지당 항목 수 (기본값: 10)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-v4",
        "orderId": "ORDER-2024-001",
        "productName": "AI 사업계획서 이용권 1회",
        "amount": 29900,
        "creditsAdded": 1,
        "status": "completed",
        "paymentMethod": "card",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
  ```

### 2.5 이용권 사용 내역 조회

- **URL**: `/api/credits/history`
- **Method**: `GET`
- **Description**: 이용권 사용 내역을 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-v4",
        "type": "use",
        "amount": -1,
        "description": "사업계획서 생성",
        "businessPlanId": "uuid-v4",
        "businessPlanTitle": "AI 기반 물류 최적화 플랫폼 사업계획서",
        "createdAt": "2024-01-20T00:00:00Z"
      },
      {
        "id": "uuid-v4",
        "type": "purchase",
        "amount": 1,
        "description": "이용권 구매",
        "paymentId": "uuid-v4",
        "createdAt": "2024-01-15T00:00:00Z"
      }
    ]
  }
  ```

### 2.6 이용권 사용 (차감)

- **URL**: `/api/credits/use`
- **Method**: `POST`
- **Description**: 사업계획서 생성 시 이용권 1회를 차감합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "description": "사업계획서 생성"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "remainingCredits": 2,
    "message": "이용권이 사용되었습니다."
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "message": "이용권이 부족합니다."
  }
  ```

---

## 3. 사업계획서 (Business Plans)

### 3.1 내 사업계획서 목록 조회

- **URL**: `/api/business-plans`
- **Method**: `GET`
- **Description**: 로그인한 사용자의 사업계획서 목록을 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Query Parameters**:
  - `page` (optional): 페이지 번호 (기본값: 1)
  - `limit` (optional): 페이지당 항목 수 (기본값: 10)
  - `status` (optional): 상태 필터 (`draft`, `completed`)
  - `sort` (optional): 정렬 기준 (`createdAt`, `updatedAt`, 기본값: `updatedAt`)
  - `order` (optional): 정렬 순서 (`asc`, `desc`, 기본값: `desc`)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-v4",
        "title": "AI 기반 물류 최적화 플랫폼 사업계획서",
        "grantId": "uuid-v4",
        "grantTitle": "2025년 창업성장기술개발사업 디딤돌 창업과제",
        "status": "completed",
        "createdAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-20T00:00:00Z"
      },
      {
        "id": "uuid-v4",
        "title": "스마트 헬스케어 모니터링 시스템",
        "grantId": "uuid-v4",
        "grantTitle": "혁신창업사업화자금",
        "status": "draft",
        "createdAt": "2024-01-10T00:00:00Z",
        "updatedAt": "2024-01-18T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "message": "인증되지 않은 사용자입니다."
  }
  ```

### 3.2 사업계획서 상세 조회

- **URL**: `/api/business-plans/:id`
- **Method**: `GET`
- **Description**: 특정 사업계획서의 상세 정보를 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Path Parameters**:
  - `id`: 사업계획서 ID
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-v4",
    "title": "AI 기반 물류 최적화 플랫폼 사업계획서",
    "grantId": "uuid-v4",
    "grantTitle": "2025년 창업성장기술개발사업 디딤돌 창업과제",
    "content": {
      "sections": [
        {
          "id": "section-1",
          "title": "사업 개요",
          "content": "..."
        }
      ]
    },
    "status": "completed",
    "userId": "uuid-v4",
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "message": "사업계획서를 찾을 수 없습니다."
  }
  ```
- **Response (403 Forbidden)**:
  ```json
  {
    "message": "이 사업계획서에 접근할 권한이 없습니다."
  }
  ```

### 3.3 사업계획서 생성

- **URL**: `/api/business-plans`
- **Method**: `POST`
- **Description**: 새로운 사업계획서를 생성합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "title": "AI 기반 물류 최적화 플랫폼 사업계획서",
    "grantId": "uuid-v4",
    "content": {
      "sections": []
    },
    "data": {}
  }
  ```
  - `title` (required): 사업계획서 제목
  - `grantId` (optional): 연결된 지원사업 ID
  - `content` (optional): 섹션 기반 콘텐츠 구조
  - `data` (optional): AI 생성 사업계획서 전체 데이터 (프론트엔드 Wizard 결과물)
- **Response (201 Created)**:
  ```json
  {
    "id": "uuid-v4",
    "title": "AI 기반 물류 최적화 플랫폼 사업계획서",
    "grantId": "uuid-v4",
    "grantTitle": "2025년 창업성장기술개발사업 디딤돌 창업과제",
    "content": {
      "sections": []
    },
    "status": "draft",
    "userId": "uuid-v4",
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "message": "제목은 필수 항목입니다."
  }
  ```

### 3.4 사업계획서 다운로드

- **URL**: `/api/business-plans/:id/download`
- **Method**: `GET`
- **Description**: 사업계획서를 DOCX 파일로 다운로드합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Path Parameters**:
  - `id`: 사업계획서 ID
- **Query Parameters**:
  - `format` (optional): 다운로드 형식 (`docx`, `pdf`, 기본값: `docx`)
- **Response (200 OK)**:
  - Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (DOCX) 또는 `application/pdf` (PDF)
  - Content-Disposition: `attachment; filename="사업계획서_제목.docx"`
  - Body: 파일 바이너리 데이터
- **Response (404 Not Found)**:
  ```json
  {
    "message": "사업계획서를 찾을 수 없습니다."
  }
  ```

---

## 4. 찔한 지원사업 (Favorite Grants)

### 4.1 찜한 지원사업 목록 조회

- **URL**: `/api/favorites/grants`
- **Method**: `GET`
- **Description**: 로그인한 사용자가 찜한 지원사업 목록을 조회합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Query Parameters**:
  - `page` (optional): 페이지 번호 (기본값: 1)
  - `limit` (optional): 페이지당 항목 수 (기본값: 10)
  - `sort` (optional): 정렬 기준 (`deadline`, `createdAt`, 기본값: `createdAt`)
  - `order` (optional): 정렬 순서 (`asc`, `desc`, 기본값: `desc`)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-v4",
        "grantId": "uuid-v4",
        "grant": {
          "id": "uuid-v4",
          "title": "2025년 창업성장기술개발사업 디딤돌 창업과제",
          "organization": "중소벤처기업부",
          "deadline": "2025-02-15",
          "amount": "최대 1억원",
          "category": "창업지원",
          "status": "open"
        },
        "createdAt": "2024-01-10T00:00:00Z"
      },
      {
        "id": "uuid-v4",
        "grantId": "uuid-v4",
        "grant": {
          "id": "uuid-v4",
          "title": "혁신창업사업화자금 (융자)",
          "organization": "중소벤처기업진흥공단",
          "deadline": "2025-01-31",
          "amount": "최대 1억원",
          "category": "금융지원",
          "status": "open"
        },
        "createdAt": "2024-01-08T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "totalPages": 1
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "message": "인증되지 않은 사용자입니다."
  }
  ```

### 4.2 지원사업 찜하기

- **URL**: `/api/favorites/grants`
- **Method**: `POST`
- **Description**: 지원사업을 찜 목록에 추가합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "grantId": "uuid-v4"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "id": "uuid-v4",
    "grantId": "uuid-v4",
    "userId": "uuid-v4",
    "createdAt": "2024-01-10T00:00:00Z"
  }
  ```
- **Response (409 Conflict)**:
  ```json
  {
    "message": "이미 찜한 지원사업입니다."
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "message": "지원사업을 찾을 수 없습니다."
  }
  ```

### 4.3 지원사업 찜 해제

- **URL**: `/api/favorites/grants/:grantId`
- **Method**: `DELETE`
- **Description**: 지원사업을 찜 목록에서 제거합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Path Parameters**:
  - `grantId`: 지원사업 ID
- **Response (200 OK)**:
  ```json
  {
    "message": "찜이 해제되었습니다."
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "message": "찜한 지원사업을 찾을 수 없습니다."
  }
  ```

### 4.4 지원사업 찜 여부 확인

- **URL**: `/api/favorites/grants/:grantId/check`
- **Method**: `GET`
- **Description**: 특정 지원사업의 찜 여부를 확인합니다.
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Path Parameters**:
  - `grantId`: 지원사업 ID
- **Response (200 OK)**:
  ```json
  {
    "isFavorite": true
  }
  ```

---

## 5. 지원사업 (Grants)

### 5.1 지원사업 목록 조회

- **URL**: `/api/grants`
- **Method**: `GET`
- **Description**: 전체 지원사업 목록을 조회합니다. (로그인 불필요)
- **Query Parameters**:
  - `page` (optional): 페이지 번호 (기본값: 1)
  - `limit` (optional): 페이지당 항목 수 (기본값: 10)
  - `category` (optional): 카테고리 필터 (`창업지원`, `금융지원`, `R&D` 등)
  - `status` (optional): 상태 필터 (`open`, `closed`)
  - `search` (optional): 검색어 (제목, 기관명 검색)
  - `sort` (optional): 정렬 기준 (`deadline`, `createdAt`, 기본값: `deadline`)
  - `order` (optional): 정렬 순서 (`asc`, `desc`, 기본값: `asc`)
- **Response (200 OK)**:
  ```json
  {
    "data": [
      {
        "id": "uuid-v4",
        "title": "2025년 창업성장기술개발사업 디딤돌 창업과제",
        "description": "창업 초기 기업의 기술개발을 지원합니다.",
        "organization": "중소벤처기업부",
        "deadline": "2025-02-15",
        "amount": "최대 1억원",
        "category": "창업지원",
        "status": "open",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
  ```

### 5.2 지원사업 상세 조회

- **URL**: `/api/grants/:id`
- **Method**: `GET`
- **Description**: 특정 지원사업의 상세 정보를 조회합니다.
- **Path Parameters**:
  - `id`: 지원사업 ID
- **Response (200 OK)**:
  ```json
  {
    "id": "uuid-v4",
    "title": "2025년 창업성장기술개발사업 디딤돌 창업과제",
    "description": "창업 초기 기업의 기술개발을 지원합니다.",
    "organization": "중소벤처기업부",
    "deadline": "2025-02-15",
    "amount": "최대 1억원",
    "category": "창업지원",
    "status": "open",
    "eligibility": "창업 7년 이내 중소기업",
    "applicationMethod": "온라인 신청",
    "requiredDocuments": ["사업계획서", "사업자등록증", "기술개발계획서"],
    "contactInfo": {
      "phone": "1357",
      "email": "support@mss.go.kr",
      "website": "https://www.mss.go.kr"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
  ```
- **Response (404 Not Found)**:
  ```json
  {
    "message": "지원사업을 찾을 수 없습니다."
  }
  ```

---

## 6. 마이페이지 통합 조회

### 6.1 마이페이지 데이터 조회

- **URL**: `/api/mypage`
- **Method**: `GET`
- **Description**: 마이페이지에 필요한 모든 데이터를 한 번에 조회합니다. (사용자 정보, 사업계획서 목록, 찜한 지원사업 목록)
- **Headers**:
  - `Authorization`: `Bearer <token>`
- **Query Parameters**:
  - `businessPlanLimit` (optional): 사업계획서 조회 개수 (기본값: 5)
  - `favoriteLimit` (optional): 찜한 지원사업 조회 개수 (기본값: 5)
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": "uuid-v4",
      "email": "user@gmail.com",
      "name": "홍길동",
      "profileImage": "https://lh3.googleusercontent.com/...",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "businessPlans": {
      "data": [
        {
          "id": "uuid-v4",
          "title": "AI 기반 물류 최적화 플랫폼 사업계획서",
          "grantTitle": "2025년 창업성장기술개발사업 디딤돌 창업과제",
          "status": "completed",
          "createdAt": "2024-01-15T00:00:00Z",
          "updatedAt": "2024-01-20T00:00:00Z"
        }
      ],
      "total": 3
    },
    "favorites": {
      "data": [
        {
          "id": "uuid-v4",
          "grant": {
            "id": "uuid-v4",
            "title": "2025년 창업성장기술개발사업 디딤돌 창업과제",
            "organization": "중소벤처기업부",
            "deadline": "2025-02-15",
            "amount": "최대 1억원",
            "category": "창업지원"
          },
          "createdAt": "2024-01-10T00:00:00Z"
        }
      ],
      "total": 3
    }
  }
  ```
- **Response (401 Unauthorized)**:
  ```json
  {
    "message": "인증되지 않은 사용자입니다."
  }
  ```

---

## 공통 에러 응답

### 400 Bad Request

```json
{
  "message": "잘못된 요청입니다.",
  "errors": [
    {
      "field": "title",
      "message": "제목은 필수 항목입니다."
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "message": "인증되지 않은 사용자입니다."
}
```

### 403 Forbidden

```json
{
  "message": "접근 권한이 없습니다."
}
```

### 404 Not Found

```json
{
  "message": "리소스를 찾을 수 없습니다."
}
```

### 500 Internal Server Error

```json
{
  "message": "서버 오류가 발생했습니다."
}
```

---

## 인증 방식

모든 인증이 필요한 API는 HTTP 헤더에 Bearer Token을 포함해야 합니다:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

토큰이 없거나 유효하지 않은 경우 `401 Unauthorized` 응답을 반환합니다.

---

---

## 데이터베이스 스키마

MySQL DDL은 [`ddl.md`](./ddl.md) 파일을 참조하세요.

# Backend API Implementation - Coupon System

## 1. Coupon Validate API (쿠폰 검증)

```
POST /api/coupons/validate
```

**Request:**

```json
{
  "code": "WELCOME2024"
}
```

**Response (Success):**

```json
{
  "valid": true,
  "coupon": {
    "id": "coupon-uuid",
    "code": "WELCOME2024",
    "discountAmount": 30000,
    "expiresAt": "2025-12-31T23:59:59Z",
    "maxUses": 100,
    "usedCount": 5,
    "isActive": true,
    "description": "Welcome coupon",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
}
```

**Response (Fail):**

```json
{
  "valid": false,
  "message": "Expired coupon"
}
```

**Validation Logic:**

- Check coupon code exists
- Check `isActive === true`
- Check `expiresAt > now`
- If `maxUses` is set, check `usedCount < maxUses`

---

## 2. Coupon List API (Admin only)

```
GET /api/coupons
Authorization: Bearer {admin_token}
```

**Permission:** `role === "admin"` only

**Response:**

```json
{
  "data": [
    {
      "id": "coupon-uuid",
      "code": "WELCOME2024",
      "discountAmount": 30000,
      "expiresAt": "2025-12-31T23:59:59Z",
      "maxUses": 100,
      "usedCount": 5,
      "isActive": true,
      "description": "Welcome coupon",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

## 3. Coupon Create API (Admin only)

```
POST /api/coupons
Authorization: Bearer {admin_token}
```

**Permission:** `role === "admin"` only

**Request:**

```json
{
  "code": "NEWYEAR2025",
  "discountAmount": 30000,
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxUses": 100,
  "description": "New Year discount"
}
```

| Field          | Type   | Required | Description                        |
| -------------- | ------ | -------- | ---------------------------------- |
| code           | string | O        | Coupon code (uppercase, unique)    |
| discountAmount | number | O        | Discount amount (KRW)              |
| expiresAt      | string | O        | Expiry datetime (ISO 8601)         |
| maxUses        | number | X        | Max usage count (null = unlimited) |
| description    | string | X        | Coupon description                 |

**Response:**

```json
{
  "id": "new-coupon-uuid",
  "code": "NEWYEAR2025",
  "discountAmount": 30000,
  "expiresAt": "2025-12-31T23:59:59Z",
  "maxUses": 100,
  "usedCount": 0,
  "isActive": true,
  "description": "New Year discount",
  "createdAt": "2025-01-15T00:00:00Z",
  "updatedAt": "2025-01-15T00:00:00Z"
}
```

---

## 4. Coupon Update API (Admin only)

```
PATCH /api/coupons/{id}
Authorization: Bearer {admin_token}
```

**Permission:** `role === "admin"` only

**Request:**

```json
{
  "isActive": false
}
```

All fields optional: `code`, `discountAmount`, `expiresAt`, `maxUses`, `description`, `isActive`

---

## 5. Coupon Delete API (Admin only)

```
DELETE /api/coupons/{id}
Authorization: Bearer {admin_token}
```

**Permission:** `role === "admin"` only

**Response:** 204 No Content

---

## 6. Payment with Coupon

```
POST /api/payments
Authorization: Bearer {token}
```

**Request:**

```json
{
  "productId": "credit-1",
  "paymentMethod": "card",
  "amount": 20000,
  "couponCode": "WELCOME2024"
}
```

**Processing Logic:**

1. If `couponCode` exists, validate coupon
2. Payment amount = Original price (50,000) - Coupon discount
3. On payment success, increment coupon's `usedCount`

---

## 7. User Model - Add role field

```json
{
  "id": "user-uuid",
  "email": "admin@example.com",
  "name": "Admin",
  "role": "admin",
  ...
}
```

| role value | Description                        |
| ---------- | ---------------------------------- |
| user       | Normal user (default)              |
| admin      | Administrator (can manage coupons) |

---

## DB Schema (Coupon Table)

```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_amount INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uses INTEGER,  -- NULL = unlimited
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  description VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
```

---

## Price Policy Summary

| Case                  | Original   | Discount    | Final          |
| --------------------- | ---------- | ----------- | -------------- |
| Default (no coupon)   | 50,000 KRW | 0           | **50,000 KRW** |
| Coupon 30,000 applied | 50,000 KRW | -30,000 KRW | **20,000 KRW** |

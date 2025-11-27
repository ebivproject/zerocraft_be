import { Request } from "express";
import { User as PrismaUser } from "@prisma/client";

// User 타입 (Prisma 모델 재사용)
export type User = PrismaUser;

// JWT 페이로드
export interface JwtPayload {
  userId: string;
  email: string;
}

// 인증된 요청
export interface AuthRequest extends Request {
  user?: User;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 사업계획서 상태
export type BusinessPlanStatus = "draft" | "completed";

// 지원사업 상태
export type GrantStatus = "open" | "closed";

// 결제 상태
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";

// 이용권 내역 타입
export type CreditHistoryType = "purchase" | "use";

// 사업계획서 섹션
export interface BusinessPlanSection {
  id: string;
  title: string;
  content: string;
}

// 사업계획서 콘텐츠
export interface BusinessPlanContent {
  sections: BusinessPlanSection[];
}

// 지원사업 연락처 정보
export interface GrantContactInfo {
  phone?: string;
  email?: string;
  website?: string;
}

// API 에러 응답
export interface ApiError {
  message: string;
  errors?: {
    field: string;
    message: string;
  }[];
}

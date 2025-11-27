import { Request, Response, NextFunction } from "express";

// 커스텀 에러 클래스
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 Bad Request
export class BadRequestError extends AppError {
  constructor(message: string = "잘못된 요청입니다.") {
    super(message, 400);
  }
}

// 401 Unauthorized
export class UnauthorizedError extends AppError {
  constructor(message: string = "인증되지 않은 사용자입니다.") {
    super(message, 401);
  }
}

// 403 Forbidden
export class ForbiddenError extends AppError {
  constructor(message: string = "접근 권한이 없습니다.") {
    super(message, 403);
  }
}

// 404 Not Found
export class NotFoundError extends AppError {
  constructor(message: string = "리소스를 찾을 수 없습니다.") {
    super(message, 404);
  }
}

// 409 Conflict
export class ConflictError extends AppError {
  constructor(message: string = "이미 존재하는 리소스입니다.") {
    super(message, 409);
  }
}

// 에러 핸들러 미들웨어
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", err);
  console.error("Error stack:", err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // 예상치 못한 에러 - 개발/디버깅용으로 실제 에러 메시지 포함
  return res.status(500).json({
    message: "서버 오류가 발생했습니다.",
    error: process.env.NODE_ENV !== "production" ? err.message : undefined,
    stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
  });
};

// 비동기 핸들러 래퍼
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

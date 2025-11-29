import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { ForbiddenError } from "./error.middleware";

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ForbiddenError("인증이 필요합니다.");
    }

    if (req.user.role !== "admin") {
      throw new ForbiddenError("관리자 권한이 필요합니다.");
    }

    next();
  } catch (error) {
    next(error);
  }
};

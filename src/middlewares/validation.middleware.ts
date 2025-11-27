import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";

// 유효성 검사 미들웨어
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 모든 유효성 검사 실행
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
    }));

    return res.status(400).json({
      message: "잘못된 요청입니다.",
      errors: formattedErrors,
    });
  };
};

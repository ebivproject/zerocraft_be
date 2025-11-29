import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";

const router = Router();

// 쿠폰 검증 함수 (내부 사용)
export const validateCoupon = async (code: string) => {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon) {
    return {
      valid: false,
      message: "존재하지 않는 쿠폰입니다.",
    };
  }

  if (!coupon.isActive) {
    return {
      valid: false,
      message: "비활성화된 쿠폰입니다.",
    };
  }

  if (coupon.expiresAt < new Date()) {
    return {
      valid: false,
      message: "만료된 쿠폰입니다.",
    };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return {
      valid: false,
      message: "사용 횟수가 초과된 쿠폰입니다.",
    };
  }

  return {
    valid: true,
    coupon,
  };
};

// 1. POST /api/coupons/validate - 쿠폰 검증
router.post(
  "/validate",
  asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.body;

    if (!code) {
      throw new BadRequestError("쿠폰 코드를 입력해주세요.");
    }

    const result = await validateCoupon(code);

    if (!result.valid) {
      return res.json({
        valid: false,
        message: result.message,
      });
    }

    const coupon = result.coupon!;

    res.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        expiresAt: coupon.expiresAt,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        description: coupon.description,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      },
    });
  })
);

// 2. GET /api/coupons - 쿠폰 목록 (Admin only)
router.get(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      data: coupons.map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        expiresAt: coupon.expiresAt,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        isActive: coupon.isActive,
        description: coupon.description,
        createdAt: coupon.createdAt,
        updatedAt: coupon.updatedAt,
      })),
    });
  })
);

// 3. POST /api/coupons - 쿠폰 생성 (Admin only)
router.post(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code, discountAmount, expiresAt, maxUses, description } = req.body;

    // 필수 필드 검증
    if (!code || !discountAmount || !expiresAt) {
      throw new BadRequestError(
        "필수 필드를 모두 입력해주세요. (code, discountAmount, expiresAt)"
      );
    }

    // 쿠폰 코드 중복 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      throw new BadRequestError("이미 존재하는 쿠폰 코드입니다.");
    }

    // 쿠폰 생성
    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountAmount,
        expiresAt: new Date(expiresAt),
        maxUses: maxUses || null,
        description: description || null,
      },
    });

    res.json({
      id: coupon.id,
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      description: coupon.description,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  })
);

// 4. PATCH /api/coupons/:id - 쿠폰 수정 (Admin only)
router.patch(
  "/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { code, discountAmount, expiresAt, maxUses, description, isActive } =
      req.body;

    // 쿠폰 존재 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new NotFoundError("쿠폰을 찾을 수 없습니다.");
    }

    // 코드 변경 시 중복 확인
    if (code && code.toUpperCase() !== existingCoupon.code) {
      const duplicateCoupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (duplicateCoupon) {
        throw new BadRequestError("이미 존재하는 쿠폰 코드입니다.");
      }
    }

    // 업데이트 데이터 구성
    const updateData: any = {};
    if (code !== undefined) updateData.code = code.toUpperCase();
    if (discountAmount !== undefined) updateData.discountAmount = discountAmount;
    if (expiresAt !== undefined) updateData.expiresAt = new Date(expiresAt);
    if (maxUses !== undefined) updateData.maxUses = maxUses;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    // 쿠폰 수정
    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: coupon.id,
      code: coupon.code,
      discountAmount: coupon.discountAmount,
      expiresAt: coupon.expiresAt,
      maxUses: coupon.maxUses,
      usedCount: coupon.usedCount,
      isActive: coupon.isActive,
      description: coupon.description,
      createdAt: coupon.createdAt,
      updatedAt: coupon.updatedAt,
    });
  })
);

// 5. DELETE /api/coupons/:id - 쿠폰 삭제 (Admin only)
router.delete(
  "/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // 쿠폰 존재 확인
    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      throw new NotFoundError("쿠폰을 찾을 수 없습니다.");
    }

    // 쿠폰 삭제
    await prisma.coupon.delete({
      where: { id },
    });

    res.status(204).send();
  })
);

export default router;

import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler, BadRequestError } from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";
import { validateCoupon } from "./coupons.routes";

const router = Router();

// 1. POST /api/payment-requests - 결제 요청 생성 (사용자)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { depositorName, originalAmount, couponCode, creditsToAdd } =
      req.body;

    // 필수 필드 검증
    if (!depositorName || !originalAmount) {
      throw new BadRequestError("입금자명과 금액은 필수입니다.");
    }

    if (originalAmount < 1000) {
      throw new BadRequestError("최소 입금 금액은 1,000원입니다.");
    }

    let couponId: string | null = null;
    let couponCodeToSave: string | null = null;
    let discountAmount = 0;

    // 쿠폰 검증 및 적용
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode);

      if (!couponResult.valid) {
        throw new BadRequestError(
          couponResult.message || "유효하지 않은 쿠폰입니다."
        );
      }

      const coupon = couponResult.coupon!;
      couponId = coupon.id;
      couponCodeToSave = coupon.code;
      discountAmount = coupon.discountAmount;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId,
        depositorName,
        amount: finalAmount,
        originalAmount,
        couponId,
        couponCode: couponCodeToSave,
        discountAmount,
        creditsToAdd: creditsToAdd || 1,
        status: "pending",
      },
    });

    res.status(201).json({
      id: paymentRequest.id,
      depositorName: paymentRequest.depositorName,
      amount: paymentRequest.amount,
      originalAmount: paymentRequest.originalAmount,
      couponCode: paymentRequest.couponCode,
      discountAmount: paymentRequest.discountAmount,
      status: paymentRequest.status,
      creditsToAdd: paymentRequest.creditsToAdd,
      createdAt: paymentRequest.createdAt,
    });
  })
);

// 2. GET /api/payment-requests/me - 내 요청 목록 (사용자)
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );

    const [requests, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.paymentRequest.count({ where: { userId } }),
    ]);

    const data = requests.map((r) => ({
      id: r.id,
      depositorName: r.depositorName,
      amount: r.amount,
      originalAmount: r.originalAmount,
      couponCode: r.couponCode,
      discountAmount: r.discountAmount,
      status: r.status,
      creditsToAdd: r.creditsToAdd,
      adminNote: r.adminNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

export default router;

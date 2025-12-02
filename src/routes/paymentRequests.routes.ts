import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler, BadRequestError } from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";
import { validateCoupon } from "./coupons.routes";

const router = Router();

// 상품 정가 (무통장 입금 기본 가격)
const PRODUCT_PRICE = 50000;

// 1. POST /api/payment-requests - 결제 요청 생성 (사용자)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { depositorName, couponCode, creditsToAdd } = req.body;

    // 필수 필드 검증
    if (!depositorName) {
      throw new BadRequestError("입금자명은 필수입니다.");
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

    // 최종 금액 = 상품 정가 - 할인 금액
    const finalAmount = Math.max(0, PRODUCT_PRICE - discountAmount);

    // 트랜잭션으로 결제 요청 생성 + 쿠폰 즉시 사용 처리
    const paymentRequest = await prisma.$transaction(async (tx) => {
      // 1. 결제 요청 생성
      const request = await tx.paymentRequest.create({
        data: {
          userId,
          depositorName,
          amount: finalAmount,
          originalAmount: PRODUCT_PRICE,
          couponId,
          couponCode: couponCodeToSave,
          discountAmount,
          creditsToAdd: creditsToAdd || 1,
          status: "pending",
        },
      });

      // 2. 쿠폰 즉시 사용 처리 (요청 제출 시 차감)
      if (couponId) {
        // 쿠폰 사용 횟수 증가
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });

        // 쿠폰 사용 내역 기록
        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            type: "bank_transfer",
          },
        });
      }

      return request;
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

import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";
import { validateCoupon } from "./coupons.routes";

const router = Router();

// 토스페이먼츠 응답 타입
interface TossPaymentResponse {
  method?: string;
  message?: string;
  code?: string;
}

// 상품 정보 (실제로는 DB나 설정에서 관리)
const PRODUCTS: Record<
  string,
  { name: string; credits: number; price: number }
> = {
  business_plan_1: {
    name: "AI 사업계획서 이용권 1회",
    credits: 1,
    price: 50000,
  },
  business_plan_3: {
    name: "AI 사업계획서 이용권 3회",
    credits: 3,
    price: 79900,
  },
  business_plan_5: {
    name: "AI 사업계획서 이용권 5회",
    credits: 5,
    price: 119900,
  },
  // 기존 ID도 호환성 유지
  "credit-1": { name: "AI 사업계획서 이용권 1회", credits: 1, price: 50000 },
  "credit-3": { name: "AI 사업계획서 이용권 3회", credits: 3, price: 79900 },
  "credit-5": { name: "AI 사업계획서 이용권 5회", credits: 5, price: 119900 },
};

// 2.2 결제 요청 (토스페이먼츠용 orderId 생성)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { productId, couponCode } = req.body;

    const product = PRODUCTS[productId];
    if (!product) {
      throw new BadRequestError("유효하지 않은 상품입니다.");
    }

    let finalAmount = product.price;
    let couponId: string | null = null;

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
      finalAmount = Math.max(0, product.price - coupon.discountAmount);
    }

    // 주문 ID 생성 (토스페이먼츠는 6자~64자)
    const orderId = `ORDER_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // 결제 레코드 생성
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        productId,
        productName: product.name,
        amount: finalAmount,
        creditsAdded: product.credits,
        status: "pending",
        paymentMethod: "card",
        couponId,
      },
    });

    // 프론트엔드에서 토스페이먼츠 결제창을 띄울 때 필요한 정보 반환
    res.json({
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      productName: product.name,
      customerName: req.user!.name,
      customerEmail: req.user!.email,
    });
  })
);

// 2.3 토스페이먼츠 결제 승인
router.post(
  "/confirm",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { orderId, paymentKey, amount } = req.body;

    if (!orderId || !paymentKey || !amount) {
      throw new BadRequestError("필수 파라미터가 누락되었습니다.");
    }

    // 결제 정보 조회
    const payment = await prisma.payment.findFirst({
      where: {
        orderId,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundError("결제 정보를 찾을 수 없습니다.");
    }

    if (payment.status === "completed") {
      throw new BadRequestError("이미 완료된 결제입니다.");
    }

    // 금액 검증
    if (payment.amount !== amount) {
      throw new BadRequestError("결제 금액이 일치하지 않습니다.");
    }

    // 토스페이먼츠 결제 승인 API 호출
    const tossSecretKey = process.env.TOSS_SECRET_KEY;
    if (!tossSecretKey) {
      throw new Error("토스페이먼츠 시크릿 키가 설정되지 않았습니다.");
    }

    const tossResponse = await fetch(
      "https://api.tosspayments.com/v1/payments/confirm",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(tossSecretKey + ":").toString(
            "base64"
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
          paymentKey,
        }),
      }
    );

    const tossData = (await tossResponse.json()) as TossPaymentResponse;

    if (!tossResponse.ok) {
      console.error("토스페이먼츠 승인 실패:", tossData);

      // 결제 실패 상태 업데이트
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "failed" },
      });

      throw new BadRequestError(
        `결제 승인 실패: ${tossData.message || "알 수 없는 오류"}`
      );
    }

    // 트랜잭션으로 결제 완료 처리
    const result = await prisma.$transaction(async (tx) => {
      // 결제 상태 업데이트
      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "completed",
          paymentKey: paymentKey,
          paymentMethod: tossData.method || "card",
        },
      });

      // 쿠폰 사용 처리
      if (payment.couponId) {
        // 쿠폰 사용 횟수 증가
        await tx.coupon.update({
          where: { id: payment.couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });

        // 쿠폰 사용 내역 기록
        await tx.couponUsage.create({
          data: {
            couponId: payment.couponId,
            userId,
            type: "payment",
          },
        });
      }

      // 이용권 추가
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: payment.creditsAdded },
        },
      });

      // 이용권 내역 생성
      await tx.creditHistory.create({
        data: {
          userId,
          type: "purchase",
          amount: payment.creditsAdded,
          description: "이용권 구매",
          paymentId: payment.id,
        },
      });

      return { payment: updatedPayment, user: updatedUser };
    });

    res.json({
      paymentId: result.payment.id,
      orderId: result.payment.orderId,
      status: "completed",
      creditsAdded: result.payment.creditsAdded,
      currentCredits: result.user.credits,
      message: `결제가 완료되었습니다. 이용권 ${result.payment.creditsAdded}회가 지급되었습니다.`,
    });
  })
);

// 2.4 결제 내역 조회
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    const data = payments.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      productName: payment.productName,
      amount: payment.amount,
      creditsAdded: payment.creditsAdded,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

export default router;

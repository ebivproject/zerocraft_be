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

const router = Router();

// 상품 정보 (실제로는 DB나 설정에서 관리)
const PRODUCTS: Record<
  string,
  { name: string; credits: number; price: number }
> = {
  "credit-1": { name: "AI 사업계획서 이용권 1회", credits: 1, price: 29900 },
  "credit-3": { name: "AI 사업계획서 이용권 3회", credits: 3, price: 79900 },
  "credit-5": { name: "AI 사업계획서 이용권 5회", credits: 5, price: 119900 },
};

// 2.2 결제 요청
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { productId, paymentMethod, amount } = req.body;

    const product = PRODUCTS[productId];
    if (!product) {
      throw new BadRequestError("유효하지 않은 상품입니다.");
    }

    if (amount !== product.price) {
      throw new BadRequestError("결제 금액이 일치하지 않습니다.");
    }

    // 주문 ID 생성
    const orderId = `ORDER-${new Date().getFullYear()}-${uuidv4()
      .slice(0, 8)
      .toUpperCase()}`;

    // 결제 레코드 생성
    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId,
        productId,
        productName: product.name,
        amount,
        creditsAdded: product.credits,
        status: "pending",
        paymentMethod: paymentMethod || "card",
      },
    });

    // 실제로는 결제 게이트웨이 URL을 반환
    // 여기서는 테스트용으로 임시 URL 반환
    res.json({
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      paymentUrl: `https://payment-gateway.com/pay/${payment.id}`,
    });
  })
);

// 2.3 결제 확인/완료
router.post(
  "/:paymentId/confirm",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { paymentId } = req.params;

    // 결제 정보 조회
    const payment = await prisma.payment.findFirst({
      where: {
        id: paymentId,
        userId,
      },
    });

    if (!payment) {
      throw new NotFoundError("결제 정보를 찾을 수 없습니다.");
    }

    if (payment.status === "completed") {
      throw new BadRequestError("이미 완료된 결제입니다.");
    }

    if (payment.status !== "pending") {
      throw new BadRequestError("결제 처리에 실패했습니다.");
    }

    // 트랜잭션으로 결제 완료 처리
    const result = await prisma.$transaction(async (tx) => {
      // 결제 상태 업데이트
      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: "completed",
          paymentKey: `PK-${uuidv4()}`, // 실제로는 결제 게이트웨이에서 받은 키
        },
      });

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

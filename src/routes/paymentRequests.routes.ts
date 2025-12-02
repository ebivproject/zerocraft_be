import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";

const router = Router();

// 1. POST /api/payment-requests - 결제 요청 생성 (사용자)
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { depositorName, amount, creditsToAdd } = req.body;

    // 필수 필드 검증
    if (!depositorName || !amount) {
      throw new BadRequestError("입금자명과 금액은 필수입니다.");
    }

    if (amount < 1000) {
      throw new BadRequestError("최소 입금 금액은 1,000원입니다.");
    }

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId,
        depositorName,
        amount,
        creditsToAdd: creditsToAdd || 1,
        status: "pending",
      },
    });

    res.status(201).json({
      id: paymentRequest.id,
      depositorName: paymentRequest.depositorName,
      amount: paymentRequest.amount,
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
      status: r.status,
      creditsToAdd: r.creditsToAdd,
      adminNote: r.adminNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

// 3. GET /api/payment-requests - 요청 목록 (관리자)
router.get(
  "/",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );
    const { status } = req.query;

    const where: any = {};
    if (status && ["pending", "approved", "rejected"].includes(status as string)) {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.paymentRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.paymentRequest.count({ where }),
    ]);

    const data = requests.map((r) => ({
      id: r.id,
      userId: r.userId,
      userName: r.user.name,
      userEmail: r.user.email,
      depositorName: r.depositorName,
      amount: r.amount,
      status: r.status,
      creditsToAdd: r.creditsToAdd,
      adminNote: r.adminNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

// 4. POST /api/payment-requests/:id/approve - 승인 (관리자)
router.post(
  "/:id/approve",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { creditsToAdd } = req.body;

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
    });

    if (!paymentRequest) {
      throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    }

    if (paymentRequest.status !== "pending") {
      throw new BadRequestError("이미 처리된 요청입니다.");
    }

    const finalCreditsToAdd = creditsToAdd || paymentRequest.creditsToAdd;

    // 트랜잭션으로 승인 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. 요청 상태 업데이트
      const updatedRequest = await tx.paymentRequest.update({
        where: { id },
        data: {
          status: "approved",
          creditsToAdd: finalCreditsToAdd,
        },
      });

      // 2. 사용자 크레딧 추가
      await tx.user.update({
        where: { id: paymentRequest.userId },
        data: {
          credits: { increment: finalCreditsToAdd },
        },
      });

      // 3. 크레딧 내역 기록
      await tx.creditHistory.create({
        data: {
          userId: paymentRequest.userId,
          type: "purchase",
          amount: finalCreditsToAdd,
          description: `무통장 입금 승인 (${paymentRequest.amount.toLocaleString()}원)`,
        },
      });

      return updatedRequest;
    });

    res.json({
      id: result.id,
      status: result.status,
      creditsToAdd: result.creditsToAdd,
      message: "결제 요청이 승인되었습니다.",
    });
  })
);

// 5. POST /api/payment-requests/:id/reject - 거절 (관리자)
router.post(
  "/:id/reject",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { adminNote } = req.body;

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
    });

    if (!paymentRequest) {
      throw new NotFoundError("결제 요청을 찾을 수 없습니다.");
    }

    if (paymentRequest.status !== "pending") {
      throw new BadRequestError("이미 처리된 요청입니다.");
    }

    const result = await prisma.paymentRequest.update({
      where: { id },
      data: {
        status: "rejected",
        adminNote: adminNote || null,
      },
    });

    res.json({
      id: result.id,
      status: result.status,
      adminNote: result.adminNote,
      message: "결제 요청이 거절되었습니다.",
    });
  })
);

export default router;

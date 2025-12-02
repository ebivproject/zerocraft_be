import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  BadRequestError,
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

export default router;

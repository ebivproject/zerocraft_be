import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler, BadRequestError } from "../middlewares/error.middleware";
import { AuthRequest } from "../types";

const router = Router();

// 2.1 이용권 잔액 조회
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    // 총 구매량 계산
    const purchaseStats = await prisma.creditHistory.aggregate({
      where: {
        userId,
        type: "purchase",
      },
      _sum: {
        amount: true,
      },
    });

    // 총 사용량 계산
    const useStats = await prisma.creditHistory.aggregate({
      where: {
        userId,
        type: "use",
      },
      _sum: {
        amount: true,
      },
    });

    const totalPurchased = purchaseStats._sum.amount || 0;
    const usedCredits = Math.abs(useStats._sum.amount || 0);
    const credits = req.user!.credits;

    res.json({
      credits,
      usedCredits,
      totalPurchased,
    });
  })
);

// 2.5 이용권 사용 내역 조회
router.get(
  "/history",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;

    const histories = await prisma.creditHistory.findMany({
      where: { userId },
      include: {
        businessPlan: {
          select: {
            id: true,
            title: true,
          },
        },
        payment: {
          select: {
            id: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = histories.map((history) => ({
      id: history.id,
      type: history.type,
      amount: history.amount,
      description: history.description,
      businessPlanId: history.businessPlanId,
      businessPlanTitle: history.businessPlan?.title,
      paymentId: history.paymentId,
      createdAt: history.createdAt,
    }));

    res.json({ data });
  })
);

// 2.6 이용권 사용 (차감)
router.post(
  "/use",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { description, businessPlanId } = req.body;

    // 현재 이용권 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.credits < 1) {
      throw new BadRequestError("이용권이 부족합니다.");
    }

    // 트랜잭션으로 이용권 차감 및 내역 생성
    const result = await prisma.$transaction(async (tx) => {
      // 이용권 차감
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: { decrement: 1 },
        },
      });

      // 사용 내역 생성
      await tx.creditHistory.create({
        data: {
          userId,
          type: "use",
          amount: -1,
          description: description || "사업계획서 생성",
          businessPlanId,
        },
      });

      return updatedUser;
    });

    res.json({
      success: true,
      remainingCredits: result.credits,
      message: "이용권이 사용되었습니다.",
    });
  })
);

export default router;

import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/error.middleware";
import { AuthRequest } from "../types";

const router = Router();

// 6.1 마이페이지 데이터 조회
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const businessPlanLimit =
      parseInt(req.query.businessPlanLimit as string) || 5;
    const favoriteLimit = parseInt(req.query.favoriteLimit as string) || 5;

    // 병렬로 데이터 조회
    const [user, businessPlans, businessPlanTotal, favorites, favoriteTotal] =
      await Promise.all([
        // 사용자 정보
        prisma.user.findUnique({
          where: { id: userId },
        }),
        // 최근 사업계획서
        prisma.businessPlan.findMany({
          where: { userId },
          include: {
            grant: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
          take: businessPlanLimit,
        }),
        // 총 사업계획서 수
        prisma.businessPlan.count({ where: { userId } }),
        // 찜한 지원사업
        prisma.favoriteGrant.findMany({
          where: { userId },
          include: {
            grant: {
              select: {
                id: true,
                title: true,
                organization: true,
                deadline: true,
                amount: true,
                category: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: favoriteLimit,
        }),
        // 총 찜한 지원사업 수
        prisma.favoriteGrant.count({ where: { userId } }),
      ]);

    res.json({
      user: {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        profileImage: user!.profileImage,
        credits: user!.credits,
        createdAt: user!.createdAt,
      },
      businessPlans: {
        data: businessPlans.map((bp) => ({
          id: bp.id,
          title: bp.title,
          grantTitle: bp.grant?.title || null,
          status: bp.status,
          createdAt: bp.createdAt,
          updatedAt: bp.updatedAt,
        })),
        total: businessPlanTotal,
      },
      favorites: {
        data: favorites.map((fav) => ({
          id: fav.id,
          grant: {
            id: fav.grant.id,
            title: fav.grant.title,
            organization: fav.grant.organization,
            deadline: fav.grant.deadline,
            amount: fav.grant.amount,
            category: fav.grant.category,
          },
          createdAt: fav.createdAt,
        })),
        total: favoriteTotal,
      },
    });
  })
);

export default router;

import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  NotFoundError,
  ConflictError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";

const router = Router();

// 4.1 찜한 지원사업 목록 조회
router.get(
  "/grants",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );
    const { sort = "createdAt", order = "desc" } = req.query;

    let orderBy: any = { createdAt: order === "asc" ? "asc" : "desc" };
    if (sort === "deadline") {
      orderBy = { grant: { deadline: order === "asc" ? "asc" : "desc" } };
    }

    const [favorites, total] = await Promise.all([
      prisma.favoriteGrant.findMany({
        where: { userId },
        include: {
          grant: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.favoriteGrant.count({ where: { userId } }),
    ]);

    const data = favorites.map((fav) => ({
      id: fav.id,
      grantId: fav.grantId,
      grant: {
        id: fav.grant.id,
        title: fav.grant.title,
        organization: fav.grant.organization,
        deadline: fav.grant.deadline,
        amount: fav.grant.amount,
        category: fav.grant.category,
        status: fav.grant.status,
      },
      createdAt: fav.createdAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

// 4.2 지원사업 찜하기
router.post(
  "/grants",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { grantId } = req.body;

    // 지원사업 존재 확인
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
    });

    if (!grant) {
      throw new NotFoundError("지원사업을 찾을 수 없습니다.");
    }

    // 이미 찜했는지 확인
    const existing = await prisma.favoriteGrant.findUnique({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("이미 찜한 지원사업입니다.");
    }

    const favorite = await prisma.favoriteGrant.create({
      data: {
        userId,
        grantId,
      },
    });

    res.status(201).json({
      id: favorite.id,
      grantId: favorite.grantId,
      userId: favorite.userId,
      createdAt: favorite.createdAt,
    });
  })
);

// 4.3 지원사업 찜 해제
router.delete(
  "/grants/:grantId",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { grantId } = req.params;

    const favorite = await prisma.favoriteGrant.findUnique({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
    });

    if (!favorite) {
      throw new NotFoundError("찜한 지원사업을 찾을 수 없습니다.");
    }

    await prisma.favoriteGrant.delete({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
    });

    res.json({ message: "찜이 해제되었습니다." });
  })
);

// 4.4 지원사업 찜 여부 확인
router.get(
  "/grants/:grantId/check",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { grantId } = req.params;

    const favorite = await prisma.favoriteGrant.findUnique({
      where: {
        userId_grantId: {
          userId,
          grantId,
        },
      },
    });

    res.json({ isFavorite: !!favorite });
  })
);

export default router;

import { Router, Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { asyncHandler, NotFoundError } from "../middlewares/error.middleware";
import { parsePaginationParams, paginate } from "../utils/pagination";

const router = Router();

// 5.1 지원사업 목록 조회 (로그인 불필요)
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );
    const {
      category,
      status,
      search,
      sort = "deadline",
      order = "asc",
    } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (status && (status === "open" || status === "closed")) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { organization: { contains: search as string } },
      ];
    }

    const orderBy: any = {};
    if (sort === "deadline" || sort === "createdAt") {
      orderBy[sort as string] = order === "desc" ? "desc" : "asc";
    }

    const [grants, total] = await Promise.all([
      prisma.grant.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.grant.count({ where }),
    ]);

    const data = grants.map((grant) => ({
      id: grant.id,
      title: grant.title,
      description: grant.description,
      organization: grant.organization,
      deadline: grant.deadline,
      amount: grant.amount,
      category: grant.category,
      status: grant.status,
      createdAt: grant.createdAt,
      updatedAt: grant.updatedAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

// 5.2 지원사업 상세 조회
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const grant = await prisma.grant.findUnique({
      where: { id },
    });

    if (!grant) {
      throw new NotFoundError("지원사업을 찾을 수 없습니다.");
    }

    res.json({
      id: grant.id,
      title: grant.title,
      description: grant.description,
      organization: grant.organization,
      deadline: grant.deadline,
      amount: grant.amount,
      category: grant.category,
      status: grant.status,
      eligibility: grant.eligibility,
      applicationMethod: grant.applicationMethod,
      requiredDocuments: grant.requiredDocuments,
      contactInfo: grant.contactInfo,
      createdAt: grant.createdAt,
      updatedAt: grant.updatedAt,
    });
  })
);

export default router;

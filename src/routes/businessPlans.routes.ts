import { Router, Request, Response } from "express";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../middlewares/error.middleware";
import { AuthRequest, BusinessPlanContent } from "../types";
import { parsePaginationParams, paginate } from "../utils/pagination";

const router = Router();

// 3.1 내 사업계획서 목록 조회
router.get(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { page, limit, skip } = parsePaginationParams(
      req.query as { page?: string; limit?: string }
    );
    const { status, sort = "updatedAt", order = "desc" } = req.query;

    const where: any = { userId };
    if (status && (status === "draft" || status === "completed")) {
      where.status = status;
    }

    const orderBy: any = {};
    if (sort === "createdAt" || sort === "updatedAt") {
      orderBy[sort as string] = order === "asc" ? "asc" : "desc";
    }

    const [businessPlans, total] = await Promise.all([
      prisma.businessPlan.findMany({
        where,
        include: {
          grant: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.businessPlan.count({ where }),
    ]);

    const data = businessPlans.map((bp) => ({
      id: bp.id,
      title: bp.title,
      grantId: bp.grantId,
      grantTitle: bp.grant?.title || null,
      status: bp.status,
      createdAt: bp.createdAt,
      updatedAt: bp.updatedAt,
    }));

    res.json(paginate(data, total, page, limit));
  })
);

// 3.2 사업계획서 상세 조회
router.get(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!businessPlan) {
      throw new NotFoundError("사업계획서를 찾을 수 없습니다.");
    }

    if (businessPlan.userId !== userId) {
      throw new ForbiddenError("이 사업계획서에 접근할 권한이 없습니다.");
    }

    res.json({
      id: businessPlan.id,
      title: businessPlan.title,
      grantId: businessPlan.grantId,
      grantTitle: businessPlan.grant?.title || null,
      content: businessPlan.content,
      data: businessPlan.data,
      status: businessPlan.status,
      userId: businessPlan.userId,
      createdAt: businessPlan.createdAt,
      updatedAt: businessPlan.updatedAt,
    });
  })
);

// 3.3 사업계획서 생성
router.post(
  "/",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { title, grantId, content, data } = req.body;

    if (!title) {
      throw new BadRequestError("제목은 필수 항목입니다.");
    }

    // 지원사업 존재 확인 (선택사항)
    let grant = null;
    if (grantId) {
      grant = await prisma.grant.findUnique({
        where: { id: grantId },
      });
      if (!grant) {
        throw new NotFoundError("지원사업을 찾을 수 없습니다.");
      }
    }

    const businessPlan = await prisma.businessPlan.create({
      data: {
        title,
        grantId: grantId || null,
        content: content || { sections: [] },
        data: data || {},
        status: "draft",
        userId,
      },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(201).json({
      id: businessPlan.id,
      title: businessPlan.title,
      grantId: businessPlan.grantId,
      grantTitle: businessPlan.grant?.title || null,
      content: businessPlan.content,
      status: businessPlan.status,
      userId: businessPlan.userId,
      createdAt: businessPlan.createdAt,
      updatedAt: businessPlan.updatedAt,
    });
  })
);

// 3.4 사업계획서 다운로드 (DOCX)
router.get(
  "/:id/download",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { format = "docx" } = req.query;

    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id },
    });

    if (!businessPlan) {
      throw new NotFoundError("사업계획서를 찾을 수 없습니다.");
    }

    if (businessPlan.userId !== userId) {
      throw new ForbiddenError("이 사업계획서에 접근할 권한이 없습니다.");
    }

    // DOCX 문서 생성
    const content = businessPlan.content as BusinessPlanContent | null;
    const sections = content?.sections || [];

    const docChildren: Paragraph[] = [
      new Paragraph({
        text: businessPlan.title,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      }),
    ];

    // 섹션 내용 추가
    for (const section of sections) {
      docChildren.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
          children: [new TextRun(section.content || "")],
          spacing: { after: 200 },
        })
      );
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    // 파일명 생성 (특수문자 제거)
    const fileName = `${businessPlan.title.replace(
      /[^a-zA-Z0-9가-힣\s]/g,
      "_"
    )}.docx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(fileName)}"`
    );
    res.send(buffer);
  })
);

// 사업계획서 수정
router.put(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, content, data, status } = req.body;

    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id },
    });

    if (!businessPlan) {
      throw new NotFoundError("사업계획서를 찾을 수 없습니다.");
    }

    if (businessPlan.userId !== userId) {
      throw new ForbiddenError("이 사업계획서에 접근할 권한이 없습니다.");
    }

    const updatedBusinessPlan = await prisma.businessPlan.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(data && { data }),
        ...(status && { status }),
      },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.json({
      id: updatedBusinessPlan.id,
      title: updatedBusinessPlan.title,
      grantId: updatedBusinessPlan.grantId,
      grantTitle: updatedBusinessPlan.grant?.title || null,
      content: updatedBusinessPlan.content,
      status: updatedBusinessPlan.status,
      userId: updatedBusinessPlan.userId,
      createdAt: updatedBusinessPlan.createdAt,
      updatedAt: updatedBusinessPlan.updatedAt,
    });
  })
);

// 사업계획서 삭제
router.delete(
  "/:id",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const businessPlan = await prisma.businessPlan.findUnique({
      where: { id },
    });

    if (!businessPlan) {
      throw new NotFoundError("사업계획서를 찾을 수 없습니다.");
    }

    if (businessPlan.userId !== userId) {
      throw new ForbiddenError("이 사업계획서에 접근할 권한이 없습니다.");
    }

    await prisma.businessPlan.delete({
      where: { id },
    });

    res.json({ message: "사업계획서가 삭제되었습니다." });
  })
);

export default router;

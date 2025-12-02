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
      data: businessPlan.data ?? null,
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
    const { title, grantId, content, data, businessPlanId, useCredit } = req.body;

    // 1. businessPlanId가 제공된 경우: 기존 사업계획서를 내 것으로 가져오기
    if (businessPlanId) {
      const existingPlan = await prisma.businessPlan.findUnique({
        where: { id: businessPlanId },
      });

      if (!existingPlan) {
        throw new NotFoundError("해당 사업계획서를 찾을 수 없습니다.");
      }

      // 소유권 업데이트
      const updatedPlan = await prisma.businessPlan.update({
        where: { id: businessPlanId },
        data: {
          userId,
          // 필요하다면 status나 기타 필드도 초기화
          // status: "draft",
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

      return res.status(200).json({
        id: updatedPlan.id,
        title: updatedPlan.title,
        grantId: updatedPlan.grantId,
        grantTitle: updatedPlan.grant?.title || null,
        content: updatedPlan.content,
        data: updatedPlan.data ?? null,
        status: updatedPlan.status,
        userId: updatedPlan.userId,
        createdAt: updatedPlan.createdAt,
        updatedAt: updatedPlan.updatedAt,
      });
    }

    // 2. 신규 생성 (기존 로직)
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

    // AI 생성 사업계획서인 경우 (useCredit: true) 크레딧 검증 및 차감
    if (useCredit) {
      // 크레딧 검증
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.credits < 1) {
        throw new BadRequestError("이용권이 부족합니다.");
      }

      // 트랜잭션으로 크레딧 차감 + 사업계획서 생성
      const result = await prisma.$transaction(async (tx) => {
        // 크레딧 차감
        await tx.user.update({
          where: { id: userId },
          data: {
            credits: { decrement: 1 },
          },
        });

        // 사업계획서 생성
        const newPlan = await tx.businessPlan.create({
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

        // 크레딧 사용 내역 생성
        await tx.creditHistory.create({
          data: {
            userId,
            type: "use",
            amount: -1,
            description: `사업계획서 생성: ${title}`,
            businessPlanId: newPlan.id,
          },
        });

        return newPlan;
      });

      return res.status(201).json({
        id: result.id,
        title: result.title,
        grantId: result.grantId,
        grantTitle: result.grant?.title || null,
        content: result.content,
        data: result.data ?? null,
        status: result.status,
        userId: result.userId,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      });
    }

    // 일반 사업계획서 생성 (크레딧 미사용)
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

    // 프론트엔드가 기대하는 `data` 필드를 포함해 응답합니다.
    // `businessPlan.data` 는 AI가 만든 전체 JSON(선택)이며, 없을 경우 null 로 반환합니다.
    res.status(201).json({
      id: businessPlan.id,
      title: businessPlan.title,
      grantId: businessPlan.grantId,
      grantTitle: businessPlan.grant?.title || null,
      content: businessPlan.content,
      data: businessPlan.data ?? null,
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

    // data 필드에서 사업계획서 내용 추출
    const planData = businessPlan.data as any;
    const docChildren: Paragraph[] = [];

    // 문서 제목
    const documentTitle = planData?.documentTitle || businessPlan.title;
    docChildren.push(
      new Paragraph({
        text: documentTitle,
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
      })
    );

    // 섹션 순서 정의
    const sectionOrder = ["generalStatus", "summary", "problem", "solution", "scaleup", "team"];

    if (planData?.sections) {
      for (const sectionKey of sectionOrder) {
        const section = planData.sections[sectionKey];
        if (!section) continue;

        // 섹션 제목
        docChildren.push(
          new Paragraph({
            text: section.title || sectionKey,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 },
          })
        );

        // 섹션 데이터 처리 (summary, generalStatus 등)
        if (section.data) {
          for (const [key, value] of Object.entries(section.data)) {
            if (typeof value === "string") {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: `${key}: `, bold: true }), new TextRun(value)],
                  spacing: { after: 100 },
                })
              );
            } else if (typeof value === "object" && value !== null) {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: `${key}:`, bold: true })],
                  spacing: { after: 50 },
                })
              );
              for (const [subKey, subValue] of Object.entries(value as object)) {
                if (typeof subValue === "string") {
                  docChildren.push(
                    new Paragraph({
                      children: [new TextRun({ text: `  - ${subKey}: `, bold: true }), new TextRun(subValue)],
                      spacing: { after: 50 },
                    })
                  );
                }
              }
            }
          }
        }

        // subSections 처리
        if (section.subSections && Array.isArray(section.subSections)) {
          for (const subSection of section.subSections) {
            // 소제목
            if (subSection.subTitle) {
              docChildren.push(
                new Paragraph({
                  text: subSection.subTitle,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 300, after: 150 },
                })
              );
            }

            // 콘텐츠 처리
            if (subSection.content) {
              const content = subSection.content;
              for (const [contentKey, contentValue] of Object.entries(content)) {
                // 배열인 경우 (problems, competitorAnalysis 등)
                if (Array.isArray(contentValue)) {
                  for (const item of contentValue) {
                    if (typeof item === "string") {
                      docChildren.push(
                        new Paragraph({
                          children: [new TextRun(`• ${item}`)],
                          spacing: { after: 100 },
                        })
                      );
                    } else if (typeof item === "object" && item !== null) {
                      // 테이블 형태의 데이터
                      const itemEntries = Object.entries(item as object)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" | ");
                      docChildren.push(
                        new Paragraph({
                          children: [new TextRun(`• ${itemEntries}`)],
                          spacing: { after: 100 },
                        })
                      );
                    }
                  }
                }
                // 문자열인 경우
                else if (typeof contentValue === "string") {
                  docChildren.push(
                    new Paragraph({
                      children: [new TextRun({ text: `${contentKey}: `, bold: true }), new TextRun(contentValue)],
                      spacing: { after: 100 },
                    })
                  );
                }
                // 객체인 경우
                else if (typeof contentValue === "object" && contentValue !== null) {
                  docChildren.push(
                    new Paragraph({
                      children: [new TextRun({ text: `[${contentKey}]`, bold: true })],
                      spacing: { before: 150, after: 50 },
                    })
                  );
                  for (const [objKey, objValue] of Object.entries(contentValue as object)) {
                    if (typeof objValue === "string") {
                      docChildren.push(
                        new Paragraph({
                          children: [new TextRun({ text: `${objKey}: `, bold: true }), new TextRun(objValue)],
                          spacing: { after: 50 },
                        })
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
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
      data: updatedBusinessPlan.data ?? null,
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

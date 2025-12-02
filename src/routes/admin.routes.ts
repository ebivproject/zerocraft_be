import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { authenticate } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import {
  asyncHandler,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";
import { paginate, parsePaginationParams } from "../utils/pagination";

const router = Router();

// 슈퍼 어드민 체크 (환경변수에 설정된 이메일만 가능)
const requireSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: Function
) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    throw new ForbiddenError(
      "슈퍼 어드민이 설정되지 않았습니다. SUPER_ADMIN_EMAIL 환경변수를 설정하세요."
    );
  }

  if (req.user?.email !== superAdminEmail) {
    throw new ForbiddenError("슈퍼 어드민 권한이 필요합니다.");
  }

  next();
};

// 사용자 권한 부여 (슈퍼 어드민만 가능)
router.post(
  "/grant-admin",
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("이메일을 입력해주세요.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    if (user.role === "admin") {
      return res.json({
        message: "이미 관리자 권한을 가진 사용자입니다.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
    });

    res.json({
      message: "관리자 권한이 부여되었습니다.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  })
);

// 사용자 권한 회수 (슈퍼 어드민만 가능)
router.post(
  "/revoke-admin",
  authenticate,
  requireSuperAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("이메일을 입력해주세요.");
    }

    // 자기 자신의 권한은 회수할 수 없음
    if (email === req.user?.email) {
      throw new BadRequestError("자기 자신의 권한은 회수할 수 없습니다.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    if (user.role === "user") {
      return res.json({
        message: "이미 일반 사용자입니다.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "user" },
    });

    res.json({
      message: "관리자 권한이 회수되었습니다.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
    });
  })
);

// 모든 관리자 목록 조회 (관리자 이상만 가능)
router.get(
  "/list",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      data: admins,
      total: admins.length,
    });
  })
);

// =====================================================
// 유저 관리 API
// =====================================================

// 유저 목록 조회 (페이지네이션, 검색)
router.get(
  "/users",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = parsePaginationParams(req.query as any);
    const search = (req.query.search as string) || "";

    const where = search
      ? {
          OR: [
            { email: { contains: search } },
            { name: { contains: search } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          credits: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    res.json(paginate(users, total, page, limit));
  })
);

// 유저 상세 조회
router.get(
  "/users/:id",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        credits: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    res.json(user);
  })
);

// 유저 역할 변경
router.patch(
  "/users/:id/role",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    // 유효한 역할인지 검증
    if (!role || !["admin", "user"].includes(role)) {
      throw new BadRequestError("유효한 역할을 입력해주세요. (admin 또는 user)");
    }

    // 자기 자신의 역할은 변경 불가
    if (req.user?.id === id) {
      throw new ForbiddenError("자기 자신의 역할은 변경할 수 없습니다.");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    const previousRole = user.role;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        credits: true,
        createdAt: true,
      },
    });

    res.json({
      user: updatedUser,
      previousRole,
      newRole: role,
      message: "역할이 성공적으로 변경되었습니다.",
    });
  })
);

// 유저 이용권 변경
router.patch(
  "/users/:id/credits",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { credits, reason } = req.body;

    if (credits === undefined || typeof credits !== "number") {
      throw new BadRequestError("이용권 수량을 입력해주세요.");
    }

    if (credits < 0) {
      throw new BadRequestError("이용권 수량은 0 이상이어야 합니다.");
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, credits: true },
    });

    if (!user) {
      throw new NotFoundError("사용자를 찾을 수 없습니다.");
    }

    const previousCredits = user.credits;
    const creditDiff = credits - previousCredits;

    // 트랜잭션으로 유저 크레딧 업데이트 및 히스토리 기록
    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { credits },
        select: {
          id: true,
          email: true,
          name: true,
          profileImage: true,
          credits: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 크레딧 변경 히스토리 기록
      if (creditDiff !== 0) {
        await tx.creditHistory.create({
          data: {
            userId: id,
            type: creditDiff > 0 ? "purchase" : "use",
            amount: creditDiff,
            description: reason || `관리자에 의한 이용권 ${creditDiff > 0 ? "지급" : "차감"}`,
          },
        });
      }

      return updated;
    });

    res.json({
      user: updatedUser,
      previousCredits,
      newCredits: credits,
      message: "이용권이 변경되었습니다.",
    });
  })
);

// =====================================================
// 결제 요청 관리 API
// =====================================================

// 결제 요청 목록 조회 (관리자)
router.get(
  "/payment-requests",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, skip } = parsePaginationParams(req.query as any);
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

// 결제 요청 승인 (관리자)
router.post(
  "/payment-requests/:id/approve",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const creditsToAdd = req.body?.creditsToAdd;

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

// 결제 요청 거절 (관리자)
router.post(
  "/payment-requests/:id/reject",
  authenticate,
  requireAdmin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const adminNote = req.body?.adminNote;

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

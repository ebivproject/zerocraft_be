// @ts-nocheck
import { Router, Response } from "express";
import { prisma } from "../utils/prisma";
import { generateToken } from "../utils/jwt";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  UnauthorizedError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";

const router = Router();

// 1.1 Google 로그인 URL 요청
router.get("/google", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;
  const scope = encodeURIComponent("email profile");
  const state = Math.random().toString(36).substring(7);

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&access_type=offline&prompt=consent`;

  res.json({ url });
});

// Google 응답 타입 정의
interface GoogleTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserInfo {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
  error?: { message?: string };
}

// 1.2 Google OAuth 콜백
router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const { code } = req.query;

    console.log("OAuth callback received");
    console.log("Code:", code ? "present" : "missing");
    console.log(
      "GOOGLE_CLIENT_ID:",
      process.env.GOOGLE_CLIENT_ID ? "set" : "NOT SET"
    );
    console.log(
      "GOOGLE_CLIENT_SECRET:",
      process.env.GOOGLE_CLIENT_SECRET ? "set" : "NOT SET"
    );
    console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);

    if (!code) {
      throw new UnauthorizedError("Google 인증에 실패했습니다.");
    }

    // Google에서 액세스 토큰 가져오기
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || "",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    console.log("Token response:", JSON.stringify(tokenData, null, 2));

    if (!tokenData.access_token) {
      console.error(
        "Token error:",
        tokenData.error,
        tokenData.error_description
      );
      throw new UnauthorizedError(
        `Google 인증 실패: ${
          tokenData.error_description || tokenData.error || "Unknown error"
        }`
      );
    }

    // 사용자 정보 가져오기
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;

    if (!userInfo.email) {
      throw new UnauthorizedError("Google 인증에 실패했습니다.");
    }

    // 기존 사용자 확인 또는 새로 생성
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: userInfo.id }, { email: userInfo.email }],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          profileImage: userInfo.picture,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          name: userInfo.name || "Unknown",
          profileImage: userInfo.picture,
          googleId: userInfo.id,
          credits: 0,
        },
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email);

    // 프론트엔드로 리다이렉트 (토큰을 URL 파라미터로 전달)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    // state에서 원래 가려던 경로 추출 (있으면 사용, 없으면 기본값)
    const state = req.query.state as string;
    const redirectPath = state ? decodeURIComponent(state) : "/";

    // 프론트엔드의 OAuth 콜백 처리 페이지로 리다이렉트
    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  })
);

// 1.3 로그아웃
// @ts-ignore
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res: Response) => {
    // JWT 기반 인증에서는 클라이언트 측에서 토큰을 삭제하면 됨
    // 서버 측에서 블랙리스트 관리가 필요한 경우 여기서 처리
    res.json({ message: "로그아웃 되었습니다." });
  }) as any
);

// 1.4 내 정보 조회
// @ts-ignore
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res: Response) => {
    const authReq = req as AuthRequest;
    const user = authReq.user;

    if (!user) {
      throw new UnauthorizedError("인증되지 않은 사용자입니다.");
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      credits: user.credits,
      role: (user as any).role || "user",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  }) as any
);

export default router;

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

// Kakao 응답 타입 정의
interface KakaoTokenResponse {
  access_token?: string;
  token_type?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

interface KakaoUserInfo {
  id?: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
    };
  };
}

// 1.1 Kakao 로그인 URL 요청
router.get("/kakao", (req, res) => {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_CALLBACK_URL;
  const state = Math.random().toString(36).substring(7);

  const url = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri || "")}&response_type=code&state=${state}`;

  console.log("Kakao OAuth URL requested");
  console.log("KAKAO_CLIENT_ID:", clientId ? "set" : "NOT SET");
  console.log("KAKAO_CALLBACK_URL:", redirectUri);

  res.json({ url });
});

// 1.2 Kakao OAuth 콜백
router.get(
  "/kakao/callback",
  asyncHandler(async (req, res) => {
    const { code } = req.query;

    console.log("Kakao OAuth callback received");
    console.log("Code:", code ? "present" : "missing");

    if (!code) {
      throw new UnauthorizedError("카카오 인증에 실패했습니다.");
    }

    // Kakao에서 액세스 토큰 가져오기
    const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KAKAO_CLIENT_ID || "",
        client_secret: process.env.KAKAO_CLIENT_SECRET || "",
        redirect_uri: process.env.KAKAO_CALLBACK_URL || "",
        code: code as string,
      }),
    });

    const tokenData = (await tokenResponse.json()) as KakaoTokenResponse;
    console.log("Token response status:", tokenResponse.status);

    if (!tokenData.access_token) {
      console.error("Token error:", tokenData.error, tokenData.error_description);
      throw new UnauthorizedError(
        `카카오 인증 실패: ${tokenData.error_description || tokenData.error || "Unknown error"}`
      );
    }

    // 사용자 정보 가져오기
    const userInfoResponse = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    const userInfo = (await userInfoResponse.json()) as KakaoUserInfo;
    console.log("User info received:", userInfo.id ? "success" : "failed");

    const kakaoId = userInfo.id?.toString();
    const email = userInfo.kakao_account?.email;
    const name = userInfo.kakao_account?.profile?.nickname;
    const profileImage = userInfo.kakao_account?.profile?.profile_image_url;

    if (!kakaoId) {
      throw new UnauthorizedError("카카오 인증에 실패했습니다.");
    }

    // 기존 사용자 확인 또는 새로 생성
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { kakaoId: kakaoId },
          ...(email ? [{ email: email }] : []),
        ],
      },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          kakaoId: kakaoId,
          name: name || user.name,
          profileImage: profileImage || user.profileImage,
          ...(email && { email }),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: email || `kakao_${kakaoId}@kakao.local`,
          name: name || "카카오 사용자",
          profileImage: profileImage,
          kakaoId: kakaoId,
          credits: 0,
        },
      });
    }

    // JWT 토큰 생성
    const token = generateToken(user.id, user.email);

    // 프론트엔드로 리다이렉트
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const state = req.query.state as string;
    const redirectPath = state ? decodeURIComponent(state) : "/";

    res.redirect(
      `${frontendUrl}/auth/callback?token=${token}&redirect=${encodeURIComponent(redirectPath)}`
    );
  })
);

// 1.3 로그아웃
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    res.json({ message: "로그아웃 되었습니다." });
  })
);

// 1.4 내 정보 조회
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError("인증되지 않은 사용자입니다.");
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      credits: user.credits,
      role: user.role || "user",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  })
);

export default router;

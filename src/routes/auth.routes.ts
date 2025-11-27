import { Router, Response } from "express";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../utils/prisma";
import { generateToken } from "../utils/jwt";
import { authenticate } from "../middlewares/auth.middleware";
import {
  asyncHandler,
  UnauthorizedError,
} from "../middlewares/error.middleware";
import { AuthRequest } from "../types";

const router = Router();

// Google OAuth 전략 설정
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:3001/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const profileImage = profile.photos?.[0]?.value;
        const googleId = profile.id;

        if (!email) {
          return done(new Error("이메일을 가져올 수 없습니다."), undefined);
        }

        // 기존 사용자 확인 또는 새로 생성
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ googleId }, { email }],
          },
        });

        if (user) {
          // 기존 사용자 업데이트
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              googleId,
              name,
              profileImage,
            },
          });
        } else {
          // 새 사용자 생성
          user = await prisma.user.create({
            data: {
              email,
              name,
              profileImage,
              googleId,
              credits: 0,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

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
}

interface GoogleUserInfo {
  id?: string;
  email?: string;
  name?: string;
  picture?: string;
}

// 1.2 Google OAuth 콜백
router.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const { code } = req.query;

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

    if (!tokenData.access_token) {
      throw new UnauthorizedError("Google 인증에 실패했습니다.");
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

    // JSON 응답 반환 (API 명세서 기준)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  })
);

// 1.3 로그아웃
router.post("/logout", authenticate, (req, res) => {
  // JWT 기반 인증에서는 클라이언트 측에서 토큰을 삭제하면 됨
  // 서버 측에서 블랙리스트 관리가 필요한 경우 여기서 처리
  res.json({ message: "로그아웃 되었습니다." });
});

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  })
);

export default router;

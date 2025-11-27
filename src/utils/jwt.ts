import jwt from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";

// JWT 토큰 생성
export const generateToken = (userId: string, email: string): string => {
  const payload: JwtPayload = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

// JWT 토큰 검증
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

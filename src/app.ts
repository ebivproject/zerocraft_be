import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

// 환경변수 로드
dotenv.config();

// 라우터 임포트
import authRoutes from "./routes/auth.routes";
import creditsRoutes from "./routes/credits.routes";
import paymentsRoutes from "./routes/payments.routes";
import businessPlansRoutes from "./routes/businessPlans.routes";
import favoritesRoutes from "./routes/favorites.routes";
import grantsRoutes from "./routes/grants.routes";
import mypageRoutes from "./routes/mypage.routes";

// 미들웨어 임포트
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const PORT = process.env.PORT || 3001;

// 허용된 Origin 목록
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
].filter(Boolean) as string[];

// 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // 개발 환경이거나 허용된 origin인 경우
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use("/api/auth", authRoutes);
app.use("/api/credits", creditsRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/business-plans", businessPlansRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/grants", grantsRoutes);
app.use("/api/mypage", mypageRoutes);

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;

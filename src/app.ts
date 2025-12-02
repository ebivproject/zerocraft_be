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
import couponsRoutes from "./routes/coupons.routes";
import adminRoutes from "./routes/admin.routes";
import paymentRequestsRoutes from "./routes/paymentRequests.routes";

// 미들웨어 임포트
import { errorHandler } from "./middlewares/error.middleware";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = "0.0.0.0";

// 허용된 Origin 목록 (FRONTEND_URL이 콤마로 구분된 경우 처리)
const frontendUrls = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...frontendUrls,
  "http://localhost:3000",
  "http://localhost:3001",
];

// 미들웨어 설정
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // 개발 환경이거나 허용된 origin인 경우
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(null, true); // 프로덕션에서는 일단 허용 (디버깅용)
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
app.use("/api/coupons", couponsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment-requests", paymentRequestsRoutes);

// 헬스체크
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 루트 경로
app.get("/", (req, res) => {
  res.json({ message: "Zerocraft API Server", version: "1.0.0" });
});

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;

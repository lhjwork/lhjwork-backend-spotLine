import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { specs, swaggerUi } from "./config/swagger";
import { validateS3Config } from "./services/s3Service";

// 한국 시간대 설정
process.env.TZ = "Asia/Seoul";

// Routes import
import storesRouter from "./routes/stores";
import productionRouter from "./routes/production";
import qrRouter from "./routes/qr";
import recommendationsRouter from "./routes/recommendations";
import analyticsRouter from "./routes/analytics";
import adminMainRouter from "./routes/adminMain"; // 통합 어드민 라우터
import geocodingRouter from "./routes/geocoding";
import experienceRouter from "./routes/experience";
import demoRouter from "./routes/demo";
import liveRouter from "./routes/live";
import imageRouter from "./routes/imageRoutes"; // 이미지 업로드 라우터

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        // Local development
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004", // 관리자 페이지
        "http://localhost:4000",
        "http://localhost:5173",
        // Production domains
        "https://front-spot-line.vercel.app",
        "https://admin-spotline.vercel.app",
        "https://lhjwork-backend-spotline.onrender.com",
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-session-id", "Accept", "Origin", "X-Requested-With"],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001", 
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004", // 관리자 페이지
    "http://localhost:4000",
    "http://localhost:5173",
    "https://front-spot-line.vercel.app",
    "https://admin-spotline.vercel.app",
    "https://lhjwork-backend-spotline.onrender.com",
  ];
  
  if (!origin || allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS,PATCH");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,x-session-id,Accept,Origin,X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours
  }
  
  res.sendStatus(200);
});

// MongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline")
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err: Error) => console.error("MongoDB 연결 실패:", err));

// S3 설정 검증
try {
  validateS3Config();
  console.log("S3 설정 검증 완료");
} catch (error) {
  console.warn("S3 설정 오류:", error instanceof Error ? error.message : "알 수 없는 오류");
  console.warn("이미지 업로드 기능이 비활성화됩니다.");
}

// Add CORS debugging middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${origin || 'none'}`);
  next();
});

// Handle double /api/ paths (frontend misconfiguration)
app.use("/api/api/*", (req, res, next) => {
  const correctedPath = req.originalUrl.replace("/api/api/", "/api/");
  console.log(`Redirecting double API path: ${req.originalUrl} → ${correctedPath}`);
  return res.redirect(301, correctedPath);
});

// Routes - 새로운 아키텍처 (시스템 분리)
app.use("/api/demo", demoRouter); // 데모 시스템 V2.0 (시연용 고정 데이터)
app.use("/api/live", liveRouter); // Live 시스템 V1.0 (실제 서비스 운영)
app.use("/api/production", productionRouter); // 실제 운영 데이터 (호환성 유지)
app.use("/api/qr", qrRouter); // QR 코드 관리 (통합)

// 기존 호환성 유지
app.use("/api/stores", storesRouter); // 기존 API 호환성 (Store 데이터)

// 기타 API
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/admin", adminMainRouter); // 통합 어드민 API
app.use("/api/admin/stores", imageRouter); // 이미지 업로드 API
app.use("/api/experience", experienceRouter);
app.use("/api/geocoding", geocodingRouter);

// Swagger 문서
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Spotline API Documentation",
  })
);

// 메인 페이지
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Spotline API Server</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 3rem;
                box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
                border: 1px solid rgba(255, 255, 255, 0.18);
                max-width: 600px;
                width: 90%;
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, #fff, #f0f0f0);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            .status {
                display: inline-block;
                background: #4CAF50;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                margin-bottom: 2rem;
                font-weight: bold;
            }
            .links {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 2rem;
            }
            .link-btn {
                display: inline-block;
                padding: 1rem 2rem;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                border-radius: 10px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.3);
                font-weight: 500;
            }
            .link-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            }
            .api-info {
                margin-top: 2rem;
                padding: 1.5rem;
                background: rgba(0, 0, 0, 0.1);
                border-radius: 10px;
                text-align: left;
            }
            .endpoint {
                margin: 0.5rem 0;
                font-family: 'Courier New', monospace;
                background: rgba(0, 0, 0, 0.2);
                padding: 0.5rem;
                border-radius: 5px;
                font-size: 0.9rem;
            }
            .version {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: rgba(0, 0, 0, 0.2);
                padding: 0.5rem 1rem;
                border-radius: 15px;
                font-size: 0.8rem;
            }
        </style>
    </head>
    <body>
        <div class="version">v2.0.0-ts</div>
        <div class="container">
            <h1>🎯 Spotline</h1>
            <p class="subtitle">QR 기반 로컬 연결 서비스 (TypeScript)</p>
            <div class="status">🟢 서버 실행 중</div>
            
            <div class="links">
                <a href="/api-docs" class="link-btn">📚 API 문서</a>
                <a href="/health" class="link-btn">💚 상태 확인</a>
                <a href="/api" class="link-btn">ℹ️ API 정보</a>
            </div>
            
            <div class="api-info">
                <h3>🔗 주요 엔드포인트</h3>
                <div class="endpoint">GET /api/demo/store - 데모 시스템 V2.0 (시연용)</div>
                <div class="endpoint">GET /api/live/stores - Live 시스템 V1.0 (실제 서비스)</div>
                <div class="endpoint">GET /api/admin/* - 통합 어드민 API (인증 필요)</div>
                <div class="endpoint">GET /api/stores - 매장 목록 (호환성 유지)</div>
                <div class="endpoint">GET /api/recommendations - 추천 목록</div>
                <div class="endpoint">GET /api/analytics - 분석 데이터</div>
                <div class="endpoint">GET /health - 서버 상태</div>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check
app.get("/health", (req: Request, res: Response) => {
  const koreanTime = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  res.json({
    status: "OK",
    message: "Spotline API is running (TypeScript)",
    timestamp: new Date().toISOString(),
    koreanTime: koreanTime,
    timezone: "Asia/Seoul (KST, UTC+9)",
    version: "2.0.0-ts",
  });
});

// API 정보
app.get("/api", (req: Request, res: Response) => {
  res.json({
    name: "Spotline API",
    version: "2.0.0-ts",
    description: "QR 기반 로컬 연결 서비스 (TypeScript)",
    architecture: {
      demo: {
        description: "데모 시스템 V2.0 (시연용 고정 데이터)",
        endpoint: "/api/demo",
        purpose: "업주 소개용 데모 (어드민 관리 가능)",
        dataSource: "file-based"
      },
      live: {
        description: "Live 시스템 V1.0 (실제 서비스 운영)",
        endpoint: "/api/live",
        purpose: "실제 매장 서비스 (DB 기반, 인증 필요)",
        dataSource: "database"
      },
      stores: {
        description: "매장 데이터 관리 (호환성 유지)",
        endpoint: "/api/stores",
        purpose: "기존 API 호환성 유지",
        status: "legacy"
      }
    },
    endpoints: {
      demo: "/api/demo",
      live: "/api/live",
      stores: "/api/stores",
      production: "/api/production", // 호환성 유지
      recommendations: "/api/recommendations",
      analytics: "/api/analytics",
      admin: "/api/admin", // 통합 어드민 API
      geocoding: "/api/geocoding",
    },
  });
});

// 404 handler
app.use("*", notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Spotline 서버가 포트 ${PORT}에서 실행 중입니다 (TypeScript)`);
  console.log(`API 문서: http://localhost:${PORT}/api-docs`);
});

export default app;

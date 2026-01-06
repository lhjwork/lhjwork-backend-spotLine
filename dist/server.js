"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const errorHandler_1 = require("@/middleware/errorHandler");
const swagger_1 = require("@/config/swagger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
mongoose_1.default
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/spotline")
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err));
const stores_1 = __importDefault(require("@/routes/stores"));
const recommendations_1 = __importDefault(require("@/routes/recommendations"));
const analytics_1 = __importDefault(require("@/routes/analytics"));
const admin_1 = __importDefault(require("@/routes/admin"));
const geocoding_1 = __importDefault(require("@/routes/geocoding"));
app.use("/api/stores", stores_1.default);
app.use("/api/recommendations", recommendations_1.default);
app.use("/api/analytics", analytics_1.default);
app.use("/api/admin", admin_1.default);
app.use("/api/geocoding", geocoding_1.default);
app.use("/api-docs", swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Spotline API Documentation",
}));
app.get("/", (req, res) => {
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
                <div class="endpoint">GET /api/stores - 매장 목록</div>
                <div class="endpoint">GET /api/recommendations - 추천 목록</div>
                <div class="endpoint">GET /api/analytics - 분석 데이터</div>
                <div class="endpoint">POST /api/admin/login - 관리자 로그인</div>
                <div class="endpoint">GET /health - 서버 상태</div>
            </div>
        </div>
    </body>
    </html>
  `);
});
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        message: "Spotline API is running (TypeScript)",
        timestamp: new Date().toISOString(),
        version: "2.0.0-ts",
    });
});
app.get("/api", (req, res) => {
    res.json({
        name: "Spotline API",
        version: "2.0.0-ts",
        description: "QR 기반 로컬 연결 서비스 (TypeScript)",
        endpoints: {
            stores: "/api/stores",
            recommendations: "/api/recommendations",
            analytics: "/api/analytics",
            admin: "/api/admin",
            geocoding: "/api/geocoding",
        },
    });
});
app.use("*", errorHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Spotline 서버가 포트 ${PORT}에서 실행 중입니다 (TypeScript)`);
    console.log(`API 문서: http://localhost:${PORT}/api-docs`);
});
exports.default = app;
//# sourceMappingURL=server.js.map
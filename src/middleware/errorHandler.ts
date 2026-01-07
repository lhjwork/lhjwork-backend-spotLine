import { Request, Response, NextFunction } from "express";
import { HTTP_STATUS } from "../utils/constants";

// 에러 타입 정의
interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
  status?: number;
  stack?: string;
}

// 전역 에러 핸들링 미들웨어
export const errorHandler = (err: MongoError, req: Request, res: Response, next: NextFunction): void => {
  console.error("Error:", err);

  // MongoDB 중복 키 에러
  if (err.code === 11000 && err.keyValue) {
    const field = Object.keys(err.keyValue)[0];
    if (field) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: `${field} 값이 이미 존재합니다: ${err.keyValue[field]}`,
      });
      return;
    }
  }

  // MongoDB 검증 에러
  if (err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).map((e) => e.message);
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "데이터 검증 실패",
      details: errors,
    });
    return;
  }

  // MongoDB ObjectId 에러
  if (err.name === "CastError") {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: "잘못된 ID 형식입니다",
    });
    return;
  }

  // JWT 에러
  if (err.name === "JsonWebTokenError") {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: "유효하지 않은 토큰입니다",
    });
    return;
  }

  if (err.name === "TokenExpiredError") {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: "토큰이 만료되었습니다",
    });
    return;
  }

  // 기본 서버 에러
  const status = err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || "서버 내부 오류가 발생했습니다";

  const errorResponse: any = { error: message };

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === "development" && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(status).json(errorResponse);
};

// 404 핸들러
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: `요청한 엔드포인트를 찾을 수 없습니다: ${req.method} ${req.path}`,
  });
};

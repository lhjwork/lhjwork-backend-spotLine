import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import { authConfig, isAuthEnabled, isDevelopmentBypass } from "../config/auth";

// JWT 페이로드 인터페이스
interface JWTPayload {
  id: string;
  email: string;
  role: 'owner' | 'admin';
  storeIds?: string[];
  iat?: number;
  exp?: number;
}

// Request 인터페이스 확장
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * 조건부 인증 미들웨어 생성기
 * 설정에 따라 인증을 활성화/비활성화할 수 있습니다.
 */
export const createConditionalAuth = (system: 'demo' | 'live' | 'admin', action: 'read' | 'create' | 'update' | 'delete') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 개발 모드 우회 확인 (어드민 제외)
      if (isDevelopmentBypass(system)) {
        console.log(`[AUTH] Development bypass enabled for ${system}:${action}`);
        next();
        return;
      }

      // 인증이 비활성화된 경우 통과 (어드민 제외)
      if (!isAuthEnabled(system, action)) {
        console.log(`[AUTH] Authentication disabled for ${system}:${action}`);
        next();
        return;
      }

      // 인증이 활성화된 경우 토큰 검증
      console.log(`[AUTH] Authentication required for ${system}:${action}`);
      
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          formatResponse(
            false,
            authConfig.messages.noToken,
            null,
            HTTP_STATUS.UNAUTHORIZED,
            {
              system,
              action,
              authRequired: true,
              tokenType: "Bearer"
            }
          )
        );
        return;
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : authHeader;

      if (!token) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          formatResponse(
            false,
            authConfig.messages.invalidToken,
            null,
            HTTP_STATUS.UNAUTHORIZED,
            {
              system,
              action,
              expectedFormat: "Bearer <token>"
            }
          )
        );
        return;
      }

      // JWT 토큰 검증
      const decoded = jwt.verify(token, authConfig.jwt.secret) as JWTPayload;
      
      // 어드민 시스템의 경우 관리자 권한 확인
      if (system === 'admin' && decoded.role !== 'admin') {
        res.status(HTTP_STATUS.FORBIDDEN).json(
          formatResponse(
            false,
            authConfig.messages.adminOnly,
            null,
            HTTP_STATUS.FORBIDDEN,
            {
              system,
              action,
              requiredRole: "admin",
              currentRole: decoded.role
            }
          )
        );
        return;
      }
      
      // 토큰 만료 확인
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          formatResponse(
            false,
            authConfig.messages.expiredToken,
            null,
            HTTP_STATUS.UNAUTHORIZED,
            {
              system,
              action,
              expired: true,
              expiredAt: new Date(decoded.exp * 1000).toISOString()
            }
          )
        );
        return;
      }

      // 사용자 정보를 request에 추가
      req.user = decoded;
      
      console.log(`[AUTH] User authenticated for ${system}:${action} - ID: ${decoded.id}, Role: ${decoded.role}`);
      
      next();
    } catch (error) {
      console.error(`[AUTH] Authentication error for ${system}:${action}:`, error);
      
      let errorMessage = authConfig.messages.invalidToken;
      let errorDetails: any = { system, action };

      if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = authConfig.messages.invalidToken;
        errorDetails.jwtError = error.message;
      } else if (error instanceof jwt.TokenExpiredError) {
        errorMessage = authConfig.messages.expiredToken;
        errorDetails.expired = true;
        errorDetails.expiredAt = error.expiredAt;
      } else if (error instanceof jwt.NotBeforeError) {
        errorMessage = "토큰이 아직 유효하지 않습니다.";
        errorDetails.notBefore = error.date;
      }

      res.status(HTTP_STATUS.UNAUTHORIZED).json(
        formatResponse(
          false,
          errorMessage,
          null,
          HTTP_STATUS.UNAUTHORIZED,
          errorDetails
        )
      );
    }
  };
};

/**
 * Demo 시스템용 인증 미들웨어들
 */
export const demoAuth = {
  read: createConditionalAuth('demo', 'read'),
  create: createConditionalAuth('demo', 'create'),
  update: createConditionalAuth('demo', 'update'),
  delete: createConditionalAuth('demo', 'delete')
};

/**
 * Live 시스템용 인증 미들웨어들
 */
export const liveAuth = {
  read: createConditionalAuth('live', 'read'),     // 항상 인증 불필요
  create: createConditionalAuth('live', 'create'), // 나중에 인증 필요
  update: createConditionalAuth('live', 'update'), // 나중에 인증 필요
  delete: createConditionalAuth('live', 'delete')  // 나중에 인증 필요
};

/**
 * 어드민 시스템용 인증 미들웨어들 (항상 인증 필요)
 */
export const adminAuth = {
  read: createConditionalAuth('admin', 'read'),     // 항상 인증 필요
  create: createConditionalAuth('admin', 'create'), // 항상 인증 필요
  update: createConditionalAuth('admin', 'update'), // 항상 인증 필요
  delete: createConditionalAuth('admin', 'delete')  // 항상 인증 필요
};

/**
 * 특정 매장 소유권 확인 미들웨어
 * 매장별 권한이 필요한 API에 사용 (나중에 활성화)
 */
export const createStoreOwnerAuth = (storeIdParam: string = 'storeId') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 기본 인증이 비활성화된 경우 통과
      if (!authConfig.live.enabled) {
        console.log(`[AUTH] Store owner auth disabled`);
        next();
        return;
      }

      // 먼저 기본 인증 확인
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json(
          formatResponse(
            false,
            authConfig.messages.noToken,
            null,
            HTTP_STATUS.UNAUTHORIZED
          )
        );
        return;
      }

      // 요청된 매장 ID 추출
      const requestedStoreId = req.params[storeIdParam] || req.body.storeId;
      
      if (!requestedStoreId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(
          formatResponse(
            false,
            "매장 ID가 필요합니다.",
            null,
            HTTP_STATUS.BAD_REQUEST
          )
        );
        return;
      }

      // 관리자는 모든 매장 접근 가능
      if (req.user.role === 'admin') {
        console.log(`[AUTH] Admin access granted - StoreId: ${requestedStoreId}`);
        next();
        return;
      }

      // 매장주의 경우 소유 매장만 접근 가능
      if (!req.user.storeIds || !req.user.storeIds.includes(requestedStoreId)) {
        res.status(HTTP_STATUS.FORBIDDEN).json(
          formatResponse(
            false,
            authConfig.messages.insufficientPermission,
            null,
            HTTP_STATUS.FORBIDDEN,
            {
              requestedStoreId,
              ownedStores: req.user.storeIds?.length || 0
            }
          )
        );
        return;
      }

      console.log(`[AUTH] Store owner access granted - StoreId: ${requestedStoreId}, Owner: ${req.user.id}`);
      next();
    } catch (error) {
      console.error("Store owner auth error:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        formatResponse(
          false,
          "권한 확인 중 오류가 발생했습니다.",
          null,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        )
      );
    }
  };
};

/**
 * 토큰 생성 유틸리티 함수
 */
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const options: jwt.SignOptions = { 
    expiresIn: authConfig.jwt.expiresIn
  };
  return jwt.sign(payload, authConfig.jwt.secret, options);
};

/**
 * 토큰 검증 유틸리티 함수
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    return jwt.verify(token, authConfig.jwt.secret) as JWTPayload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
};

/**
 * 토큰 갱신 유틸리티 함수
 */
export const refreshToken = (oldToken: string): string | null => {
  try {
    const decoded = verifyToken(oldToken);
    if (!decoded) return null;

    // 새 토큰 생성 (iat, exp 제외)
    const { iat, exp, ...payload } = decoded;
    return generateToken(payload);
  } catch (error) {
    console.error("Token refresh error:", error);
    return null;
  }
};

// 하위 호환성을 위한 기존 함수들 (Deprecated)
export const ownerAuth = liveAuth.create; // 기존 코드 호환성
export const generateOwnerToken = generateToken;
export const verifyOwnerToken = verifyToken;
export const refreshOwnerToken = refreshToken;
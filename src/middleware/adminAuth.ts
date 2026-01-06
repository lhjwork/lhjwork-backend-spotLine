import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import { AuthenticatedRequest, JwtPayload } from "@/types";
import { HTTP_STATUS } from "@/utils/constants";

// JWT 토큰 검증 미들웨어
export const authenticateAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "액세스 토큰이 필요합니다" });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "spotline-admin-secret") as JwtPayload;

    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin || !admin.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "유효하지 않은 토큰입니다" });
      return;
    }

    req.admin = {
      adminId: admin._id.toString(),
      type: "admin",
    };

    next();
  } catch (error) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "토큰 검증에 실패했습니다" });
  }
};

// 권한 확인 미들웨어 (향후 확장용)
export const checkPermission = (resource: string, action: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // 현재는 기본 구현, 향후 권한 시스템 확장 시 사용
    next();
  };
};

// 역할 기반 접근 제어
export const requireRole = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: "인증이 필요합니다" });
        return;
      }

      const admin = await Admin.findById(req.admin.adminId);

      if (!admin || !roles.includes(admin.role)) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ error: "접근 권한이 없습니다" });
        return;
      }

      next();
    } catch (error) {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: "권한 확인 중 오류가 발생했습니다" });
    }
  };
};

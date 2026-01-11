import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import { formatResponse } from "../utils/responseFormatter";
import { AuthenticatedRequest, LoginRequest, CreateAdminRequest } from "../types";
import { HTTP_STATUS, JWT_CONFIG } from "../utils/constants";

// JWT 토큰 생성
const generateToken = (adminId: string): string => {
  return jwt.sign({ adminId, type: "admin" }, process.env.JWT_SECRET || "spotline-admin-secret", { expiresIn: JWT_CONFIG.EXPIRES_IN });
};

// 관리자 로그인
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    console.log("🔐 로그인 시도:", { username, passwordLength: password?.length });

    // 입력 검증
    if (!username || !password) {
      console.log("❌ 입력 검증 실패: 사용자명 또는 비밀번호 누락");
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "사용자명과 비밀번호를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 관리자 찾기 (username 또는 email로 로그인 가능)
    const admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
      isActive: true,
    });

    console.log("👤 관리자 조회 결과:", admin ? { id: admin._id, username: admin.username, email: admin.email, isActive: admin.isActive } : "없음");

    if (!admin) {
      console.log("❌ 관리자를 찾을 수 없음");
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "잘못된 로그인 정보입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // 비밀번호 검증
    console.log("🔑 비밀번호 검증 시작...");
    const isPasswordValid = await admin.comparePassword(password);
    console.log("🔑 비밀번호 검증 결과:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ 비밀번호 불일치");
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "잘못된 로그인 정보입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // 마지막 로그인 시간 업데이트
    admin.lastLogin = new Date();
    await admin.save();

    // JWT 토큰 생성
    const token = generateToken(admin._id.toString());

    // 응답 데이터 (비밀번호 제외)
    const adminData = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      lastLogin: admin.lastLogin,
    };

    console.log("✅ 로그인 성공:", { adminId: admin._id, username: admin.username });

    res.json(
      formatResponse(true, "로그인 성공", {
        admin: adminData,
        token,
        expiresIn: JWT_CONFIG.EXPIRES_IN,
      })
    );
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자 정보 조회
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const admin = await Admin.findById(req.admin.adminId).select("-password");

    if (!admin) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "관리자를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "프로필 조회 성공", admin));
  } catch (error) {
    console.error("Get admin profile error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자 생성 (초기 설정용)
export const createAdmin = async (req: Request<{}, {}, CreateAdminRequest>, res: Response): Promise<void> => {
  try {
    const { username, email, password, role = "admin" } = req.body;

    // 입력 검증
    if (!username || !email || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "모든 필드를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 중복 확인
    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email }],
    });

    if (existingAdmin) {
      res.status(HTTP_STATUS.CONFLICT).json(formatResponse(false, "이미 존재하는 사용자명 또는 이메일입니다.", null, HTTP_STATUS.CONFLICT));
      return;
    }

    // 관리자 생성
    const admin = new Admin({
      username,
      email,
      password,
      role,
    });

    await admin.save();

    // 응답 데이터 (비밀번호 제외)
    const adminData = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
    };

    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "관리자 계정이 생성되었습니다.", adminData));
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자 목록 조회
export const getAdminList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // super_admin만 관리자 목록 조회 가능
    const currentAdmin = await Admin.findById(req.admin.adminId);
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      res.status(HTTP_STATUS.FORBIDDEN).json(formatResponse(false, "권한이 없습니다.", null, HTTP_STATUS.FORBIDDEN));
      return;
    }

    const { page = 1, limit = 20, role, isActive } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // 필터 조건 구성
    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const admins = await Admin.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Admin.countDocuments(filter);

    res.json(
      formatResponse(true, "관리자 목록 조회 성공", {
        admins,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (error) {
    console.error("Get admin list error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 관리자 권한 업데이트
export const updatePermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // super_admin만 권한 변경 가능
    const currentAdmin = await Admin.findById(req.admin.adminId);
    if (!currentAdmin || currentAdmin.role !== "super_admin") {
      res.status(HTTP_STATUS.FORBIDDEN).json(formatResponse(false, "권한이 없습니다.", null, HTTP_STATUS.FORBIDDEN));
      return;
    }

    const { adminId } = req.params;
    const { role, isActive } = req.body;

    // 자기 자신의 권한은 변경할 수 없음
    if (adminId === req.admin.adminId) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "자신의 권한은 변경할 수 없습니다.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const updateData: any = {};
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updateData, { new: true }).select("-password");

    if (!updatedAdmin) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "관리자를 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "관리자 권한이 업데이트되었습니다.", updatedAdmin));
  } catch (error) {
    console.error("Update permissions error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 토큰 검증
export const verifyToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "유효하지 않은 토큰입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const admin = await Admin.findById(req.admin.adminId).select("-password");

    if (!admin || !admin.isActive) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "유효하지 않은 토큰입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    res.json(formatResponse(true, "토큰이 유효합니다.", { admin }));
  } catch (error) {
    console.error("Verify token error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

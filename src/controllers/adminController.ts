import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "@/models/Admin";
import { formatResponse } from "@/utils/responseFormatter";
import { AuthenticatedRequest, LoginRequest, CreateAdminRequest } from "@/types";
import { HTTP_STATUS, JWT_CONFIG } from "@/utils/constants";

// JWT 토큰 생성
const generateToken = (adminId: string): string => {
  return jwt.sign({ adminId, type: "admin" }, process.env.JWT_SECRET || "spotline-admin-secret", { expiresIn: JWT_CONFIG.EXPIRES_IN });
};

// 관리자 로그인
export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "사용자명과 비밀번호를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 관리자 찾기 (username 또는 email로 로그인 가능)
    const admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
      isActive: true,
    });

    if (!admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "잘못된 로그인 정보입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // 비밀번호 검증
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
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

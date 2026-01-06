import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import Store from "../models/Store";
import Recommendation from "../models/Recommendation";
import Analytics from "../models/Analytics";
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
    console.log('Admin login attempt:', { username: req.body.username, hasPassword: !!req.body.password });
    
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      console.log('Login failed: Missing credentials');
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "사용자명과 비밀번호를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 관리자 찾기 (username 또는 email로 로그인 가능)
    const admin = await Admin.findOne({
      $or: [{ username: username }, { email: username }],
      isActive: true,
    });

    if (!admin) {
      console.log('Login failed: Admin not found for username:', username);
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "잘못된 로그인 정보입니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    console.log('Admin found:', { id: admin._id, username: admin.username });

    // 비밀번호 검증
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Login failed: Invalid password for username:', username);
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

    console.log('Login successful for username:', username);
    
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

// ==================== 매장 관리 API ====================

// 매장 목록 조회 (관리자용)
export const getStores = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const category = req.query.category as string || '';
    const status = req.query.status as string || '';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const searchConditions: any = {};
    
    if (search) {
      searchConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      searchConditions.category = category;
    }
    
    if (status) {
      searchConditions.isActive = status === 'active';
    }

    const [stores, total] = await Promise.all([
      Store.find(searchConditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Store.countDocuments(searchConditions)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json(formatResponse(true, "매장 목록 조회 성공", {
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }));
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장 상세 조회
export const getStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const store = await Store.findById(id);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장 상세 조회 성공", store));
  } catch (error) {
    console.error("Get store error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장 생성
export const createStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, category, address, coordinates, phone, description, operatingHours, images } = req.body;

    // 입력 검증
    if (!name || !category || !address || !coordinates) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "필수 필드를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 좌표 검증
    if (!coordinates.lat || !coordinates.lng) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "올바른 좌표를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    const store = new Store({
      name,
      category,
      address,
      coordinates,
      phone,
      description,
      operatingHours,
      images: images || []
    });

    await store.save();

    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "매장이 생성되었습니다.", store));
  } catch (error) {
    console.error("Create store error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장 수정
export const updateStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const store = await Store.findByIdAndUpdate(id, updateData, { new: true });

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "매장이 수정되었습니다.", store));
  } catch (error) {
    console.error("Update store error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장 삭제
export const deleteStore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const store = await Store.findByIdAndDelete(id);

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "매장을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 관련 추천도 삭제
    await Recommendation.deleteMany({
      $or: [{ fromStore: id }, { toStore: id }]
    });

    res.json(formatResponse(true, "매장이 삭제되었습니다.", null));
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// ==================== 추천 관리 API ====================

// 추천 목록 조회 (관리자용)
export const getRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const fromStore = req.query.fromStore as string || '';
    const toStore = req.query.toStore as string || '';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const searchConditions: any = {};
    
    if (fromStore) {
      searchConditions.fromStore = fromStore;
    }
    
    if (toStore) {
      searchConditions.toStore = toStore;
    }

    const [recommendations, total] = await Promise.all([
      Recommendation.find(searchConditions)
        .populate('fromStore', 'name category location.address')
        .populate('toStore', 'name category location.address')
        .sort({ priority: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Recommendation.countDocuments(searchConditions)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json(formatResponse(true, "추천 목록 조회 성공", {
      recommendations,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    }));
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 추천 상세 조회
export const getRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const recommendation = await Recommendation.findById(id)
      .populate('fromStore')
      .populate('toStore');

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천 상세 조회 성공", recommendation));
  } catch (error) {
    console.error("Get recommendation error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 추천 생성
export const createRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { fromStore, toStore, category, priority, description, tags } = req.body;

    // 입력 검증
    if (!fromStore || !toStore || !category) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "필수 필드를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 매장 존재 확인
    const [fromStoreDoc, toStoreDoc] = await Promise.all([
      Store.findById(fromStore),
      Store.findById(toStore)
    ]);

    if (!fromStoreDoc || !toStoreDoc) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "존재하지 않는 매장입니다.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 중복 추천 확인
    const existingRecommendation = await Recommendation.findOne({
      fromStore,
      toStore,
      category
    });

    if (existingRecommendation) {
      res.status(HTTP_STATUS.CONFLICT).json(formatResponse(false, "이미 존재하는 추천입니다.", null, HTTP_STATUS.CONFLICT));
      return;
    }

    const recommendation = new Recommendation({
      fromStore,
      toStore,
      category,
      priority: priority || 1,
      description,
      tags: tags || []
    });

    await recommendation.save();

    // populate해서 반환
    const populatedRecommendation = await Recommendation.findById(recommendation._id)
      .populate('fromStore', 'name category location.address')
      .populate('toStore', 'name category location.address');

    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "추천이 생성되었습니다.", populatedRecommendation));
  } catch (error) {
    console.error("Create recommendation error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 추천 수정
export const updateRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const recommendation = await Recommendation.findByIdAndUpdate(id, updateData, { new: true })
      .populate('fromStore', 'name category location.address')
      .populate('toStore', 'name category location.address');

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천이 수정되었습니다.", recommendation));
  } catch (error) {
    console.error("Update recommendation error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 추천 삭제
export const deleteRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const recommendation = await Recommendation.findByIdAndDelete(id);

    if (!recommendation) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "추천을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "추천이 삭제되었습니다.", null));
  } catch (error) {
    console.error("Delete recommendation error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// ==================== 분석 및 통계 API ====================

// 대시보드 통계 조회
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalStores,
      activeStores,
      totalRecommendations,
      activeRecommendations,
      recentAnalytics
    ] = await Promise.all([
      Store.countDocuments(),
      Store.countDocuments({ isActive: true }),
      Recommendation.countDocuments(),
      Recommendation.countDocuments({ isActive: true }),
      Analytics.find().sort({ createdAt: -1 }).limit(10)
    ]);

    const stats = {
      stores: {
        total: totalStores,
        active: activeStores,
        inactive: totalStores - activeStores
      },
      recommendations: {
        total: totalRecommendations,
        active: activeRecommendations,
        inactive: totalRecommendations - activeRecommendations
      },
      recentActivity: recentAnalytics
    };

    res.json(formatResponse(true, "대시보드 통계 조회 성공", stats));
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 매장별 통계 조회
export const getStoreAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const storeId = req.query.storeId as string;
    const period = req.query.period as string || 'month';

    // 기간별 날짜 계산
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // month
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const matchConditions: any = {
      createdAt: { $gte: startDate }
    };

    if (storeId) {
      matchConditions.storeId = storeId;
    }

    const analytics = await Analytics.find(matchConditions)
      .populate('storeId', 'name category')
      .sort({ createdAt: -1 });

    res.json(formatResponse(true, "매장별 통계 조회 성공", {
      period,
      startDate,
      endDate: now,
      analytics
    }));
  } catch (error) {
    console.error("Get store analytics error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};
import { Request, Response } from "express";
import ExperienceConfig from "../models/ExperienceConfig";
import Store from "../models/Store";
import { formatResponse } from "../utils/responseFormatter";
import { AuthenticatedRequest, CreateExperienceConfigRequest, UpdateExperienceConfigRequest } from "../types";
import { HTTP_STATUS } from "../utils/constants";

// 모든 체험 설정 조회
export const getAllExperienceConfigs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active } = req.query;

    const filter: any = {};
    if (active !== undefined) {
      filter.isActive = active === "true";
    }

    const configs = await ExperienceConfig.find(filter).populate("createdBy", "username email").populate("updatedBy", "username email").sort({ priority: -1, createdAt: -1 });

    res.json(formatResponse(true, "체험 설정 목록 조회 성공", configs));
  } catch (error) {
    console.error("Get experience configs error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 특정 체험 설정 조회
export const getExperienceConfigById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const config = await ExperienceConfig.findById(id).populate("createdBy", "username email").populate("updatedBy", "username email");

    if (!config) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "체험 설정을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    res.json(formatResponse(true, "체험 설정 조회 성공", config));
  } catch (error) {
    console.error("Get experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 기본 체험 설정 조회
export const getDefaultExperienceConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await ExperienceConfig.findOne({
      isActive: true,
      isDefault: true,
    }).populate("createdBy", "username email");

    if (!config) {
      // 기본 설정이 없으면 우선순위가 가장 높은 활성 설정 반환
      const fallbackConfig = await ExperienceConfig.findOne({
        isActive: true,
      }).sort({ priority: -1, createdAt: -1 });

      if (!fallbackConfig) {
        res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "사용 가능한 체험 설정이 없습니다.", null, HTTP_STATUS.NOT_FOUND));
        return;
      }

      res.json(formatResponse(true, "기본 체험 설정 조회 성공 (대체)", fallbackConfig));
      return;
    }

    res.json(formatResponse(true, "기본 체험 설정 조회 성공", config));
  } catch (error) {
    console.error("Get default experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 체험 설정 생성
export const createExperienceConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, type, isDefault, settings, priority } = req.body as CreateExperienceConfigRequest;

    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    // 입력 검증
    if (!name || !type || !settings) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "필수 필드를 입력해주세요.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // QR 코드 ID 유효성 검증
    const allQrIds = await getAllQrIdsFromSettings(settings);
    if (allQrIds.length > 0) {
      const validStores = await Store.find({
        "qrCode.id": { $in: allQrIds },
        isActive: true,
      }).select("qrCode.id");

      const validQrIds = validStores.map((store) => store.qrCode.id);
      const invalidQrIds = allQrIds.filter((qrId) => !validQrIds.includes(qrId));

      if (invalidQrIds.length > 0) {
        res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, `유효하지 않은 QR 코드 ID: ${invalidQrIds.join(", ")}`, null, HTTP_STATUS.BAD_REQUEST));
        return;
      }
    }

    const config = new ExperienceConfig({
      name,
      description,
      type,
      isDefault: isDefault || false,
      settings,
      priority: priority || 0,
      createdBy: req.admin.adminId,
    });

    await config.save();

    const populatedConfig = await ExperienceConfig.findById(config._id).populate("createdBy", "username email");

    res.status(HTTP_STATUS.CREATED).json(formatResponse(true, "체험 설정이 생성되었습니다.", populatedConfig));
  } catch (error) {
    console.error("Create experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 체험 설정 수정
export const updateExperienceConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body as UpdateExperienceConfigRequest;

    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const config = await ExperienceConfig.findById(id);
    if (!config) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "체험 설정을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // QR 코드 ID 유효성 검증 (settings가 업데이트되는 경우)
    if (updateData.settings) {
      const allQrIds = await getAllQrIdsFromSettings(updateData.settings);
      if (allQrIds.length > 0) {
        const validStores = await Store.find({
          "qrCode.id": { $in: allQrIds },
          isActive: true,
        }).select("qrCode.id");

        const validQrIds = validStores.map((store) => store.qrCode.id);
        const invalidQrIds = allQrIds.filter((qrId) => !validQrIds.includes(qrId));

        if (invalidQrIds.length > 0) {
          res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, `유효하지 않은 QR 코드 ID: ${invalidQrIds.join(", ")}`, null, HTTP_STATUS.BAD_REQUEST));
          return;
        }
      }
    }

    // 업데이트 데이터 적용
    Object.assign(config, updateData);
    config.updatedBy = req.admin.adminId as any;
    config.updatedAt = new Date();

    await config.save();

    const populatedConfig = await ExperienceConfig.findById(config._id).populate("createdBy", "username email").populate("updatedBy", "username email");

    res.json(formatResponse(true, "체험 설정이 수정되었습니다.", populatedConfig));
  } catch (error) {
    console.error("Update experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 체험 설정 삭제 (비활성화)
export const deleteExperienceConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const config = await ExperienceConfig.findById(id);
    if (!config) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "체험 설정을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    // 기본 설정인 경우 삭제 방지
    if (config.isDefault) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "기본 체험 설정은 삭제할 수 없습니다.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    config.isActive = false;
    config.updatedBy = req.admin.adminId as any;
    await config.save();

    res.json(formatResponse(true, "체험 설정이 비활성화되었습니다.", { id }));
  } catch (error) {
    console.error("Delete experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 기본 설정으로 지정
export const setAsDefault = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.admin) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json(formatResponse(false, "인증이 필요합니다.", null, HTTP_STATUS.UNAUTHORIZED));
      return;
    }

    const config = await ExperienceConfig.findById(id);
    if (!config) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "체험 설정을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    if (!config.isActive) {
      res.status(HTTP_STATUS.BAD_REQUEST).json(formatResponse(false, "비활성화된 설정은 기본 설정으로 지정할 수 없습니다.", null, HTTP_STATUS.BAD_REQUEST));
      return;
    }

    // 기존 기본 설정 해제
    await ExperienceConfig.updateMany({}, { isDefault: false });

    // 새로운 기본 설정 지정
    config.isDefault = true;
    config.updatedBy = req.admin.adminId as any;
    await config.save();

    res.json(formatResponse(true, "기본 체험 설정으로 지정되었습니다.", { id }));
  } catch (error) {
    console.error("Set as default error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 체험 설정 미리보기 (실제 선택될 매장 확인)
export const previewExperienceConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { testCount = 10 } = req.query;

    const config = await ExperienceConfig.findById(id);
    if (!config || !config.isActive) {
      res.status(HTTP_STATUS.NOT_FOUND).json(formatResponse(false, "활성화된 체험 설정을 찾을 수 없습니다.", null, HTTP_STATUS.NOT_FOUND));
      return;
    }

    const results = [];
    const count = Math.min(parseInt(testCount as string) || 10, 50); // 최대 50회

    for (let i = 0; i < count; i++) {
      const selectedQrId = await selectStoreFromConfig(config);
      results.push(selectedQrId);
    }

    // 결과 통계
    const stats = results.reduce((acc, qrId) => {
      acc[qrId] = (acc[qrId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 매장 정보 조회
    const storeInfo = await Store.find({
      "qrCode.id": { $in: Object.keys(stats) },
    }).select("name qrCode.id location.area");

    const detailedStats = Object.entries(stats)
      .map(([qrId, count]) => {
        const store = storeInfo.find((s) => s.qrCode.id === qrId);
        return {
          qrId,
          storeName: store?.name || "Unknown",
          area: store?.location.area || "Unknown",
          count,
          percentage: ((count / results.length) * 100).toFixed(1),
        };
      })
      .sort((a, b) => b.count - a.count);

    res.json(
      formatResponse(true, "체험 설정 미리보기 성공", {
        config: {
          id: config._id,
          name: config.name,
          type: config.type,
        },
        testCount: results.length,
        results: detailedStats,
        rawResults: results,
      })
    );
  } catch (error) {
    console.error("Preview experience config error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

// 유틸리티 함수들
const getAllQrIdsFromSettings = async (settings: any): Promise<string[]> => {
  const qrIds: string[] = [];

  if (settings.fixedStoreQrId) {
    qrIds.push(settings.fixedStoreQrId);
  }

  if (settings.randomStoreQrIds) {
    qrIds.push(...settings.randomStoreQrIds);
  }

  if (settings.areaSettings) {
    Object.values(settings.areaSettings).forEach((area: any) => {
      if (area.storeQrIds) {
        qrIds.push(...area.storeQrIds);
      }
    });
  }

  if (settings.weightedStores) {
    qrIds.push(...settings.weightedStores.map((ws: any) => ws.qrId));
  }

  if (settings.timeBasedSettings?.enabled) {
    const timeSettings = settings.timeBasedSettings;
    ["morning", "afternoon", "evening", "night"].forEach((period) => {
      if (timeSettings[period]?.storeQrIds) {
        qrIds.push(...timeSettings[period].storeQrIds);
      }
    });
  }

  return [...new Set(qrIds)]; // 중복 제거
};

const selectStoreFromConfig = async (config: any): Promise<string> => {
  const { type, settings } = config;

  switch (type) {
    case "fixed":
      return settings.fixedStoreQrId;

    case "random":
      const randomStores = settings.randomStoreQrIds || [];
      return randomStores[Math.floor(Math.random() * randomStores.length)];

    case "area_based":
      const enabledAreas = Object.entries(settings.areaSettings || {}).filter(([_, area]: [string, any]) => area.enabled && area.storeQrIds?.length > 0);

      if (enabledAreas.length === 0) return settings.fixedStoreQrId || "cafe_gangnam_001";

      // 가중치 기반 지역 선택
      const totalWeight = enabledAreas.reduce((sum, [_, area]: [string, any]) => sum + (area.weight || 1), 0);
      let random = Math.random() * totalWeight;

      for (const [_, area] of enabledAreas as [string, any][]) {
        random -= area.weight || 1;
        if (random <= 0) {
          const storeQrIds = area.storeQrIds;
          return storeQrIds[Math.floor(Math.random() * storeQrIds.length)];
        }
      }
      break;

    case "weighted":
      const enabledStores = (settings.weightedStores || []).filter((ws: any) => ws.enabled);

      if (enabledStores.length === 0) return settings.fixedStoreQrId || "cafe_gangnam_001";

      const totalStoreWeight = enabledStores.reduce((sum: number, ws: any) => sum + (ws.weight || 1), 0);
      let storeRandom = Math.random() * totalStoreWeight;

      for (const ws of enabledStores) {
        storeRandom -= ws.weight || 1;
        if (storeRandom <= 0) {
          return ws.qrId;
        }
      }
      break;

    default:
      return "cafe_gangnam_001"; // 기본값
  }

  return "cafe_gangnam_001"; // 폴백
};

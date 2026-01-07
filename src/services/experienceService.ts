import ExperienceConfig from "../models/ExperienceConfig";
import Store from "../models/Store";

export interface ExperienceResult {
  qrId: string;
  storeName: string;
  storeId: string;
  area: string;
  configUsed: {
    id: string;
    name: string;
    type: string;
  };
}

/**
 * 체험하기 기능을 위한 매장 선택
 */
export const selectExperienceStore = async (): Promise<ExperienceResult> => {
  try {
    // 1. 기본 체험 설정 조회
    let config = await ExperienceConfig.findOne({
      isActive: true,
      isDefault: true,
    });

    // 2. 기본 설정이 없으면 우선순위가 가장 높은 활성 설정 사용
    if (!config) {
      config = await ExperienceConfig.findOne({
        isActive: true,
      }).sort({ priority: -1, createdAt: -1 });
    }

    // 3. 설정이 없으면 기본 매장 반환
    if (!config) {
      return await getDefaultExperienceResult();
    }

    // 4. 설정에 따라 매장 선택
    const selectedQrId = await selectStoreFromConfig(config);

    // 5. 매장 정보 조회
    const store = await Store.findOne({
      "qrCode.id": selectedQrId,
      isActive: true,
    });

    if (!store) {
      return await getDefaultExperienceResult();
    }

    // 6. 사용 통계 업데이트
    await updateConfigUsage(config._id.toString());

    return {
      qrId: selectedQrId,
      storeName: store.name,
      storeId: store._id.toString(),
      area: store.location.area || "Unknown",
      configUsed: {
        id: config._id.toString(),
        name: config.name,
        type: config.type,
      },
    };
  } catch (error) {
    console.error("Experience selection error:", error);
    return await getDefaultExperienceResult();
  }
};

/**
 * 설정에 따른 매장 선택 로직
 */
const selectStoreFromConfig = async (config: any): Promise<string> => {
  const { type, settings } = config;

  try {
    switch (type) {
      case "fixed":
        return settings.fixedStoreQrId || "cafe_gangnam_001";

      case "random":
        const randomStores = settings.randomStoreQrIds || [];
        if (randomStores.length === 0) return "cafe_gangnam_001";
        return randomStores[Math.floor(Math.random() * randomStores.length)];

      case "area_based":
        return await selectFromAreaBased(settings);

      case "weighted":
        return await selectFromWeighted(settings);

      default:
        return "cafe_gangnam_001";
    }
  } catch (error) {
    console.error("Store selection error:", error);
    return "cafe_gangnam_001";
  }
};

/**
 * 지역 기반 선택
 */
const selectFromAreaBased = async (settings: any): Promise<string> => {
  const areaSettings = settings.areaSettings || {};

  // 시간대별 설정이 활성화된 경우
  if (settings.timeBasedSettings?.enabled) {
    const timeBasedQrId = selectFromTimeBased(settings.timeBasedSettings);
    if (timeBasedQrId) return timeBasedQrId;
  }

  // 활성화된 지역들 필터링
  const enabledAreas = Object.entries(areaSettings).filter(([_, area]: [string, any]) => area.enabled && area.storeQrIds && area.storeQrIds.length > 0);

  if (enabledAreas.length === 0) {
    return settings.fixedStoreQrId || "cafe_gangnam_001";
  }

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

  // 폴백
  const firstArea = enabledAreas[0][1] as any;
  return firstArea.storeQrIds[0] || "cafe_gangnam_001";
};

/**
 * 가중치 기반 선택
 */
const selectFromWeighted = async (settings: any): Promise<string> => {
  const weightedStores = settings.weightedStores || [];
  const excludeQrIds = settings.excludeStoreQrIds || [];

  // 활성화되고 제외되지 않은 매장들 필터링
  const enabledStores = weightedStores.filter((ws: any) => ws.enabled && ws.qrId && !excludeQrIds.includes(ws.qrId));

  if (enabledStores.length === 0) {
    return settings.fixedStoreQrId || "cafe_gangnam_001";
  }

  // 가중치 기반 선택
  const totalWeight = enabledStores.reduce((sum: number, ws: any) => sum + (ws.weight || 1), 0);

  let random = Math.random() * totalWeight;

  for (const ws of enabledStores) {
    random -= ws.weight || 1;
    if (random <= 0) {
      return ws.qrId;
    }
  }

  // 폴백
  return enabledStores[0].qrId || "cafe_gangnam_001";
};

/**
 * 시간대별 선택
 */
const selectFromTimeBased = (timeSettings: any): string | null => {
  const now = new Date();
  const hour = now.getHours();

  let currentPeriod: string;
  if (hour >= 6 && hour < 12) {
    currentPeriod = "morning";
  } else if (hour >= 12 && hour < 18) {
    currentPeriod = "afternoon";
  } else if (hour >= 18 && hour < 24) {
    currentPeriod = "evening";
  } else {
    currentPeriod = "night";
  }

  const periodSettings = timeSettings[currentPeriod];
  if (periodSettings && periodSettings.storeQrIds && periodSettings.storeQrIds.length > 0) {
    const storeQrIds = periodSettings.storeQrIds;
    return storeQrIds[Math.floor(Math.random() * storeQrIds.length)];
  }

  return null;
};

/**
 * 기본 체험 결과 반환
 */
const getDefaultExperienceResult = async (): Promise<ExperienceResult> => {
  const defaultQrId = "cafe_gangnam_001";

  try {
    const store = await Store.findOne({
      "qrCode.id": defaultQrId,
      isActive: true,
    });

    return {
      qrId: defaultQrId,
      storeName: store?.name || "카페 스팟라인",
      storeId: store?._id.toString() || "",
      area: store?.location.area || "강남",
      configUsed: {
        id: "default",
        name: "기본 설정",
        type: "fixed",
      },
    };
  } catch (error) {
    return {
      qrId: defaultQrId,
      storeName: "카페 스팟라인",
      storeId: "",
      area: "강남",
      configUsed: {
        id: "default",
        name: "기본 설정",
        type: "fixed",
      },
    };
  }
};

/**
 * 설정 사용 통계 업데이트
 */
const updateConfigUsage = async (configId: string): Promise<void> => {
  try {
    await ExperienceConfig.findByIdAndUpdate(configId, {
      $inc: { usageCount: 1 },
      lastUsed: new Date(),
    });
  } catch (error) {
    console.error("Config usage update error:", error);
  }
};

/**
 * 사용 가능한 매장 QR 코드 목록 조회
 */
export const getAvailableStoreQrIds = async (): Promise<string[]> => {
  try {
    const stores = await Store.find({
      isActive: true,
      "qrCode.isActive": true,
    }).select("qrCode.id");

    return stores.map((store) => store.qrCode.id);
  } catch (error) {
    console.error("Get available QR IDs error:", error);
    return ["cafe_gangnam_001", "cafe_hongdae_001"]; // 기본값
  }
};

/**
 * 지역별 매장 QR 코드 목록 조회
 */
export const getStoreQrIdsByArea = async (): Promise<Record<string, string[]>> => {
  try {
    const stores = await Store.find({
      isActive: true,
      "qrCode.isActive": true,
    }).select("qrCode.id location.area");

    const result: Record<string, string[]> = {};

    stores.forEach((store) => {
      const area = store.location.area || "unknown";
      if (!result[area]) {
        result[area] = [];
      }
      result[area].push(store.qrCode.id);
    });

    return result;
  } catch (error) {
    console.error("Get QR IDs by area error:", error);
    return {
      gangnam: ["cafe_gangnam_001"],
      hongdae: ["cafe_hongdae_001"],
    };
  }
};

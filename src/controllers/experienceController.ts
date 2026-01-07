import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";
import { selectExperienceStore, getAvailableStoreQrIds, getStoreQrIdsByArea } from "../services/experienceService";
import Analytics from "../models/Analytics";

/**
 * SpotLine 체험하기 - 매장 선택 및 리다이렉트
 */
export const getExperienceStore = async (req: Request, res: Response): Promise<void> => {
  try {
    // 체험 매장 선택
    const experienceResult = await selectExperienceStore();

    // 분석 데이터 기록 (storeId가 유효한 경우만)
    try {
      if (experienceResult.storeId && experienceResult.storeId.length === 24) {
        const analytics = new Analytics({
          qrCode: experienceResult.qrId,
          store: experienceResult.storeId,
          eventType: "page_enter",
          sessionId: req.headers["x-session-id"] || `exp_${Date.now()}`,
          referrer: req.headers.referer || "spotline_experience_button",
          metadata: {
            nextSpotId: experienceResult.configUsed.id,
          },
        });
        await analytics.save();
      } else {
        console.log("Analytics not recorded: Invalid storeId", experienceResult.storeId);
      }
    } catch (analyticsError) {
      console.error("Analytics recording error:", analyticsError);
      // 분석 데이터 기록 실패해도 체험은 계속 진행
    }

    // SpotLine 매장 페이지로 리다이렉트
    const redirectUrl = `/api/stores/spotline/${experienceResult.qrId}`;

    res.json(
      formatResponse(true, "체험 매장 선택 성공", {
        ...experienceResult,
        redirectUrl,
        timestamp: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error("Experience store selection error:", error);

    // 에러 발생 시 기본 매장으로 폴백
    const fallbackQrId = "6ccbb682-df55-4566-ac30-703ddb5cfb7f";
    const fallbackUrl = `/api/stores/spotline/${fallbackQrId}`;

    res.json(
      formatResponse(true, "기본 매장으로 안내합니다", {
        qrId: fallbackQrId,
        storeName: "카페 스팟라인",
        storeId: "",
        area: "강남",
        configUsed: {
          id: "fallback",
          name: "기본 설정",
          type: "fixed",
        },
        redirectUrl: fallbackUrl,
        timestamp: new Date().toISOString(),
      })
    );
  }
};

/**
 * 체험 가능한 매장 목록 조회
 */
export const getAvailableStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const qrIds = await getAvailableStoreQrIds();
    const storesByArea = await getStoreQrIdsByArea();

    res.json(
      formatResponse(true, "사용 가능한 매장 목록 조회 성공", {
        totalCount: qrIds.length,
        allStores: qrIds,
        byArea: storesByArea,
      })
    );
  } catch (error) {
    console.error("Get available stores error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

/**
 * 체험 통계 조회
 */
export const getExperienceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 7 } = req.query;
    const daysNum = parseInt(days as string) || 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    // 체험 관련 이벤트 조회
    const experienceEvents = await Analytics.find({
      eventType: "page_enter",
      referrer: { $regex: /spotline_experience|experience_button/i },
      timestamp: { $gte: startDate },
    }).populate("store", "name location.area qrCode.id");

    // 통계 계산
    const totalExperiences = experienceEvents.length;
    const uniqueStores = new Set(experienceEvents.map((e) => e.store.toString())).size;

    const storeStats = experienceEvents.reduce((acc: any, event: any) => {
      const storeId = event.store._id.toString();
      if (!acc[storeId]) {
        acc[storeId] = {
          storeId,
          storeName: event.store.name,
          qrId: event.store.qrCode.id,
          area: event.store.location.area,
          count: 0,
        };
      }
      acc[storeId].count++;
      return acc;
    }, {});

    const topStores = Object.values(storeStats)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10);

    // 일별 통계
    const dailyStats = experienceEvents.reduce((acc: any, event: any) => {
      const date = event.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json(
      formatResponse(true, "체험 통계 조회 성공", {
        period: `${daysNum}일`,
        totalExperiences,
        uniqueStores,
        topStores,
        dailyStats,
        averagePerDay: (totalExperiences / daysNum).toFixed(1),
      })
    );
  } catch (error) {
    console.error("Get experience stats error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(formatResponse(false, "서버 오류가 발생했습니다.", null, HTTP_STATUS.INTERNAL_SERVER_ERROR));
  }
};

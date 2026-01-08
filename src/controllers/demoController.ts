import { Request, Response } from "express";
import { DEMO_STORE, DEMO_NEXT_SPOTS, getDemoMeta } from "../data/demo";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

/**
 * GET /api/demo/store
 * 데모 매장 및 근처 Spot 조회
 */
export const getDemoStore = async (req: Request, res: Response): Promise<void> => {
  try {
    // 로딩 시뮬레이션 (실제 DB 조회하는 것처럼)
    await new Promise(resolve => setTimeout(resolve, 500));

    // 데모 데이터 응답
    const responseData = {
      store: DEMO_STORE,
      nextSpots: DEMO_NEXT_SPOTS
    };

    res.json(
      formatResponse(
        true, 
        "데모 데이터를 성공적으로 가져왔습니다.", 
        responseData,
        HTTP_STATUS.OK,
        getDemoMeta()
      )
    );

    // 데모 사용 로그 (실제 통계와 분리)
    console.log(`[DEMO] Store data requested at ${new Date().toISOString()}`);
    
  } catch (error) {
    console.error("Demo store error:", error);
    const errorMessage = error instanceof Error ? error.message : "데모 데이터를 가져올 수 없습니다";
    
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false, 
        "데모 데이터를 가져올 수 없습니다.", 
        null, 
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        { error: errorMessage }
      )
    );
  }
};

/**
 * GET /api/demo/health
 * 데모 시스템 상태 확인
 */
export const getDemoHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json(
      formatResponse(
        true,
        "데모 시스템이 정상 작동 중입니다.",
        {
          status: "healthy",
          version: "2.0",
          dataVersion: "cafe-v1",
          lastUpdated: "2024-01-08T10:00:00.000Z"
        },
        HTTP_STATUS.OK,
        getDemoMeta()
      )
    );
  } catch (error) {
    console.error("Demo health check error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "데모 시스템 상태 확인 실패",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
import { Request, Response } from "express";
import { formatResponse } from "../utils/responseFormatter";
import { HTTP_STATUS } from "../utils/constants";

// 임시 인터페이스 (실제 구현에서는 MongoDB 모델 사용)
interface LiveStore {
  storeId: string;
  name: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates: [number, number];
    city: string;
    district: string;
  };
  images: {
    representative: string;
    gallery: string[];
  };
  spotlineStory: {
    title: string;
    content: string;
    tags: string[];
  };
  status: 'pending' | 'active' | 'suspended' | 'closed';
  analytics: {
    totalViews: number;
    monthlyViews: number;
    qrScans: number;
    recommendations: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// 임시 데이터 (실제 구현에서는 MongoDB에서 조회)
const SAMPLE_LIVE_STORES: LiveStore[] = [
  {
    storeId: "live_store_001",
    name: "강남 브런치 카페",
    description: "신선한 재료로 만든 건강한 브런치와 스페셜티 커피",
    category: "cafe",
    location: {
      address: "서울시 강남구 테헤란로 152",
      coordinates: [127.0276, 37.4979],
      city: "서울시",
      district: "강남구"
    },
    images: {
      representative: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
      gallery: []
    },
    spotlineStory: {
      title: "건강한 아침을 시작하는 곳",
      content: "매일 새벽 5시부터 준비하는 신선한 재료로 건강하고 맛있는 브런치를 제공합니다.",
      tags: ["브런치", "건강식", "스페셜티커피"]
    },
    status: "active",
    analytics: {
      totalViews: 1247,
      monthlyViews: 89,
      qrScans: 156,
      recommendations: 23
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-08")
  },
  {
    storeId: "live_store_002", 
    name: "홍대 수제 베이커리",
    description: "매일 구워내는 신선한 빵과 디저트",
    category: "bakery",
    location: {
      address: "서울시 마포구 홍익로 25",
      coordinates: [126.9240, 37.5563],
      city: "서울시",
      district: "마포구"
    },
    images: {
      representative: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600&q=80",
      gallery: []
    },
    spotlineStory: {
      title: "매일 새로 굽는 행복",
      content: "전통 방식으로 발효시킨 천연 효모빵과 계절 과일을 사용한 디저트를 만나보세요.",
      tags: ["수제빵", "천연효모", "계절디저트"]
    },
    status: "active",
    analytics: {
      totalViews: 892,
      monthlyViews: 67,
      qrScans: 134,
      recommendations: 18
    },
    createdAt: new Date("2024-01-03"),
    updatedAt: new Date("2024-01-07")
  }
];

/**
 * GET /api/live/stores
 * 실제 매장 목록 조회
 */
export const getLiveStores = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      city, 
      district,
      status = 'active'
    } = req.query;

    // 필터링 로직 (실제 구현에서는 MongoDB 쿼리)
    let filteredStores = SAMPLE_LIVE_STORES.filter(store => {
      if (status && store.status !== status) return false;
      if (category && store.category !== category) return false;
      if (city && store.location.city !== city) return false;
      if (district && store.location.district !== district) return false;
      return true;
    });

    // 페이지네이션
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedStores = filteredStores.slice(startIndex, endIndex);

    res.json(
      formatResponse(
        true,
        "실제 매장 목록을 성공적으로 가져왔습니다.",
        {
          stores: paginatedStores,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: filteredStores.length,
            pages: Math.ceil(filteredStores.length / Number(limit))
          },
          filters: {
            category,
            city,
            district,
            status
          }
        },
        HTTP_STATUS.OK,
        {
          system: "live",
          dataSource: "database", // 실제로는 MongoDB
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Stores list requested - Page: ${page}, Filters: ${JSON.stringify({ category, city, district, status })}`);
  } catch (error) {
    console.error("Live stores get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "실제 매장 목록을 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * GET /api/live/stores/:storeId
 * 특정 매장 상세 조회
 */
export const getLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;

    // 매장 찾기 (실제 구현에서는 MongoDB 쿼리)
    const store = SAMPLE_LIVE_STORES.find(s => s.storeId === storeId && s.status === 'active');

    if (!store) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 조회수 증가 시뮬레이션 (실제 구현에서는 DB 업데이트)
    store.analytics.totalViews += 1;
    store.analytics.monthlyViews += 1;

    res.json(
      formatResponse(
        true,
        "매장 정보를 성공적으로 가져왔습니다.",
        store,
        HTTP_STATUS.OK,
        {
          system: "live",
          viewIncremented: true,
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Store detail requested - StoreId: ${storeId}, Views: ${store.analytics.totalViews}`);
  } catch (error) {
    console.error("Live store get error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보를 가져올 수 없습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * POST /api/live/stores
 * 새 매장 등록
 */
export const createLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const storeData = req.body;

    // 매장 ID 생성
    const storeId = `live_store_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // 새 매장 데이터 생성
    const newStore: LiveStore = {
      storeId,
      name: storeData.name,
      description: storeData.description,
      category: storeData.category,
      location: storeData.location,
      images: storeData.images || { representative: "", gallery: [] },
      spotlineStory: storeData.spotlineStory,
      status: 'active', // 바로 활성화
      analytics: {
        totalViews: 0,
        monthlyViews: 0,
        qrScans: 0,
        recommendations: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 실제 구현에서는 MongoDB에 저장
    SAMPLE_LIVE_STORES.push(newStore);

    res.status(HTTP_STATUS.CREATED).json(
      formatResponse(
        true,
        "매장이 성공적으로 등록되었습니다.",
        { 
          storeId: newStore.storeId,
          status: newStore.status
        },
        HTTP_STATUS.CREATED,
        {
          system: "live",
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] New store registered - StoreId: ${storeId}`);
  } catch (error) {
    console.error("Live store create error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 등록에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};

/**
 * PUT /api/live/stores/:storeId
 * 매장 정보 수정
 */
export const updateLiveStore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { storeId } = req.params;
    const updateData = req.body;

    // 매장 찾기
    const storeIndex = SAMPLE_LIVE_STORES.findIndex(s => s.storeId === storeId);
    if (storeIndex === -1) {
      res.status(HTTP_STATUS.NOT_FOUND).json(
        formatResponse(
          false,
          "매장을 찾을 수 없습니다.",
          null,
          HTTP_STATUS.NOT_FOUND
        )
      );
      return;
    }

    // 매장 정보 업데이트
    const updatedStore = {
      ...SAMPLE_LIVE_STORES[storeIndex],
      ...updateData,
      storeId, // 변경 불가
      updatedAt: new Date()
    };

    SAMPLE_LIVE_STORES[storeIndex] = updatedStore;

    res.json(
      formatResponse(
        true,
        "매장 정보가 성공적으로 수정되었습니다.",
        { storeId },
        HTTP_STATUS.OK,
        {
          system: "live",
          updatedFields: Object.keys(updateData),
          timestamp: new Date().toISOString()
        }
      )
    );

    console.log(`[LIVE] Store updated - StoreId: ${storeId}, Fields: ${Object.keys(updateData).join(', ')}`);
  } catch (error) {
    console.error("Live store update error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
      formatResponse(
        false,
        "매장 정보 수정에 실패했습니다.",
        null,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      )
    );
  }
};
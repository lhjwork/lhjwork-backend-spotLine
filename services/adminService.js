const Admin = require('../models/Admin');
const Store = require('../models/Store');
const Analytics = require('../models/Analytics');
const Recommendation = require('../models/Recommendation');
const jwt = require('jsonwebtoken');

class AdminService {
  // 로그인
  async login(username, password) {
    try {
      const admin = await Admin.findOne({ 
        $or: [{ username }, { email: username }],
        isActive: true 
      });

      if (!admin) {
        return { success: false, message: '계정을 찾을 수 없습니다' };
      }

      const isValidPassword = await admin.comparePassword(password);
      if (!isValidPassword) {
        return { success: false, message: '비밀번호가 올바르지 않습니다' };
      }

      // 마지막 로그인 시간 업데이트
      admin.lastLogin = new Date();
      await admin.save();

      // JWT 토큰 생성
      const token = jwt.sign(
        { 
          adminId: admin._id, 
          username: admin.username,
          role: admin.role 
        },
        process.env.JWT_SECRET || 'spotline-admin-secret',
        { expiresIn: '24h' }
      );

      return {
        success: true,
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          lastLogin: admin.lastLogin
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 대시보드 통계
  async getDashboardStats() {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // 기본 통계
      const totalStores = await Store.countDocuments({ isActive: true });
      const totalInactiveStores = await Store.countDocuments({ isActive: false });
      
      // 오늘의 QR 스캔 수
      const todayScans = await Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { $gte: yesterday }
      });

      // 어제 대비 증감
      const yesterdayScans = await Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { 
          $gte: new Date(yesterday.getTime() - 24 * 60 * 60 * 1000),
          $lt: yesterday 
        }
      });

      // 주간 통계
      const weeklyScans = await Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { $gte: weekAgo }
      });

      // 월간 통계
      const monthlyScans = await Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { $gte: monthAgo }
      });

      // 추천 클릭률
      const recommendationClicks = await Analytics.countDocuments({
        eventType: 'recommendation_click',
        timestamp: { $gte: weekAgo }
      });

      const qrScansForRecommendations = await Analytics.countDocuments({
        eventType: 'qr_scan',
        timestamp: { $gte: weekAgo }
      });

      const clickThroughRate = qrScansForRecommendations > 0 
        ? (recommendationClicks / qrScansForRecommendations * 100).toFixed(2)
        : 0;

      // 카테고리별 매장 분포
      const storesByCategory = await Store.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return {
        overview: {
          totalStores,
          totalInactiveStores,
          todayScans,
          scanGrowth: yesterdayScans > 0 ? ((todayScans - yesterdayScans) / yesterdayScans * 100).toFixed(2) : 0,
          weeklyScans,
          monthlyScans,
          clickThroughRate
        },
        storesByCategory,
        recentActivity: await this.getRecentActivity()
      };
    } catch (error) {
      throw error;
    }
  }

  // 최근 활동
  async getRecentActivity() {
    try {
      const recentEvents = await Analytics.find()
        .populate('store', 'name category')
        .populate('targetStore', 'name category')
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      return recentEvents.map(event => ({
        id: event._id,
        type: event.eventType,
        store: event.store?.name || 'Unknown',
        targetStore: event.targetStore?.name,
        timestamp: event.timestamp,
        metadata: event.metadata
      }));
    } catch (error) {
      throw error;
    }
  }

  // 어드민용 매장 목록 (페이지네이션)
  async getStoresForAdmin(options) {
    try {
      const { page, limit, category, area, search, status } = options;
      const skip = (page - 1) * limit;

      // 필터 조건 구성
      const filter = {};
      if (category) filter.category = category;
      if (area) filter['location.area'] = area;
      if (status !== undefined) filter.isActive = status === 'active';
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { 'location.address': { $regex: search, $options: 'i' } },
          { 'qrCode.id': { $regex: search, $options: 'i' } }
        ];
      }

      const stores = await Store.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Store.countDocuments(filter);

      // 각 매장의 통계 정보 추가
      const storesWithStats = await Promise.all(
        stores.map(async (store) => {
          const scanCount = await Analytics.countDocuments({
            store: store._id,
            eventType: 'qr_scan',
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          });

          return {
            ...store,
            stats: {
              monthlyScans: scanCount
            }
          };
        })
      );

      return {
        stores: storesWithStats,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 매장 상태 토글
  async toggleStoreStatus(storeId, isActive) {
    try {
      const store = await Store.findByIdAndUpdate(
        storeId,
        { isActive, updatedAt: new Date() },
        { new: true }
      );

      if (!store) {
        throw new Error('매장을 찾을 수 없습니다');
      }

      return store;
    } catch (error) {
      throw error;
    }
  }

  // 새 매장 생성
  async createStore(storeData) {
    try {
      const { v4: uuidv4 } = require('uuid');
      
      // QR 코드 ID 자동 생성
      if (!storeData.qrCode || !storeData.qrCode.id) {
        storeData.qrCode = {
          id: uuidv4(),
          isActive: true
        };
      }
      
      const store = new Store(storeData);
      await store.save();
      return store;
    } catch (error) {
      throw error;
    }
  }

  // 매장 정보 수정
  async updateStore(storeId, updateData) {
    try {
      const store = await Store.findByIdAndUpdate(
        storeId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!store) {
        throw new Error('매장을 찾을 수 없습니다');
      }

      return store;
    } catch (error) {
      throw error;
    }
  }

  // 매장 상세 조회
  async getStoreDetail(storeId) {
    try {
      const store = await Store.findById(storeId);
      
      if (!store) {
        throw new Error('매장을 찾을 수 없습니다');
      }

      // 매장 통계 추가
      const monthlyScans = await Analytics.countDocuments({
        store: storeId,
        eventType: 'qr_scan',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      const recommendationClicks = await Analytics.countDocuments({
        store: storeId,
        eventType: 'recommendation_click',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      return {
        ...store.toObject(),
        stats: {
          monthlyScans,
          recommendationClicks,
          clickThroughRate: monthlyScans > 0 ? (recommendationClicks / monthlyScans * 100).toFixed(2) : 0
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // 매장 완전 삭제
  async deleteStorePermanently(storeId) {
    try {
      // 관련 분석 데이터도 함께 삭제
      await Analytics.deleteMany({ store: storeId });
      await Recommendation.deleteMany({ 
        $or: [{ fromStore: storeId }, { toStore: storeId }] 
      });
      await Store.findByIdAndDelete(storeId);
    } catch (error) {
      throw error;
    }
  }

  // 분석 데이터 조회
  async getAnalyticsData(options) {
    try {
      const { startDate, endDate, storeId, eventType } = options;
      
      const filter = {};
      if (startDate && endDate) {
        filter.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      if (storeId) filter.store = storeId;
      if (eventType) filter.eventType = eventType;

      const analytics = await Analytics.find(filter)
        .populate('store', 'name category')
        .populate('targetStore', 'name category')
        .sort({ timestamp: -1 })
        .limit(1000);

      // 일별 집계
      const dailyStats = await Analytics.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
              eventType: "$eventType"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]);

      return {
        events: analytics,
        dailyStats
      };
    } catch (error) {
      throw error;
    }
  }

  // 인기 매장 순위
  async getPopularStores(period, limit) {
    try {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const popularStores = await Analytics.aggregate([
        {
          $match: {
            eventType: 'qr_scan',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$store',
            scanCount: { $sum: 1 },
            uniqueSessions: { $addToSet: '$sessionId' }
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: '_id',
            foreignField: '_id',
            as: 'store'
          }
        },
        { $unwind: '$store' },
        {
          $project: {
            store: '$store',
            scanCount: 1,
            uniqueVisitors: { $size: '$uniqueSessions' }
          }
        },
        { $sort: { scanCount: -1 } },
        { $limit: limit }
      ]);

      return popularStores;
    } catch (error) {
      throw error;
    }
  }

  // QR 코드 성과 분석
  async getQRPerformance(period) {
    try {
      const days = period === '30d' ? 30 : 7;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const performance = await Analytics.aggregate([
        {
          $match: {
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$qrCode',
            totalScans: {
              $sum: { $cond: [{ $eq: ['$eventType', 'qr_scan'] }, 1, 0] }
            },
            recommendationClicks: {
              $sum: { $cond: [{ $eq: ['$eventType', 'recommendation_click'] }, 1, 0] }
            },
            uniqueVisitors: { $addToSet: '$sessionId' }
          }
        },
        {
          $project: {
            qrCode: '$_id',
            totalScans: 1,
            recommendationClicks: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' },
            clickThroughRate: {
              $cond: [
                { $gt: ['$totalScans', 0] },
                { $multiply: [{ $divide: ['$recommendationClicks', '$totalScans'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { totalScans: -1 } }
      ]);

      return performance;
    } catch (error) {
      throw error;
    }
  }

  // 추천 성과 분석
  async getRecommendationPerformance(period) {
    try {
      const days = period === '30d' ? 30 : 7;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const performance = await Analytics.aggregate([
        {
          $match: {
            eventType: 'recommendation_click',
            timestamp: { $gte: startDate }
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: 'store',
            foreignField: '_id',
            as: 'fromStore'
          }
        },
        {
          $lookup: {
            from: 'stores',
            localField: 'targetStore',
            foreignField: '_id',
            as: 'toStore'
          }
        },
        { $unwind: '$fromStore' },
        { $unwind: '$toStore' },
        {
          $group: {
            _id: {
              from: '$fromStore._id',
              to: '$toStore._id'
            },
            fromStoreName: { $first: '$fromStore.name' },
            toStoreName: { $first: '$toStore.name' },
            clickCount: { $sum: 1 }
          }
        },
        { $sort: { clickCount: -1 } },
        { $limit: 20 }
      ]);

      return performance;
    } catch (error) {
      throw error;
    }
  }

  // 어드민 계정 관리
  async getAllAdmins() {
    try {
      return await Admin.find({ isActive: true })
        .select('-password')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  async createAdmin(adminData) {
    try {
      const admin = new Admin(adminData);
      await admin.save();
      return admin.toObject({ transform: (doc, ret) => { delete ret.password; return ret; } });
    } catch (error) {
      throw error;
    }
  }

  async updateAdminPermissions(adminId, permissions) {
    try {
      const admin = await Admin.findByIdAndUpdate(
        adminId,
        { permissions, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!admin) {
        throw new Error('어드민을 찾을 수 없습니다');
      }

      return admin;
    } catch (error) {
      throw error;
    }
  }

  // 추천 관계 관리
  async getRecommendations(options) {
    try {
      const { page, limit, fromStore, toStore } = options;
      const skip = (page - 1) * limit;

      const filter = {};
      if (fromStore) filter.fromStore = fromStore;
      if (toStore) filter.toStore = toStore;

      const recommendations = await Recommendation.find(filter)
        .populate('fromStore', 'name category location.address')
        .populate('toStore', 'name category location.address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Recommendation.countDocuments(filter);

      return {
        recommendations,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: total,
          limit
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async createRecommendation(recommendationData) {
    try {
      // 중복 추천 관계 확인
      const existing = await Recommendation.findOne({
        fromStore: recommendationData.fromStore,
        toStore: recommendationData.toStore
      });

      if (existing) {
        throw new Error('이미 존재하는 추천 관계입니다');
      }

      const recommendation = new Recommendation(recommendationData);
      await recommendation.save();
      
      return await Recommendation.findById(recommendation._id)
        .populate('fromStore', 'name category')
        .populate('toStore', 'name category');
    } catch (error) {
      throw error;
    }
  }

  async updateRecommendation(recommendationId, updateData) {
    try {
      const recommendation = await Recommendation.findByIdAndUpdate(
        recommendationId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('fromStore', 'name category')
       .populate('toStore', 'name category');

      if (!recommendation) {
        throw new Error('추천 관계를 찾을 수 없습니다');
      }

      return recommendation;
    } catch (error) {
      throw error;
    }
  }

  async deleteRecommendation(recommendationId) {
    try {
      const result = await Recommendation.findByIdAndDelete(recommendationId);
      if (!result) {
        throw new Error('추천 관계를 찾을 수 없습니다');
      }
    } catch (error) {
      throw error;
    }
  }

  // 데이터 내보내기
  async exportData(type, format, options) {
    try {
      let data;
      
      switch (type) {
        case 'stores':
          data = await Store.find().lean();
          break;
        case 'recommendations':
          data = await Recommendation.find()
            .populate('fromStore', 'name category')
            .populate('toStore', 'name category')
            .lean();
          break;
        case 'analytics':
          const filter = {};
          if (options.startDate && options.endDate) {
            filter.timestamp = {
              $gte: new Date(options.startDate),
              $lte: new Date(options.endDate)
            };
          }
          data = await Analytics.find(filter).populate('store', 'name').lean();
          break;
        default:
          throw new Error('지원하지 않는 데이터 타입입니다');
      }

      if (format === 'csv') {
        return this.convertToCSV(data);
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      throw error;
    }
  }

  convertToCSV(data) {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}

module.exports = new AdminService();
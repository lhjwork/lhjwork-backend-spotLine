const adminService = require('../services/adminService');

class AdminController {
  // 어드민 로그인
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await adminService.login(username, password);
      
      if (!result.success) {
        return res.status(401).json({ error: result.message });
      }
      
      res.json({
        success: true,
        token: result.token,
        admin: result.admin
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 대시보드 통계
  async getDashboardStats(req, res) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 매장 관리 - 전체 목록 (페이지네이션)
  async getStoresForAdmin(req, res) {
    try {
      const { page = 1, limit = 20, category, area, search, status } = req.query;
      const result = await adminService.getStoresForAdmin({
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        area,
        search,
        status
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 매장 상태 변경 (활성화/비활성화)
  async toggleStoreStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const store = await adminService.toggleStoreStatus(id, isActive);
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 새 매장 생성
  async createStore(req, res) {
    try {
      const store = await adminService.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 매장 정보 수정
  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const store = await adminService.updateStore(id, req.body);
      res.json(store);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 매장 상세 조회
  async getStoreDetail(req, res) {
    try {
      const { id } = req.params;
      const store = await adminService.getStoreDetail(id);
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 매장 완전 삭제
  async deleteStorePermanently(req, res) {
    try {
      const { id } = req.params;
      await adminService.deleteStorePermanently(id);
      res.json({ message: '매장이 완전히 삭제되었습니다' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 분석 데이터 조회
  async getAnalyticsData(req, res) {
    try {
      const { startDate, endDate, storeId, eventType } = req.query;
      const data = await adminService.getAnalyticsData({
        startDate,
        endDate,
        storeId,
        eventType
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 인기 매장 순위
  async getPopularStores(req, res) {
    try {
      const { period = '7d', limit = 10 } = req.query;
      const stores = await adminService.getPopularStores(period, parseInt(limit));
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // QR 코드 성과 분석
  async getQRPerformance(req, res) {
    try {
      const { period = '30d' } = req.query;
      const performance = await adminService.getQRPerformance(period);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 추천 성과 분석
  async getRecommendationPerformance(req, res) {
    try {
      const { period = '30d' } = req.query;
      const performance = await adminService.getRecommendationPerformance(period);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 어드민 계정 관리
  async getAdmins(req, res) {
    try {
      const admins = await adminService.getAllAdmins();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 새 어드민 생성
  async createAdmin(req, res) {
    try {
      const admin = await adminService.createAdmin(req.body);
      res.status(201).json(admin);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 어드민 권한 수정
  async updateAdminPermissions(req, res) {
    try {
      const { id } = req.params;
      const admin = await adminService.updateAdminPermissions(id, req.body);
      res.json(admin);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 추천 관계 관리
  async getRecommendations(req, res) {
    try {
      const { page = 1, limit = 20, fromStore, toStore } = req.query;
      const result = await adminService.getRecommendations({
        page: parseInt(page),
        limit: parseInt(limit),
        fromStore,
        toStore
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 새 추천 관계 생성
  async createRecommendation(req, res) {
    try {
      const recommendation = await adminService.createRecommendation(req.body);
      res.status(201).json(recommendation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 추천 관계 수정
  async updateRecommendation(req, res) {
    try {
      const { id } = req.params;
      const recommendation = await adminService.updateRecommendation(id, req.body);
      res.json(recommendation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 추천 관계 삭제
  async deleteRecommendation(req, res) {
    try {
      const { id } = req.params;
      await adminService.deleteRecommendation(id);
      res.json({ message: '추천 관계가 삭제되었습니다' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 데이터 내보내기
  async exportData(req, res) {
    try {
      const { type, format = 'csv', startDate, endDate } = req.query;
      const data = await adminService.exportData(type, format, { startDate, endDate });
      
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_${Date.now()}.${format}`);
      res.send(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new AdminController();
const storeService = require('../services/storeService');

class StoreController {
  // 모든 매장 조회
  async getAllStores(req, res) {
    try {
      const { category, area, active } = req.query;
      const stores = await storeService.getAllStores({ category, area, active });
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // QR 코드로 매장 조회
  async getStoreByQR(req, res) {
    try {
      const { qrId } = req.params;
      const store = await storeService.getStoreByQR(qrId);
      
      if (!store) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 특정 매장 조회
  async getStoreById(req, res) {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);
      
      if (!store) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 새 매장 등록
  async createStore(req, res) {
    try {
      const store = await storeService.createStore(req.body);
      res.status(201).json(store);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 매장 정보 수정
  async updateStore(req, res) {
    try {
      const { id } = req.params;
      const store = await storeService.updateStore(id, req.body);
      
      if (!store) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.json(store);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // 매장 삭제 (비활성화)
  async deleteStore(req, res) {
    try {
      const { id } = req.params;
      const result = await storeService.deleteStore(id);
      
      if (!result) {
        return res.status(404).json({ error: '매장을 찾을 수 없습니다' });
      }
      
      res.json({ message: '매장이 비활성화되었습니다' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 근처 매장 검색
  async getNearbyStores(req, res) {
    try {
      const { lat, lng } = req.params;
      const { radius } = req.query;
      
      const stores = await storeService.getNearbyStores(
        parseFloat(lat), 
        parseFloat(lng), 
        parseInt(radius) || 1000
      );
      
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new StoreController();
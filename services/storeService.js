const { v4: uuidv4 } = require('uuid');
const Store = require('../models/Store');

class StoreService {
  // 모든 매장 조회
  async getAllStores(filters = {}) {
    const { category, area, active } = filters;
    const filter = {};
    
    if (category) filter.category = category;
    if (area) filter['location.area'] = area;
    if (active !== undefined) filter.isActive = active === 'true';
    
    return await Store.find(filter).sort({ createdAt: -1 });
  }

  // QR 코드로 매장 조회
  async getStoreByQR(qrId) {
    return await Store.findOne({ 
      'qrCode.id': qrId,
      'qrCode.isActive': true,
      isActive: true
    });
  }

  // ID로 매장 조회
  async getStoreById(id) {
    return await Store.findById(id);
  }

  // 새 매장 생성
  async createStore(storeData) {
    const store = new Store({
      ...storeData,
      qrCode: {
        id: uuidv4(),
        isActive: true
      }
    });
    
    return await store.save();
  }

  // 매장 정보 수정
  async updateStore(id, updateData) {
    return await Store.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
  }

  // 매장 삭제 (비활성화)
  async deleteStore(id) {
    return await Store.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  // 근처 매장 검색
  async getNearbyStores(lat, lng, radius = 1000) {
    return await Store.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius
        }
      },
      isActive: true
    });
  }

  // 매장 존재 여부 확인
  async existsById(id) {
    const count = await Store.countDocuments({ _id: id, isActive: true });
    return count > 0;
  }

  // 카테고리별 매장 수 통계
  async getCategoryStats() {
    return await Store.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
  }
}

module.exports = new StoreService();
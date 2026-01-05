const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Store = require('../../models/Store');
const { authenticateAdmin, requirePermission } = require('../../middleware/adminAuth');

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateAdmin);

// 어드민 매장 목록 조회 (고급 필터링 및 검색)
router.get('/', requirePermission('stores:read'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      area,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // 필터 구성
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) filter.category = category;
    if (area) filter['location.area'] = area;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // 정렬 옵션
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 페이지네이션 계산
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 데이터 조회
    const [stores, totalCount] = await Promise.all([
      Store.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Store.countDocuments(filter)
    ]);

    // 필터 옵션 조회 (드롭다운용)
    const [categories, areas] = await Promise.all([
      Store.distinct('category'),
      Store.distinct('location.area')
    ]);

    res.json({
      stores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      },
      filters: {
        categories: categories.filter(Boolean),
        areas: areas.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Admin stores list error:', error);
    res.status(500).json({
      error: '매장 목록 조회 중 오류가 발생했습니다',
      code: 'STORES_LIST_ERROR'
    });
  }
});

// 특정 매장 상세 조회
router.get('/:id', requirePermission('stores:read'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    res.json(store);
  } catch (error) {
    console.error('Admin store detail error:', error);
    res.status(500).json({
      error: '매장 정보 조회 중 오류가 발생했습니다',
      code: 'STORE_DETAIL_ERROR'
    });
  }
});

// 새 매장 생성
router.post('/', requirePermission('stores:write'), async (req, res) => {
  try {
    const storeData = {
      ...req.body,
      qrCode: {
        id: uuidv4(),
        isActive: true
      }
    };

    const store = new Store(storeData);
    await store.save();

    res.status(201).json({
      message: '매장이 성공적으로 생성되었습니다',
      store
    });

  } catch (error) {
    console.error('Admin store creation error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: '입력 데이터 검증 실패',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    res.status(500).json({
      error: '매장 생성 중 오류가 발생했습니다',
      code: 'STORE_CREATION_ERROR'
    });
  }
});

// 매장 정보 수정
router.put('/:id', requirePermission('stores:write'), async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    res.json({
      message: '매장 정보가 성공적으로 수정되었습니다',
      store
    });

  } catch (error) {
    console.error('Admin store update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        error: '입력 데이터 검증 실패',
        code: 'VALIDATION_ERROR',
        details: errors
      });
    }

    res.status(500).json({
      error: '매장 수정 중 오류가 발생했습니다',
      code: 'STORE_UPDATE_ERROR'
    });
  }
});

// 매장 삭제 (소프트 삭제)
router.delete('/:id', requirePermission('stores:delete'), async (req, res) => {
  try {
    const store = await Store.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        'qrCode.isActive': false
      },
      { new: true }
    );

    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    res.json({
      message: '매장이 성공적으로 비활성화되었습니다',
      store
    });

  } catch (error) {
    console.error('Admin store deletion error:', error);
    res.status(500).json({
      error: '매장 삭제 중 오류가 발생했습니다',
      code: 'STORE_DELETION_ERROR'
    });
  }
});

// QR 코드 재생성
router.post('/:id/qr/regenerate', requirePermission('qr:generate'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    
    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    // 새 QR 코드 생성
    store.qrCode.id = uuidv4();
    store.qrCode.isActive = true;
    await store.save();

    res.json({
      message: 'QR 코드가 성공적으로 재생성되었습니다',
      qrCode: store.qrCode
    });

  } catch (error) {
    console.error('QR regeneration error:', error);
    res.status(500).json({
      error: 'QR 코드 재생성 중 오류가 발생했습니다',
      code: 'QR_REGENERATION_ERROR'
    });
  }
});

// 매장 통계 조회
router.get('/:id/stats', requirePermission('analytics:read'), async (req, res) => {
  try {
    const Analytics = require('../../models/Analytics');
    const storeId = req.params.id;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        error: '매장을 찾을 수 없습니다',
        code: 'STORE_NOT_FOUND'
      });
    }

    // 기본 통계 조회
    const stats = await Analytics.aggregate([
      { $match: { store: store._id } },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          uniqueSessions: { $addToSet: '$sessionId' }
        }
      },
      {
        $project: {
          eventType: '$_id',
          count: 1,
          uniqueSessionCount: { $size: '$uniqueSessions' }
        }
      }
    ]);

    res.json({
      store: {
        id: store._id,
        name: store.name,
        category: store.category
      },
      stats
    });

  } catch (error) {
    console.error('Store stats error:', error);
    res.status(500).json({
      error: '매장 통계 조회 중 오류가 발생했습니다',
      code: 'STORE_STATS_ERROR'
    });
  }
});

module.exports = router;
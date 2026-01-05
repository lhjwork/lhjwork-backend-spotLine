const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// 모든 매장 조회
router.get('/', storeController.getAllStores);

// QR 코드로 매장 조회
router.get('/qr/:qrId', storeController.getStoreByQR);

// 근처 매장 검색
router.get('/nearby/:lat/:lng', storeController.getNearbyStores);

// 특정 매장 조회
router.get('/:id', storeController.getStoreById);

// 새 매장 등록
router.post('/', storeController.createStore);

// 매장 정보 수정
router.put('/:id', storeController.updateStore);

// 매장 삭제 (비활성화)
router.delete('/:id', storeController.deleteStore);

module.exports = router;
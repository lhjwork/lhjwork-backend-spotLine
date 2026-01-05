// 요청 데이터 검증 미들웨어

const validateStore = (req, res, next) => {
  const { name, category, location } = req.body;
  
  if (!name || !category || !location) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다: name, category, location' 
    });
  }
  
  if (!location.address || !location.coordinates) {
    return res.status(400).json({ 
      error: '위치 정보가 불완전합니다: address, coordinates 필요' 
    });
  }
  
  if (!location.coordinates.lat || !location.coordinates.lng) {
    return res.status(400).json({ 
      error: '좌표 정보가 불완전합니다: lat, lng 필요' 
    });
  }
  
  next();
};

const validateRecommendation = (req, res, next) => {
  const { fromStore, toStore, category } = req.body;
  
  if (!fromStore || !toStore || !category) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다: fromStore, toStore, category' 
    });
  }
  
  if (fromStore === toStore) {
    return res.status(400).json({ 
      error: '출발 매장과 도착 매장이 같을 수 없습니다' 
    });
  }
  
  next();
};

const validateAnalyticsEvent = (req, res, next) => {
  const { qrCode, eventType } = req.body;
  
  if (!qrCode || !eventType) {
    return res.status(400).json({ 
      error: '필수 필드가 누락되었습니다: qrCode, eventType' 
    });
  }
  
  const validEventTypes = [
    'qr_scan', 
    'page_view', 
    'recommendation_click', 
    'map_click', 
    'store_visit'
  ];
  
  if (!validEventTypes.includes(eventType)) {
    return res.status(400).json({ 
      error: `유효하지 않은 이벤트 타입입니다. 가능한 값: ${validEventTypes.join(', ')}` 
    });
  }
  
  next();
};

module.exports = {
  validateStore,
  validateRecommendation,
  validateAnalyticsEvent
};
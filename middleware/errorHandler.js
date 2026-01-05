// 전역 에러 핸들링 미들웨어

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // MongoDB 중복 키 에러
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      error: `${field} 값이 이미 존재합니다: ${err.keyValue[field]}`
    });
  }

  // MongoDB 검증 에러
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: '데이터 검증 실패',
      details: errors
    });
  }

  // MongoDB ObjectId 에러
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: '잘못된 ID 형식입니다'
    });
  }

  // JWT 에러 (향후 인증 추가 시)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '유효하지 않은 토큰입니다'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '토큰이 만료되었습니다'
    });
  }

  // 기본 서버 에러
  res.status(err.status || 500).json({
    error: err.message || '서버 내부 오류가 발생했습니다',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 핸들러
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: `요청한 엔드포인트를 찾을 수 없습니다: ${req.method} ${req.path}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
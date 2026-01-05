const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// JWT 시크릿 키 (실제 환경에서는 환경변수로 관리)
const JWT_SECRET = process.env.JWT_SECRET || 'spotline-admin-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// JWT 토큰 생성
const generateToken = (adminId) => {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT 토큰 검증
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

// 어드민 인증 미들웨어
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: '인증 토큰이 필요합니다',
        code: 'ADMIN_UNAUTHORIZED'
      });
    }

    const token = authHeader.substring(7); // 'Bearer ' 제거
    
    try {
      const decoded = verifyToken(token);
      const admin = await AdminUser.findById(decoded.adminId).select('-password');
      
      if (!admin || !admin.isActive) {
        return res.status(401).json({ 
          error: '유효하지 않은 관리자 계정입니다',
          code: 'ADMIN_UNAUTHORIZED'
        });
      }

      req.admin = admin;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: '토큰이 만료되었습니다',
          code: 'TOKEN_EXPIRED'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          error: '유효하지 않은 토큰입니다',
          code: 'INVALID_TOKEN'
        });
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      error: '인증 처리 중 오류가 발생했습니다',
      code: 'AUTH_ERROR'
    });
  }
};

// 권한 확인 미들웨어
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ 
        error: '인증이 필요합니다',
        code: 'ADMIN_UNAUTHORIZED'
      });
    }

    if (!req.admin.hasPermission(permission)) {
      return res.status(403).json({ 
        error: '권한이 부족합니다',
        code: 'ADMIN_FORBIDDEN',
        requiredPermission: permission
      });
    }

    next();
  };
};

// 슈퍼 어드민 권한 확인
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      error: '슈퍼 어드민 권한이 필요합니다',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateAdmin,
  requirePermission,
  requireSuperAdmin
};
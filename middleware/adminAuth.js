const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// JWT 토큰 검증 미들웨어
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: '액세스 토큰이 필요합니다' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'spotline-admin-secret');
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: '토큰 검증에 실패했습니다' });
  }
};

// 권한 확인 미들웨어
const checkPermission = (resource, action) => {
  return (req, res, next) => {
    const admin = req.admin;
    
    // super_admin은 모든 권한 보유
    if (admin.role === 'super_admin') {
      return next();
    }

    // 권한 확인
    const hasPermission = admin.permissions[resource] && admin.permissions[resource][action];
    
    if (!hasPermission) {
      return res.status(403).json({ error: '권한이 없습니다' });
    }

    next();
  };
};

// 역할 기반 접근 제어
const requireRole = (roles) => {
  return (req, res, next) => {
    const admin = req.admin;
    
    if (!roles.includes(admin.role)) {
      return res.status(403).json({ error: '접근 권한이 없습니다' });
    }

    next();
  };
};

module.exports = {
  authenticateAdmin,
  checkPermission,
  requireRole
};
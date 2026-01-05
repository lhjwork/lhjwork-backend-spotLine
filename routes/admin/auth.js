const express = require('express');
const router = express.Router();
const AdminUser = require('../../models/AdminUser');
const { generateToken, authenticateAdmin } = require('../../middleware/adminAuth');

// 어드민 로그인
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return res.status(400).json({
        error: '사용자명과 비밀번호를 입력해주세요',
        code: 'VALIDATION_ERROR'
      });
    }

    // 사용자 찾기 (username 또는 email로 로그인 가능)
    const admin = await AdminUser.findOne({
      $or: [
        { username: username },
        { email: username }
      ],
      isActive: true
    });

    if (!admin) {
      return res.status(401).json({
        error: '잘못된 사용자명 또는 비밀번호입니다',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: '잘못된 사용자명 또는 비밀번호입니다',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 마지막 로그인 시간 업데이트
    admin.lastLogin = new Date();
    await admin.save();

    // JWT 토큰 생성
    const token = generateToken(admin._id);

    // 응답 (비밀번호 제외)
    const adminData = {
      id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      lastLogin: admin.lastLogin
    };

    res.json({
      message: '로그인 성공',
      token,
      admin: adminData,
      expiresIn: '8h'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      error: '로그인 처리 중 오류가 발생했습니다',
      code: 'LOGIN_ERROR'
    });
  }
});

// 토큰 갱신
router.post('/refresh', authenticateAdmin, async (req, res) => {
  try {
    const newToken = generateToken(req.admin._id);
    
    res.json({
      message: '토큰 갱신 성공',
      token: newToken,
      expiresIn: '8h'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: '토큰 갱신 중 오류가 발생했습니다',
      code: 'REFRESH_ERROR'
    });
  }
});

// 현재 사용자 정보 조회
router.get('/me', authenticateAdmin, async (req, res) => {
  try {
    const adminData = {
      id: req.admin._id,
      username: req.admin.username,
      email: req.admin.email,
      role: req.admin.role,
      permissions: req.admin.permissions,
      lastLogin: req.admin.lastLogin
    };

    res.json({
      admin: adminData
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({
      error: '사용자 정보 조회 중 오류가 발생했습니다',
      code: 'USER_INFO_ERROR'
    });
  }
});

// 로그아웃 (클라이언트에서 토큰 삭제)
router.post('/logout', authenticateAdmin, async (req, res) => {
  try {
    // 실제로는 클라이언트에서 토큰을 삭제하면 됨
    // 필요시 토큰 블랙리스트 구현 가능
    res.json({
      message: '로그아웃 성공'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: '로그아웃 처리 중 오류가 발생했습니다',
      code: 'LOGOUT_ERROR'
    });
  }
});

module.exports = router;
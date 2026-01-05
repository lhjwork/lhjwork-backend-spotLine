const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },
  permissions: [{
    type: String,
    enum: [
      'stores:read', 'stores:write', 'stores:delete',
      'recommendations:read', 'recommendations:write', 'recommendations:delete',
      'analytics:read', 'analytics:export',
      'qr:read', 'qr:generate',
      'users:read', 'users:write'
    ]
  }],
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 비밀번호 해싱 미들웨어
adminUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 업데이트 시 updatedAt 자동 갱신
adminUserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 비밀번호 검증 메서드
adminUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 권한 확인 메서드
adminUserSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// 인덱스 설정
adminUserSchema.index({ username: 1 });
adminUserSchema.index({ email: 1 });
adminUserSchema.index({ isActive: 1 });

module.exports = mongoose.model('AdminUser', adminUserSchema);
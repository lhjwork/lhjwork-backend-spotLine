const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spotline')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// Routes
app.use('/api/stores', require('./routes/stores'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/analytics', require('./routes/analytics'));

// Admin Routes
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Spotline API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API 정보
app.get('/api', (req, res) => {
  res.json({
    name: 'Spotline API',
    version: '1.0.0',
    description: 'QR 기반 로컬 연결 서비스',
    endpoints: {
      stores: '/api/stores',
      recommendations: '/api/recommendations',
      analytics: '/api/analytics',
      admin: '/api/admin'
    }
  });
});

// 404 handler
app.use('*', notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Spotline 서버가 포트 ${PORT}에서 실행 중입니다`);
  console.log(`API 문서: http://localhost:${PORT}/api`);
  console.log(`Admin API: http://localhost:${PORT}/api/admin`);
});

module.exports = app;
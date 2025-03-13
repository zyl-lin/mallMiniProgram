const express = require('express');
const router = express.Router();

// 测试路由
router.get('/ping', (req, res) => {
  res.json({
    code: 0,
    data: {
      message: 'pong',
      timestamp: Date.now(),
      env: process.env.NODE_ENV,
      database: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME
      }
    }
  });
});

module.exports = router; 
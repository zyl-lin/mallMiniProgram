const express = require('express');
const router = express.Router();

// 获取统计数据
router.get('/overview', (req, res) => {
  res.json({
    code: 0,
    data: {}
  });
});

module.exports = router; 
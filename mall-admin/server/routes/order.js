const express = require('express');
const router = express.Router();

// 获取订单列表
router.get('/list', (req, res) => {
  res.json({
    code: 0,
    data: []
  });
});

module.exports = router; 
const express = require('express');
const router = express.Router();

// 获取分类列表
router.get('/list', (req, res) => {
  res.json({
    code: 0,
    data: []
  });
});

module.exports = router; 
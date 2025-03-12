const express = require('express');
const router = express.Router();

// 获取销售统计数据
router.get('/sales', (req, res) => {
  res.json({
    code: 0,
    data: {
      today: 1000,
      week: 5000,
      month: 20000
    }
  });
});

// 获取销售趋势数据
router.get('/sales-trend', (req, res) => {
  res.json({
    code: 0,
    data: {
      labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      datasets: [{
        label: '销售额',
        data: [1000, 1200, 1300, 1100, 1500, 1800, 2000]
      }]
    }
  });
});

// 获取热销商品数据
router.get('/hot-goods', (req, res) => {
  res.json({
    code: 0,
    data: [{
      name: '商品1',
      sales: 100,
      amount: 10000
    }]
  });
});

// 获取订单统计数据
router.get('/orders', (req, res) => {
  res.json({
    code: 0,
    data: [{
      label: '待付款',
      value: 10
    }]
  });
});

// 获取转化率统计数据
router.get('/conversion', (req, res) => {
  res.json({
    code: 0,
    data: {
      labels: ['浏览', '加购', '下单', '支付'],
      datasets: [{
        data: [1000, 500, 200, 100]
      }]
    }
  });
});

module.exports = router; 
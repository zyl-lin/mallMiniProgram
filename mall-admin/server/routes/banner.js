const express = require('express');
const router = express.Router();

// 获取轮播图列表
router.get('/list', (req, res) => {
  res.json({
    code: 0,
    data: [
      {
        id: 1,
        image_url: 'https://example.com/banner1.jpg',
        link_url: 'https://example.com/page1',
        sort: 1,
        status: 1
      },
      {
        id: 2, 
        image_url: 'https://example.com/banner2.jpg',
        link_url: 'https://example.com/page2',
        sort: 2,
        status: 1
      }
    ]
  });
});

// 新增轮播图
router.post('/add', (req, res) => {
  res.json({
    code: 0,
    message: '添加成功'
  });
});

// 更新轮播图
router.put('/update', (req, res) => {
  res.json({
    code: 0,
    message: '更新成功'
  });
});

// 删除轮播图
router.delete('/delete', (req, res) => {
  res.json({
    code: 0,
    message: '删除成功'
  });
});

// 修改轮播图状态
router.put('/status', (req, res) => {
  res.json({
    code: 0,
    message: '状态更新成功'
  });
});

// 修改轮播图排序
router.put('/sort', (req, res) => {
  res.json({
    code: 0,
    message: '排序更新成功'
  });
});

module.exports = router; 
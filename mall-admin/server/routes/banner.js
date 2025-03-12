const express = require('express');
const router = express.Router();

// 模拟数据库存储
let banners = [];
let nextId = 1;

// 获取轮播图列表
router.get('/list', (req, res) => {
  res.json({
    code: 0,
    data: banners
  });
});

// 添加轮播图
router.post('/add', (req, res) => {
  const { image_url, link_url, sort = 0, status = 1 } = req.body;
  
  const banner = {
    id: nextId++,
    image_url,
    link_url,
    sort,
    status,
    create_time: new Date().toISOString()
  };
  
  banners.push(banner);
  
  res.json({
    code: 0,
    message: '添加成功',
    data: banner
  });
});

// 更新轮播图
router.put('/update', (req, res) => {
  const { id, image_url, link_url, sort, status } = req.body;
  
  const index = banners.findIndex(item => item.id === id);
  if (index === -1) {
    return res.json({
      code: 1,
      message: '轮播图不存在'
    });
  }
  
  banners[index] = {
    ...banners[index],
    image_url,
    link_url,
    sort,
    status
  };
  
  res.json({
    code: 0,
    message: '更新成功'
  });
});

// 删除轮播图
router.delete('/delete/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = banners.findIndex(item => item.id === id);
  
  if (index > -1) {
    banners.splice(index, 1);
  }
  
  res.json({
    code: 0,
    message: '删除成功'
  });
});

// 更新轮播图状态
router.post('/status', (req, res) => {
  const { id, status } = req.body;
  
  const banner = banners.find(item => item.id === id);
  if (banner) {
    banner.status = status;
  }
  
  res.json({
    code: 0,
    message: '状态更新成功'
  });
});

module.exports = router; 
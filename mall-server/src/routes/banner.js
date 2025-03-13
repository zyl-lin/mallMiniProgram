const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner');

// 获取轮播图列表
router.get('/list', bannerController.getBannerList);

// 添加轮播图
router.post('/add', bannerController.addBanner);

// 编辑轮播图
router.put('/update', bannerController.updateBanner);

// 删除轮播图
router.delete('/delete/:id', bannerController.deleteBanner);

// 修改轮播图状态
router.put('/status', bannerController.updateStatus);

// 修改轮播图排序
router.put('/sort', bannerController.updateSort);

module.exports = router; 
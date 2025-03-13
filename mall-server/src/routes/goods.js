const express = require('express');
const router = express.Router();
const goodsController = require('../controllers/goods');

// 获取商品列表
router.get('/list', goodsController.getList);

// 获取商品详情
router.get('/detail/:id', goodsController.getDetail);

// 获取推荐商品
router.get('/recommend', goodsController.getRecommend);

module.exports = router; 
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category');

// 获取分类列表
router.get('/list', categoryController.getList);

// 获取首页分类
router.get('/home', categoryController.getHomeCategories);

// 获取分类商品
router.get('/:id/goods', categoryController.getCategoryGoods);

module.exports = router; 
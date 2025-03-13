const express = require('express');
const router = express.Router();

// 用户相关路由
const userRoutes = require('./user');
router.use('/user', userRoutes);

// 商品相关路由
const goodsRoutes = require('./goods');
router.use('/goods', goodsRoutes);

// 订单相关路由
const orderRoutes = require('./order');
router.use('/order', orderRoutes);

// 测试路由
const testRoutes = require('./test');
router.use('/test', testRoutes);

// 轮播图路由
const bannerRoutes = require('./banner');
router.use('/banner', bannerRoutes);

// 分类路由
const categoryRoutes = require('./category');
router.use('/category', categoryRoutes);

// 购物车路由
const cartRoutes = require('./cart');
router.use('/cart', cartRoutes);

// 地址路由
const addressRoutes = require('./address');
router.use('/address', addressRoutes);

module.exports = router; 
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart');
const { userAuthMiddleware } = require('../middlewares/auth');

// 所有购物车接口都需要用户登录
router.use(userAuthMiddleware);

// 获取购物车列表
router.get('/list', cartController.getList);

// 添加商品到购物车
router.post('/add', cartController.add);

// 更新购物车商品数量
router.post('/update', cartController.updateQuantity);

// 删除购物车商品
router.post('/delete', cartController.delete);

// 更新商品选中状态
router.post('/selected', cartController.updateSelected);

module.exports = router; 
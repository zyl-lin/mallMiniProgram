const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order');
const { userAuthMiddleware } = require('../middlewares/auth');

// 所有订单接口都需要用户登录
router.use(userAuthMiddleware);

// 创建订单
router.post('/create', orderController.create);

// 获取订单列表
router.get('/list', orderController.getList);

// 获取订单详情
router.get('/detail/:id', orderController.getDetail);

// 取消订单
router.post('/cancel/:id', orderController.cancel);

// 确认收货
router.post('/confirm/:id', orderController.confirm);

module.exports = router; 
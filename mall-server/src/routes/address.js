const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address');
const { userAuthMiddleware } = require('../middlewares/auth');

// 所有地址接口都需要用户登录
router.use(userAuthMiddleware);

// 获取地址列表
router.get('/list', addressController.getList);

// 获取地址详情
router.get('/detail', addressController.getDetail);

// 添加地址
router.post('/add', addressController.add);

// 更新地址
router.post('/update', addressController.update);

// 删除地址
router.post('/delete', addressController.delete);

// 设置默认地址
router.post('/set-default', addressController.setDefault);

// 获取默认地址
router.get('/default', addressController.getDefault);

module.exports = router; 
const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address');
const { userAuthMiddleware } = require('../middlewares/auth');

// 所有地址接口都需要用户登录
router.use(userAuthMiddleware);

// 获取地址列表
router.get('/list', addressController.getList);

// 添加地址
router.post('/add', addressController.add);

// 更新地址
router.put('/update', addressController.update);

// 删除地址
router.delete('/delete/:id', addressController.delete);

// 设置默认地址
router.put('/setDefault', addressController.setDefault);

module.exports = router; 
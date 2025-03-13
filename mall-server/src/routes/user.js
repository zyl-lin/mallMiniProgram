const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { authMiddleware } = require('../middlewares/auth');

// 用户登录
router.post('/login', userController.login);

// 用户退出
router.post('/logout', authMiddleware, userController.logout);

// 获取用户信息
router.get('/info', authMiddleware, userController.getInfo);

// 更新用户信息
router.put('/info', authMiddleware, userController.updateInfo);

module.exports = router; 
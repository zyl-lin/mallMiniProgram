const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { authMiddleware } = require('../middlewares/auth');

// 管理员登录
router.post('/login', adminController.login);

// 管理员退出
router.post('/logout', authMiddleware, adminController.logout);

// 获取管理员信息
router.get('/info', authMiddleware, adminController.getInfo);

module.exports = router; 
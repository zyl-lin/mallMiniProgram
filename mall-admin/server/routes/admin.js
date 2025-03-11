const express = require('express');
const router = express.Router();

// 管理员登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // 简单的登录验证逻辑
  if (username === 'admin' && password === 'admin123') {
    // 设置session
    req.session.user = {
      id: 1,
      username: username,
      roles: ['admin']
    };
    
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token: 'admin-token',
        username: username,
        roles: ['admin'],
        avatar: 'https://example.com/avatar.jpg'
      }
    });
  } else {
    res.json({
      code: 401,
      message: '用户名或密码错误'
    });
  }
});

// 获取管理员信息
router.get('/info', (req, res) => {
  // 检查session
  if (!req.session.user) {
    return res.json({
      code: 401,
      message: '未登录'
    });
  }

  res.json({
    code: 0,
    data: {
      name: req.session.user.username,
      avatar: 'https://example.com/avatar.jpg',
      roles: req.session.user.roles
    }
  });
});

// 退出登录
router.post('/logout', (req, res) => {
  // 清除session
  req.session.destroy();
  
  res.json({
    code: 0,
    message: '退出成功'
  });
});

module.exports = router; 
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const config = require('../config');

// 管理员登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [admins] = await db.query(
      'SELECT * FROM admin WHERE username = ? AND password = ?',
      [username, password]
    );
    
    if (admins.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    const admin = admins[0];
    const token = jwt.sign({ id: admin.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    res.json({
      code: 0,
      data: { token },
      message: '登录成功'
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败'
    });
  }
};

// 管理员退出
exports.logout = (req, res) => {
  res.json({
    code: 0,
    message: '退出成功'
  });
};

// 获取管理员信息
exports.getInfo = async (req, res) => {
  try {
    const adminId = req.adminId; // 从 JWT 中获取
    const [admins] = await db.query('SELECT id, username, nickname, avatar FROM admin WHERE id = ?', [adminId]);
    
    if (admins.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '管理员不存在'
      });
    }

    res.json({
      code: 0,
      data: admins[0],
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取管理员信息失败'
    });
  }
}; 
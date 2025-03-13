const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const config = require('../config');

// 用户登录
exports.login = async (req, res) => {
  try {
    const { code } = req.body;
    // TODO: 调用微信接口获取openid
    const openid = 'test_openid'; // 测试用，实际需要调用微信接口

    // 查找或创建用户
    let [users] = await db.query('SELECT * FROM user WHERE openid = ?', [openid]);
    
    if (users.length === 0) {
      // 新用户，创建记录
      const [result] = await db.query(
        'INSERT INTO user (openid) VALUES (?)',
        [openid]
      );
      users = [{
        id: result.insertId,
        openid
      }];
    }

    const user = users[0];
    const token = jwt.sign({ id: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    res.json({
      code: 0,
      data: { token },
      message: '登录成功'
    });
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败'
    });
  }
};

// 用户退出
exports.logout = (req, res) => {
  res.json({
    code: 0,
    message: '退出成功'
  });
};

// 获取用户信息
exports.getInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const [users] = await db.query(
      'SELECT id, nickname, avatar, gender, mobile FROM user WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 0,
      data: users[0],
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    });
  }
};

// 更新用户信息
exports.updateInfo = async (req, res) => {
  try {
    const userId = req.userId;
    const { nickname, avatar, gender, mobile } = req.body;
    
    await db.query(
      'UPDATE user SET nickname = ?, avatar = ?, gender = ?, mobile = ? WHERE id = ?',
      [nickname, avatar, gender, mobile, userId]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败'
    });
  }
}; 
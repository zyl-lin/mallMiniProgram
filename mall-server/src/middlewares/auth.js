const jwt = require('jsonwebtoken');
const config = require('../config');

// 管理员认证中间件
exports.authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.adminId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期'
    });
  }
};

// 用户认证中间件
exports.userAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期'
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '未登录或登录已过期'
    });
  }
}; 
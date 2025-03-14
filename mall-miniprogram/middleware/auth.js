const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = async (req, res, next) => {
  try {
    // 从请求头获取token
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.json({
        code: 401,
        msg: '未登录或登录已过期'
      })
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, config.jwt.secret)
      
      // 将用户信息存储到请求对象中
      req.user = decoded
      
      next()
    } catch (err) {
      // token验证失败
      return res.json({
        code: 401,
        msg: '登录已过期，请重新登录'
      })
    }
  } catch (err) {
    console.error('Auth中间件错误:', err)
    res.json({
      code: 500,
      msg: '服务器错误'
    })
  }
} 
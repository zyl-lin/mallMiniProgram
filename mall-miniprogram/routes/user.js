const express = require('express')
const router = express.Router()
const axios = require('axios')
const db = require('../utils/db')
const jwt = require('jsonwebtoken')
const config = require('../config')
const auth = require('../middleware/auth')

// 微信登录
router.post('/login', async (req, res) => {
  try {
    const { code, userInfo } = req.body  // userInfo 来自 wx.getUserProfile()

    if (!code) {
      return res.json({
        code: 1,
        msg: '缺少登录凭证'
      })
    }

    // 1. 调用微信接口获取openid
    const wxLoginRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.wx.appId,
        secret: config.wx.appSecret,
        js_code: code,
        grant_type: 'authorization_code'
      }
    })

    if (wxLoginRes.data.errcode) {
      throw new Error('微信登录失败: ' + wxLoginRes.data.errmsg)
    }

    const { openid, session_key } = wxLoginRes.data

    // 2. 查询用户是否存在
    const [users] = await db.query(
      'SELECT * FROM user WHERE openid = ?',
      [openid]
    )

    let userId

    if (users.length > 0) {
      // 3. 用户存在，更新用户信息
      userId = users[0].id
      await db.query(
        'UPDATE user SET nickname = ?, avatar_url = ?, update_time = CURRENT_TIMESTAMP WHERE id = ?',
        [userInfo.nickName, userInfo.avatarUrl, userId]
      )
    } else {
      // 4. 用户不存在，创建新用户
      const [result] = await db.query(
        'INSERT INTO user (openid, nickname, avatar_url) VALUES (?, ?, ?)',
        [openid, userInfo.nickName, userInfo.avatarUrl]
      )
      userId = result.insertId
    }

    // 5. 生成token
    const token = jwt.sign(
      { userId },
      config.jwt.secret,
      { expiresIn: '7d' }
    )

    // 6. 返回用户信息和token
    res.json({
      code: 0,
      msg: '登录成功',
      data: {
        token,
        userInfo: {
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl
        }
      }
    })

  } catch (err) {
    console.error('登录失败:', err)
    res.json({
      code: 1,
      msg: err.message || '登录失败'
    })
  }
})

// 获取用户信息
router.get('/info', auth, async (req, res) => {
  try {
    const { userId } = req.user

    // 查询用户信息
    const [users] = await db.query(
      'SELECT id, nickname, avatar_url, create_time, update_time FROM user WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      throw new Error('用户不存在')
    }

    res.json({
      code: 0,
      msg: '获取成功',
      data: users[0]
    })
  } catch (err) {
    console.error('获取用户信息失败:', err)
    res.json({
      code: 1,
      msg: err.message || '获取用户信息失败'
    })
  }
})

// 检查token是否有效
router.get('/check', auth, async (req, res) => {
  try {
    const { userId } = req.user
    
    const [users] = await db.query(
      'SELECT id, nickname, avatar_url FROM user WHERE id = ?',
      [userId]
    )

    if (users.length === 0) {
      return res.json({
        code: 1,
        msg: '用户不存在'
      })
    }

    res.json({
      code: 0,
      msg: '验证成功',
      data: users[0]
    })
  } catch (err) {
    console.error('验证token失败:', err)
    res.json({
      code: 1,
      msg: '验证失败'
    })
  }
})

module.exports = router 
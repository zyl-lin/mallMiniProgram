const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const auth = require('../middleware/auth')

// 获取地址列表
router.get('/list', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const [addresses] = await db.query(
      'SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, update_time DESC',
      [userId]
    )
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: addresses
    })
  } catch (err) {
    console.error('获取地址列表失败:', err)
    res.json({
      code: 1,
      msg: '获取失败'
    })
  }
})

// 设置默认地址
router.post('/set-default', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { id } = req.body

    await db.query('START TRANSACTION')
    
    // 取消原默认地址
    await db.query(
      'UPDATE address SET is_default = 0 WHERE user_id = ?',
      [userId]
    )
    
    // 设置新默认地址
    await db.query(
      'UPDATE address SET is_default = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    await db.query('COMMIT')
    
    res.json({
      code: 0,
      msg: '设置成功'
    })
  } catch (err) {
    await db.query('ROLLBACK')
    console.error('设置默认地址失败:', err)
    res.json({
      code: 1,
      msg: '设置失败'
    })
  }
})

// 删除地址
router.post('/delete', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { id } = req.body
    
    await db.query(
      'DELETE FROM address WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    
    res.json({
      code: 0,
      msg: '删除成功'
    })
  } catch (err) {
    console.error('删除地址失败:', err)
    res.json({
      code: 1,
      msg: '删除失败'
    })
  }
})

module.exports = router 
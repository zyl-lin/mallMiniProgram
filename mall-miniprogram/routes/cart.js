const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const auth = require('../middleware/auth') // 引入auth中间件

// 添加auth中间件进行权限验证
router.post('/add', auth, async (req, res) => {
  try {
    const { userId } = req.user // 从auth中间件获取用户ID
    const { goodsId, quantity } = req.body

    // 检查商品是否存在
    const [goods] = await db.query(
      'SELECT * FROM goods WHERE id = ?',
      [goodsId]
    )

    if (goods.length === 0) {
      return res.json({
        code: 1,
        msg: '商品不存在'
      })
    }

    // 检查购物车是否已有该商品
    const [cartItems] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND goods_id = ?',
      [userId, goodsId]
    )

    if (cartItems.length > 0) {
      // 更新数量
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND goods_id = ?',
        [quantity, userId, goodsId]
      )
    } else {
      // 新增商品到购物车
      await db.query(
        'INSERT INTO cart (user_id, goods_id, quantity) VALUES (?, ?, ?)',
        [userId, goodsId, quantity]
      )
    }

    res.json({
      code: 0,
      msg: '添加成功'
    })
  } catch (err) {
    console.error('添加购物车失败:', err)
    res.json({
      code: 1,
      msg: '添加失败'
    })
  }
})

// 获取购物车列表
router.get('/list', auth, async (req, res) => {
  try {
    const { userId } = req.user
    console.log('=== 获取购物车列表 ===')
    console.log('用户ID:', userId)

    // 检查数据库连接
    if (!db) {
      throw new Error('数据库连接失败')
    }

    // 添加错误处理的数据库查询
    let cartList
    try {
      [cartList] = await db.query(
        `SELECT c.id, c.quantity, c.selected, 
          g.id as goods_id, g.name, g.price, g.image_url
        FROM cart c
        LEFT JOIN goods g ON c.goods_id = g.id
        WHERE c.user_id = ?`,
        [userId]
      )
      console.log('查询到的购物车数据:', cartList)
    } catch (dbError) {
      console.error('数据库查询错误:', dbError)
      throw new Error('数据库查询失败: ' + dbError.message)
    }

    // 确保返回的是空数组而不是null
    const list = cartList || []
    
    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        list,
        totalPrice: list.reduce((total, item) => {
          return item.selected ? total + (item.price * item.quantity) : total
        }, 0)
      }
    })
  } catch (err) {
    console.error('获取购物车列表失败:', err)
    res.status(500).json({
      code: 1,
      msg: '获取失败: ' + err.message
    })
  }
})

// 在现有代码中添加更新购物车商品数量的接口
router.post('/update', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { id, quantity } = req.body

    // 验证数量是否合法
    if (quantity < 1) {
      return res.json({
        code: 1,
        msg: '商品数量不能小于1'
      })
    }

    // 检查购物车商品是否存在
    const [cartItems] = await db.query(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (cartItems.length === 0) {
      return res.json({
        code: 1,
        msg: '购物车商品不存在'
      })
    }

    // 更新商品数量
    await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    )

    res.json({
      code: 0,
      msg: '更新成功'
    })
  } catch (err) {
    console.error('更新购物车商品数量失败:', err)
    res.json({
      code: 1,
      msg: '更新失败'
    })
  }
})

module.exports = router 
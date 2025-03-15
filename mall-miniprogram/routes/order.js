const express = require('express')
const router = express.Router()
const db = require('../utils/db')
const auth = require('../middleware/auth')

// 创建订单
router.post('/create', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { addressId, goodsList, totalPrice, remark } = req.body

    // 参数验证
    if (!addressId || !goodsList || !Array.isArray(goodsList) || goodsList.length === 0) {
      return res.json({
        code: 1,
        msg: '参数错误'
      })
    }

    // 开启事务
    await db.query('START TRANSACTION')

    try {
      // 1. 创建订单
      const [orderResult] = await db.query(
        'INSERT INTO orders (user_id, address_id, total_price, remark, status) VALUES (?, ?, ?, ?, 1)',
        [userId, addressId, totalPrice, remark || '']
      )
      const orderId = orderResult.insertId

      // 2. 创建订单商品记录
      const orderGoodsValues = goodsList.map(item => 
        [orderId, item.goodsId, item.quantity, item.price]
      )
      await db.query(
        'INSERT INTO order_goods (order_id, goods_id, quantity, price) VALUES ?',
        [orderGoodsValues]
      )

      // 3. 清空购物车中已下单的商品
      const goodsIds = goodsList.map(item => item.goodsId)
      await db.query(
        'DELETE FROM cart WHERE user_id = ? AND goods_id IN (?)',
        [userId, goodsIds]
      )

      await db.query('COMMIT')

      res.json({
        code: 0,
        msg: '创建成功',
        data: {
          orderId
        }
      })
    } catch (err) {
      await db.query('ROLLBACK')
      throw err
    }
  } catch (err) {
    console.error('创建订单失败:', err)
    res.json({
      code: 1,
      msg: '创建失败'
    })
  }
})

// 获取订单列表
router.get('/list', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { status, pageNum = 1, pageSize = 10 } = req.query
    
    const offset = (pageNum - 1) * pageSize
    
    // 构建查询条件
    let whereClause = 'WHERE o.user_id = ?'
    const queryParams = [userId]
    
    if (status && status !== '0') {
      whereClause += ' AND o.status = ?'
      queryParams.push(status)
    }

    // 查询订单总数
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      queryParams
    )
    const total = countResult[0].total

    // 查询订单列表
    const [orders] = await db.query(
      `SELECT o.*, a.receiver, a.phone, a.province, a.city, a.district, a.address
       FROM orders o
       LEFT JOIN address a ON o.address_id = a.id
       ${whereClause}
       ORDER BY o.create_time DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, parseInt(pageSize), offset]
    )

    // 查询订单商品
    for (let order of orders) {
      const [goods] = await db.query(
        `SELECT og.*, g.name, g.image_url
         FROM order_goods og
         LEFT JOIN goods g ON og.goods_id = g.id
         WHERE og.order_id = ?`,
        [order.id]
      )
      order.goodsList = goods
    }

    res.json({
      code: 0,
      msg: '获取成功',
      data: {
        list: orders,
        total,
        pageNum: parseInt(pageNum),
        pageSize: parseInt(pageSize)
      }
    })
  } catch (err) {
    console.error('获取订单列表失败:', err)
    res.json({
      code: 1,
      msg: '获取失败'
    })
  }
})

// 发起支付
router.post('/pay', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { orderId } = req.body

    // 检查订单是否存在且属于当前用户
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 1',
      [orderId, userId]
    )

    if (orders.length === 0) {
      return res.json({
        code: 1,
        msg: '订单不存在或状态错误'
      })
    }

    // TODO: 调用微信支付接口
    // 这里暂时模拟支付成功
    await db.query(
      'UPDATE orders SET status = 2, pay_time = CURRENT_TIMESTAMP WHERE id = ?',
      [orderId]
    )

    res.json({
      code: 0,
      msg: '支付成功'
    })
  } catch (err) {
    console.error('支付失败:', err)
    res.json({
      code: 1,
      msg: '支付失败'
    })
  }
})

// 确认收货
router.post('/confirm', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { orderId } = req.body

    // 检查订单是否存在且属于当前用户
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 3',
      [orderId, userId]
    )

    if (orders.length === 0) {
      return res.json({
        code: 1,
        msg: '订单不存在或状态错误'
      })
    }

    // 更新订单状态为已完成
    await db.query(
      'UPDATE orders SET status = 4, complete_time = CURRENT_TIMESTAMP WHERE id = ?',
      [orderId]
    )

    res.json({
      code: 0,
      msg: '确认成功'
    })
  } catch (err) {
    console.error('确认收货失败:', err)
    res.json({
      code: 1,
      msg: '确认失败'
    })
  }
})

// 取消订单
router.post('/cancel', auth, async (req, res) => {
  try {
    const { userId } = req.user
    const { orderId } = req.body

    // 检查订单是否存在且属于当前用户
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ? AND status = 1',
      [orderId, userId]
    )

    if (orders.length === 0) {
      return res.json({
        code: 1,
        msg: '订单不存在或状态错误'
      })
    }

    // 更新订单状态为已取消
    await db.query(
      'UPDATE orders SET status = 5, cancel_time = CURRENT_TIMESTAMP WHERE id = ?',
      [orderId]
    )

    res.json({
      code: 0,
      msg: '取消成功'
    })
  } catch (err) {
    console.error('取消订单失败:', err)
    res.json({
      code: 1,
      msg: '取消失败'
    })
  }
})

module.exports = router 
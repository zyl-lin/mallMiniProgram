const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');

// 创建订单
exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    const { addressId, cartIds, remark } = req.body;

    // 获取地址信息
    const [addresses] = await db.query(
      'SELECT * FROM address WHERE id = ? AND user_id = ?',
      [addressId, userId]
    );

    if (addresses.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '收货地址不存在'
      });
    }

    const address = addresses[0];

    // 获取购物车商品
    const [cartItems] = await db.query(
      `SELECT c.*, g.price, g.stock, g.name 
       FROM cart c 
       LEFT JOIN goods g ON c.goods_id = g.id 
       WHERE c.id IN (?) AND c.user_id = ? AND g.status = 1`,
      [cartIds, userId]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '购物车商品不存在'
      });
    }

    // 检查库存
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          code: 400,
          message: `商品 ${item.name} 库存不足`
        });
      }
    }

    // 计算总价
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 生成订单号
    const orderNo = uuidv4().replace(/-/g, '');

    // 创建订单
    const [orderResult] = await db.query(
      `INSERT INTO orders (
        order_no, user_id, total_amount, status,
        receiver_name, receiver_phone, receiver_address
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNo, 
        userId, 
        totalAmount, 
        0, // 待支付
        address.name,
        address.mobile,
        `${address.province}${address.city}${address.district}${address.detail}`
      ]
    );

    const orderId = orderResult.insertId;

    // 创建订单商品记录
    const orderGoods = cartItems.map(item => [
      orderId,
      item.goods_id,
      item.quantity,
      item.price,
      item.price * item.quantity
    ]);

    await db.query(
      'INSERT INTO order_goods (order_id, goods_id, quantity, price, total_price) VALUES ?',
      [orderGoods]
    );

    // 更新商品库存
    for (const item of cartItems) {
      await db.query(
        'UPDATE goods SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.goods_id]
      );
    }

    // 删除购物车商品
    await db.query(
      'DELETE FROM cart WHERE id IN (?)',
      [cartIds]
    );

    res.json({
      code: 0,
      data: {
        orderNo
      },
      message: '创建成功'
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建订单失败'
    });
  }
};

// 获取订单列表
exports.getList = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [userId];

    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(parseInt(status));
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [orders] = await db.query(sql, params);

    // 获取订单商品并添加状态说明
    for (const order of orders) {
      const [goods] = await db.query(
        `SELECT og.*, g.name, g.cover, g.price as current_price
         FROM order_goods og
         LEFT JOIN goods g ON og.goods_id = g.id
         WHERE og.order_id = ?`,
        [order.id]
      );
      order.goods = goods;
      
      // 添加状态说明
      order.statusText = {
        0: '待支付',
        1: '已支付',
        2: '已发货',
        3: '已完成'
      }[order.status] || '未知状态';
    }

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM orders WHERE user_id = ?';
    const countParams = [userId];

    if (status !== undefined) {
      countSql += ' AND status = ?';
      countParams.push(parseInt(status));
    }

    const [total] = await db.query(countSql, countParams);

    res.json({
      code: 0,
      data: {
        list: orders,
        pagination: {
          total: total[0].total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单列表失败'
    });
  }
};

// 获取订单详情
exports.getDetail = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // 直接从订单表获取信息，不需要关联地址表
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    // 获取订单商品
    const [goods] = await db.query(
      `SELECT og.*, g.name, g.image_url, g.price as current_price
       FROM order_goods og
       LEFT JOIN goods g ON og.goods_id = g.id
       WHERE og.order_id = ?`,
      [order.id]
    );

    order.goods = goods;

    // 格式化订单状态说明
    order.statusText = {
      0: '待支付',
      1: '已支付',
      2: '已发货',
      3: '已完成'
    }[order.status] || '未知状态';

    res.json({
      code: 0,
      data: order,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取订单详情失败'
    });
  }
};

// 取消订单
exports.cancel = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // 检查订单是否存在
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    // 只能取消待支付的订单
    if (order.status !== 0) {
      return res.status(400).json({
        code: 400,
        message: '订单状态不允许取消'
      });
    }

    // 获取订单商品
    const [orderGoods] = await db.query(
      'SELECT * FROM order_goods WHERE order_id = ?',
      [order.id]
    );

    // 恢复商品库存
    for (const item of orderGoods) {
      await db.query(
        'UPDATE goods SET stock = stock + ? WHERE id = ?',
        [item.quantity, item.goods_id]
      );
    }

    // 更新订单状态为已取消
    await db.query(
      'UPDATE orders SET status = 3 WHERE id = ?',
      [order.id]
    );

    res.json({
      code: 0,
      message: '取消成功'
    });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(500).json({
      code: 500,
      message: '取消订单失败'
    });
  }
};

// 确认收货
exports.confirm = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    // 检查订单是否存在
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    // 只能确认已发货的订单
    if (order.status !== 2) {
      return res.status(400).json({
        code: 400,
        message: '订单状态不允许确认收货'
      });
    }

    // 更新订单状态为已完成
    await db.query(
      'UPDATE orders SET status = 3 WHERE id = ?',
      [order.id]
    );

    res.json({
      code: 0,
      message: '确认成功'
    });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(500).json({
      code: 500,
      message: '确认收货失败'
    });
  }
}; 
const db = require('../utils/db');
const { v4: uuidv4 } = require('uuid');
const wxpayApi = require('../utils/wxpay');
const crypto = require('crypto');
const config = require('../config');

// 创建订单
exports.create = async (req, res) => {
  try {
    const userId = req.userId;
    // 从请求体中获取地址ID和商品信息
    const { addressId, goods } = req.body;

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

    // 直接查询商品信息，不再依赖购物车
    const goodsIds = goods.map(item => item.goodsId);
    const [goodsItems] = await db.query(
      `SELECT * FROM goods WHERE id IN (?) AND status = 1`,
      [goodsIds]
    );

    if (goodsItems.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '商品不存在或已下架'
      });
    }

    // 检查库存并计算总价
    let totalAmount = 0;
    for (const item of goods) {
      const goodsItem = goodsItems.find(g => g.id === item.goodsId);
      if (!goodsItem) {
        return res.status(400).json({
          code: 400,
          message: '商品不存在'
        });
      }
      if (item.quantity > goodsItem.stock) {
        return res.status(400).json({
          code: 400,
          message: `商品 ${goodsItem.name} 库存不足`
        });
      }
      totalAmount += goodsItem.price * item.quantity;
    }

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
        address.receiver_name,
        address.receiver_phone,
        `${address.province}${address.city}${address.district}${address.detail_address}`
      ]
    );

    const orderId = orderResult.insertId;

    // 创建订单商品记录
    const orderGoods = goods.map(item => {
      const goodsItem = goodsItems.find(g => g.id === item.goodsId);
      return [
        orderId,
        item.goodsId,
        goodsItem.name,
        goodsItem.image_url,
        goodsItem.price,
        item.quantity,
      ];
    });

    await db.query(
      `INSERT INTO order_goods (
        order_id, goods_id, goods_name, goods_image, 
        goods_price, quantity
      ) VALUES ?`,
      [orderGoods]
    );

    // 更新商品库存
    for (const item of goods) {
      await db.query(
        'UPDATE goods SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.goodsId]
      );
    }

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
    
    // 参数验证和转换
    const pageNum = parseInt(page) || 1;
    const pageSizeNum = parseInt(pageSize) || 10;
    const offset = (pageNum - 1) * pageSizeNum;

    // 先获取总数统计
    let countSql = 'SELECT ' +
                   'COUNT(*) as total, ' +
                   'SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as unpaid_count, ' +
                   'SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as paid_count, ' +
                   'SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as shipped_count, ' +
                   'SUM(CASE WHEN status = 3 THEN 1 ELSE 0 END) as completed_count ' +
                   'FROM orders WHERE user_id = ?';
    const countParams = [userId];

    // 状态条件也要加到总数查询中
    if (status !== undefined && status !== '' && !isNaN(status)) {
      const statusNum = parseInt(status);
      if (statusNum >= 0 && statusNum <= 4) {
        countSql += ' AND status = ?';
        countParams.push(statusNum);
      }
    }

    // 打印完整的统计查询 SQL
    let countParamIndex = 0;
    const fullCountSql = countSql.replace(/\?/g, () => {
      const value = countParams[countParamIndex++];
      return typeof value === 'string' ? `'${value}'` : value;
    });
    console.log('完整的订单统计查询 SQL:', fullCountSql);

    const [counts] = await db.query(countSql, countParams);
    const total = counts[0].total;

    // 如果已经没有更多数据，直接返回
    if (offset >= total) {
      return res.json({
        code: 0,
        data: {
          list: [],
          pagination: {
            total,
            page: pageNum,
            pageSize: pageSizeNum,
            hasMore: false
          },
          summary: {
            total: counts[0].total,
            unpaid: counts[0].unpaid_count,
            paid: counts[0].paid_count,
            shipped: counts[0].shipped_count,
            completed: counts[0].completed_count
          }
        },
        message: '获取成功'
      });
    }

    // 构建查询条件
    let sql = 'SELECT o.*, ' +
              '(SELECT COUNT(*) FROM order_goods WHERE order_id = o.id) as goods_count ' +
              'FROM orders o WHERE o.user_id = ?';
    const params = [userId];

    // 只有当 status 是有效数字时才添加状态条件
    if (status !== undefined && status !== '' && !isNaN(status)) {
      const statusNum = parseInt(status);
      if (statusNum >= 0 && statusNum <= 4) {
        sql += ' AND o.status = ?';
        params.push(statusNum);
      }
    }

    // 添加排序和分页
    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    params.push(pageSizeNum, offset);

    // 打印完整的 SQL 查询语句
    let paramIndex = 0;
    const fullSql = sql.replace(/\?/g, () => {
      const value = params[paramIndex++];
      return typeof value === 'string' ? `'${value}'` : value;
    });
    console.log('完整的订单列表查询 SQL:', fullSql);

    // 查询订单列表
    const [orders] = await db.query(sql, params);
    console.log('订单列表查询结果:', orders.length, '条记录');

    // 获取每个订单的商品信息
    for (const order of orders) {
      const [goods] = await db.query(
        `SELECT og.*, g.name, g.image_url, g.price as current_price
         FROM order_goods og
         LEFT JOIN goods g ON og.goods_id = g.id
         WHERE og.order_id = ?`,
        [order.id]
      );

      order.goods = goods;
      order.statusText = {
        0: '待支付',
        1: '已支付',
        2: '已发货',
        3: '已完成',
        4: '已取消'
      }[order.status] || '未知状态';
    }

    // 计算是否还有更多数据
    const hasMore = offset + orders.length < total;

    res.json({
      code: 0,
      data: {
        list: orders,
        pagination: {
          total,
          page: pageNum,
          pageSize: pageSizeNum,
          hasMore // 添加是否还有更多数据的标志
        },
        summary: {
          total: counts[0].total,
          unpaid: counts[0].unpaid_count,
          paid: counts[0].paid_count,
          shipped: counts[0].shipped_count,
          completed: counts[0].completed_count
        }
      },
      message: '获取成功'
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '获取订单列表失败'
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

// 支付订单
exports.pay = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;
    const orderNo = req.body.orderId;

    let sql = 'SELECT * FROM orders WHERE user_id = ?';
    const params = [userId];

    if (orderId) {
      sql += ' AND id = ?';
      params.push(orderId);
    } else if (orderNo) {
      sql += ' AND order_no = ?';
      params.push(orderNo);
    } else {
      return res.status(400).json({
        code: 400,
        message: '订单ID或订单号不能为空'
      });
    }

    // 检查订单是否存在
    const [orders] = await db.query(sql, params);

    if (orders.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '订单不存在'
      });
    }

    const order = orders[0];

    // 只能支付待支付状态的订单
    if (order.status !== 0) {
      return res.status(400).json({
        code: 400,
        message: '订单状态不允许支付'
      });
    }

    // 开发环境直接更新订单状态
    if (process.env.NODE_ENV !== 'production') {
      await db.query(
        `UPDATE orders SET 
         status = 1,
         pay_time = NOW(),
         transaction_id = ?
         WHERE order_no = ?`,
        ['mock_transaction_' + Date.now(), order.order_no]
      );

      return res.json({
        code: 0,
        message: '支付成功'
      });
    }

    // 调用支付接口
    const result = await wxpayApi.unifiedOrder({
      out_trade_no: order.order_no,
      body: '商城订单',
      total_fee: Math.floor(order.total_amount * 100),
      openid: order.openid,
      trade_type: 'JSAPI'
    });

    if(!result.prepay_id) {
      throw new Error('获取prepay_id失败');
    }

    // 生成支付参数
    const timeStamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = result.nonce_str;
    const prepayId = result.prepay_id;
    
    // 生成签名
    const signParams = {
      appId: config.wxpay.appId,
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: 'MD5'
    };

    const paySign = wxpayApi.getSign(signParams);

    res.json({
      code: 0,
      data: {
        timeStamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType: 'MD5',
        paySign
      },
      message: '获取支付参数成功'
    });

  } catch (error) {
    console.error('支付失败:', error);
    res.status(500).json({
      code: 500,
      message: '支付失败'
    });
  }
};

// 支付结果通知
exports.payNotify = async (req, res) => {
  try {
    const result = await wxpayApi.middleware(req, res);
    
    // 支付成功
    if(result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
      const orderNo = result.out_trade_no;
      const transactionId = result.transaction_id;
      
      // 更新订单状态
      await db.query(
        `UPDATE orders SET 
         status = 1,
         pay_time = NOW(),
         transaction_id = ?
         WHERE order_no = ?`,
        [transactionId, orderNo]
      );
    }

    // 返回成功通知
    res.success();
  } catch (error) {
    console.error('支付通知处理失败:', error);
    res.fail('处理失败');
  }
}; 
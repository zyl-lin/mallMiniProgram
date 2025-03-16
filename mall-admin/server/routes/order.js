const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// 获取订单列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, order_no, status } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    
    if (order_no) {
      sql += ' AND order_no LIKE ?';
      params.push(`%${order_no}%`);
    }
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    // 添加排序和分页
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    // 获取总数
    const [countRows] = await db.query(
      'SELECT COUNT(*) as total FROM orders WHERE 1=1' + 
      (order_no ? ' AND order_no LIKE ?' : '') +
      (status !== undefined ? ' AND status = ?' : ''),
      params.slice(0, -2)
    );

    // 获取订单列表
    const [rows] = await db.query(sql, params);

    res.json({
      code: 0,
      data: {
        list: rows,
        total: countRows[0].total
      }
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    res.json({
      code: 500,
      message: '获取订单列表失败'
    });
  }
});

// 获取订单详情
router.get('/detail', async (req, res) => {
  try {
    const { id } = req.query;
    
    // 获取订单基本信息
    const [orderRows] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orderRows.length === 0) {
      return res.json({
        code: 404,
        message: '订单不存在'
      });
    }

    // 获取订单商品信息
    const [goodsRows] = await db.query(
      'SELECT * FROM order_goods WHERE order_id = ?',
      [id]
    );

    const orderDetail = {
      ...orderRows[0],
      goods: goodsRows
    };

    res.json({
      code: 0,
      data: orderDetail
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    res.json({
      code: 500,
      message: '获取订单详情失败'
    });
  }
});

module.exports = router; 
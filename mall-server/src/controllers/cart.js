const db = require('../utils/db');

// 获取购物车列表
exports.getList = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      `SELECT c.*, g.name, g.cover, g.price, g.stock 
       FROM cart c 
       LEFT JOIN goods g ON c.goods_id = g.id 
       WHERE c.user_id = ? AND g.status = 1 
       ORDER BY c.create_time DESC`,
      [userId]
    );

    // 计算总价
    const totalPrice = rows.reduce((sum, item) => {
      if (item.selected) {
        return sum + item.price * item.quantity;
      }
      return sum;
    }, 0);

    res.json({
      code: 0,
      data: {
        list: rows,
        totalPrice: parseFloat(totalPrice.toFixed(2))
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取购物车列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取购物车列表失败'
    });
  }
};

// 添加商品到购物车
exports.add = async (req, res) => {
  try {
    const userId = req.userId;
    const { goodsId, quantity = 1 } = req.body;

    // 检查商品是否存在且上架
    const [goods] = await db.query(
      'SELECT * FROM goods WHERE id = ? AND status = 1',
      [goodsId]
    );

    if (goods.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '商品不存在或已下架'
      });
    }

    // 检查库存
    if (goods[0].stock < quantity) {
      return res.status(400).json({
        code: 400,
        message: '商品库存不足'
      });
    }

    // 检查是否已在购物车
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND goods_id = ?',
      [userId, goodsId]
    );

    if (existing.length > 0) {
      // 更新数量
      const newQuantity = existing[0].quantity + quantity;
      if (newQuantity > goods[0].stock) {
        return res.status(400).json({
          code: 400,
          message: '商品库存不足'
        });
      }

      await db.query(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
    } else {
      // 新增记录
      await db.query(
        'INSERT INTO cart (user_id, goods_id, quantity) VALUES (?, ?, ?)',
        [userId, goodsId, quantity]
      );
    }

    res.json({
      code: 0,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加购物车失败:', error);
    res.status(500).json({
      code: 500,
      message: '添加购物车失败'
    });
  }
};

// 更新购物车商品数量
exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.userId;
    const { id, quantity } = req.body;

    // 检查记录是否存在
    const [cart] = await db.query(
      'SELECT c.*, g.stock FROM cart c LEFT JOIN goods g ON c.goods_id = g.id WHERE c.id = ? AND c.user_id = ?',
      [id, userId]
    );

    if (cart.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '购物车记录不存在'
      });
    }

    // 检查库存
    if (quantity > cart[0].stock) {
      return res.status(400).json({
        code: 400,
        message: '商品库存不足'
      });
    }

    await db.query(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, userId]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新购物车数量失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新购物车数量失败'
    });
  }
};

// 删除购物车商品
exports.delete = async (req, res) => {
  try {
    const userId = req.userId;
    const { ids } = req.body;

    await db.query(
      'DELETE FROM cart WHERE id IN (?) AND user_id = ?',
      [ids, userId]
    );

    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除购物车商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除购物车商品失败'
    });
  }
};

// 更新商品选中状态
exports.updateSelected = async (req, res) => {
  try {
    const userId = req.userId;
    const { ids, selected } = req.body;

    await db.query(
      'UPDATE cart SET selected = ? WHERE id IN (?) AND user_id = ?',
      [selected ? 1 : 0, ids, userId]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新选中状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新选中状态失败'
    });
  }
}; 
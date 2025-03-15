const db = require('../utils/db');

// 获取地址列表
exports.getList = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      'SELECT * FROM address WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json({
      code: 0,
      data: rows,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取地址列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取地址列表失败'
    });
  }
};

// 添加地址
exports.add = async (req, res) => {
  try {
    const userId = req.userId;
    const { receiver_name, receiver_phone, province, city, district, detail_address, is_default } = req.body;

    // 如果设置为默认地址，先将其他地址设为非默认
    if (is_default) {
      await db.query(
        'UPDATE address SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    await db.query(
      'INSERT INTO address (user_id, receiver_name, receiver_phone, province, city, district, detail_address, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, receiver_name, receiver_phone, province, city, district, detail_address, is_default ? 1 : 0]
    );

    res.json({
      code: 0,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加地址失败:', error);
    res.status(500).json({
      code: 500,
      message: '添加地址失败'
    });
  }
};

// 更新地址
exports.update = async (req, res) => {
  try {
    const userId = req.userId;
    const { id, receiver_name, receiver_phone, province, city, district, detail_address, is_default } = req.body;

    // 检查地址是否存在
    const [address] = await db.query(
      'SELECT * FROM address WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (address.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在'
      });
    }

    // 如果设置为默认地址，先将其他地址设为非默认
    if (is_default) {
      await db.query(
        'UPDATE address SET is_default = 0 WHERE user_id = ?',
        [userId]
      );
    }

    await db.query(
      'UPDATE address SET receiver_name = ?, receiver_phone = ?, province = ?, city = ?, district = ?, detail_address = ?, is_default = ? WHERE id = ? AND user_id = ?',
      [receiver_name, receiver_phone, province, city, district, detail_address, is_default ? 1 : 0, id, userId]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新地址失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新地址失败'
    });
  }
};

// 删除地址
exports.delete = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    await db.query(
      'DELETE FROM address WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除地址失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除地址失败'
    });
  }
};

// 设置默认地址
exports.setDefault = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body;

    // 先将所有地址设为非默认
    await db.query(
      'UPDATE address SET is_default = 0 WHERE user_id = ?',
      [userId]
    );

    // 设置指定地址为默认
    await db.query(
      'UPDATE address SET is_default = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      code: 0,
      message: '设置成功'
    });
  } catch (error) {
    console.error('设置默认地址失败:', error);
    res.status(500).json({
      code: 500,
      message: '设置默认地址失败'
    });
  }
};

// 获取地址详情
exports.getDetail = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.query;

    const [rows] = await db.query(
      'SELECT * FROM address WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '地址不存在'
      });
    }

    res.json({
      code: 0,
      data: rows[0],
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取地址详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取地址详情失败'
    });
  }
};

// 获取默认地址
exports.getDefault = async (req, res) => {
  try {
    const userId = req.userId;
    const [rows] = await db.query(
      'SELECT * FROM address WHERE user_id = ? AND is_default = 1 LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.json({
        code: 0,
        data: null,
        message: '暂无默认地址'
      });
    }

    res.json({
      code: 0,
      data: rows[0],
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取默认地址失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取默认地址失败'
    });
  }
}; 
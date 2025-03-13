const db = require('../utils/db');

// 获取商品列表
exports.getList = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, categoryId, keyword } = req.query;
    const offset = (page - 1) * pageSize;

    let sql = 'SELECT * FROM goods WHERE status = 1';
    const params = [];

    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }

    if (keyword) {
      sql += ' AND name LIKE ?';
      params.push(`%${keyword}%`);
    }

    sql += ' ORDER BY sort DESC LIMIT ? OFFSET ?';
    params.push(parseInt(pageSize), offset);

    const [goods] = await db.query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM goods WHERE status = 1';
    const countParams = [];

    if (categoryId) {
      countSql += ' AND category_id = ?';
      countParams.push(categoryId);
    }

    if (keyword) {
      countSql += ' AND name LIKE ?';
      countParams.push(`%${keyword}%`);
    }

    const [total] = await db.query(countSql, countParams);

    res.json({
      code: 0,
      data: {
        list: goods,
        pagination: {
          total: total[0].total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品列表失败'
    });
  }
};

// 获取商品详情
exports.getDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [goods] = await db.query('SELECT * FROM goods WHERE id = ? AND status = 1', [id]);

    if (goods.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '商品不存在'
      });
    }

    // 获取分类信息
    const [categories] = await db.query('SELECT * FROM category WHERE id = ?', [goods[0].category_id]);

    res.json({
      code: 0,
      data: {
        ...goods[0],
        category: categories[0],
        pics: JSON.parse(goods[0].pics || '[]')
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取商品详情失败'
    });
  }
};

// 获取推荐商品
exports.getRecommend = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const [goods] = await db.query(
      'SELECT * FROM goods WHERE status = 1 AND is_recommend = 1 ORDER BY sort DESC LIMIT ?',
      [parseInt(limit)]
    );

    res.json({
      code: 0,
      data: goods,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取推荐商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取推荐商品失败'
    });
  }
}; 
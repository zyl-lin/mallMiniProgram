const db = require('../utils/db');

// 获取分类列表
exports.getList = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM category ORDER BY sort DESC');
    console.log('查询结果:', rows);

    // 直接返回分类列表，不构建树形结构
    res.json({
      code: 0,
      data: rows,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类列表失败'
    });
  }
};

// 获取首页分类
exports.getHomeCategories = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const [categories] = await db.query(
      'SELECT * FROM category ORDER BY sort DESC LIMIT ?',
      [parseInt(limit)]
    );

    res.json({
      code: 0,
      data: categories,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取首页分类失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取首页分类失败'
    });
  }
};

// 获取分类商品
exports.getCategoryGoods = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 获取分类信息
    const [categories] = await db.query('SELECT * FROM category WHERE id = ?', [id]);
    if (categories.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '分类不存在'
      });
    }

    // 获取商品列表
    const [goods] = await db.query(
      'SELECT * FROM goods WHERE category_id = ? AND status = 1 ORDER BY create_time DESC LIMIT ? OFFSET ?',
      [id, parseInt(pageSize), offset]
    );

    // 获取商品总数
    const [total] = await db.query(
      'SELECT COUNT(*) as total FROM goods WHERE category_id = ? AND status = 1',
      [id]
    );

    res.json({
      code: 0,
      data: {
        category: categories[0],
        goods,
        pagination: {
          total: total[0].total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      },
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取分类商品失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取分类商品失败'
    });
  }
}; 
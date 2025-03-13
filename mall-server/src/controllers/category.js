const db = require('../utils/db');

// 获取分类列表
exports.getList = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM category ORDER BY sort ASC');
    
    // 构建分类树
    const categoryTree = rows
      .filter(item => item.parent_id === 0)
      .map(item => ({
        ...item,
        children: rows
          .filter(child => child.parent_id === item.id)
          .sort((a, b) => a.sort - b.sort)
      }))
      .sort((a, b) => a.sort - b.sort);

    res.json({
      code: 0,
      data: categoryTree,
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
    // 获取启用状态的一级分类
    const [categories] = await db.query(
      'SELECT * FROM category WHERE level = 1 AND status = 1 ORDER BY sort ASC LIMIT 10'
    );

    // 获取每个分类下的商品
    const result = await Promise.all(
      categories.map(async category => {
        const [goods] = await db.query(
          'SELECT * FROM goods WHERE category_id = ? AND status = 1 ORDER BY sort DESC LIMIT 4',
          [category.id]
        );
        return {
          ...category,
          goods
        };
      })
    );

    res.json({
      code: 0,
      data: result,
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
      'SELECT * FROM goods WHERE category_id = ? AND status = 1 ORDER BY sort DESC LIMIT ? OFFSET ?',
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
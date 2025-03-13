const db = require('../utils/db');

// 获取轮播图列表
exports.getBannerList = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banner ORDER BY sort DESC');
    res.json({
      code: 0,
      data: rows,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取轮播图列表失败'
    });
  }
};

// 添加轮播图
exports.addBanner = async (req, res) => {
  try {
    const { image_url, link_url, sort = 0 } = req.body;
    const [result] = await db.query(
      'INSERT INTO banner (image_url, link_url, sort) VALUES (?, ?, ?)',
      [image_url, link_url, sort]
    );
    res.json({
      code: 0,
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加轮播图失败:', error);
    res.status(500).json({
      code: 500,
      message: '添加轮播图失败'
    });
  }
};

// 编辑轮播图
exports.updateBanner = async (req, res) => {
  try {
    const { id, image_url, link_url, sort, status } = req.body;
    const [result] = await db.query(
      'UPDATE banner SET image_url = ?, link_url = ?, sort = ?, status = ? WHERE id = ?',
      [image_url, link_url, sort, status, id]
    );
    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新轮播图失败'
    });
  }
};

// 删除轮播图
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM banner WHERE id = ?', [id]);
    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除轮播图失败'
    });
  }
};

// 修改轮播图状态
exports.updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await db.query('UPDATE banner SET status = ? WHERE id = ?', [status, id]);
    res.json({
      code: 0,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新轮播图状态失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新轮播图状态失败'
    });
  }
};

// 修改轮播图排序
exports.updateSort = async (req, res) => {
  try {
    const { id, sort } = req.body;
    await db.query('UPDATE banner SET sort = ? WHERE id = ?', [sort, id]);
    res.json({
      code: 0,
      message: '排序更新成功'
    });
  } catch (error) {
    console.error('更新轮播图排序失败:', error);
    res.status(500).json({
      code: 500,
      message: '更新轮播图排序失败'
    });
  }
}; 
const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// 获取轮播图列表
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM banner ORDER BY sort DESC');
    res.json({
      code: 0,
      data: rows
    });
  } catch (error) {
    console.error('获取轮播图列表失败:', error);
    res.json({
      code: 500,
      message: '获取轮播图列表失败'
    });
  }
});

// 添加轮播图
router.post('/add', async (req, res) => {
  try {
    const { image_url, link_url, sort = 0, status = 1 } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO banner (image_url, link_url, sort, status, create_time) VALUES (?, ?, ?, ?, NOW())',
      [image_url, link_url, sort, status]
    );
    
    const [insertedBanner] = await db.query('SELECT * FROM banner WHERE id = ?', [result.insertId]);
    
    res.json({
      code: 0,
      message: '添加成功',
      data: insertedBanner[0]
    });
  } catch (error) {
    console.error('添加轮播图失败:', error);
    res.json({
      code: 500,
      message: '添加轮播图失败'
    });
  }
});

// 更新轮播图
router.put('/update', async (req, res) => {
  try {
    const { id, image_url, link_url, sort, status } = req.body;
    
    await db.query(
      'UPDATE banner SET image_url = ?, link_url = ?, sort = ?, status = ? WHERE id = ?',
      [image_url, link_url, sort, status, id]
    );
    
    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新轮播图失败:', error);
    res.json({
      code: 500,
      message: '更新轮播图失败'
    });
  }
});

// 删除轮播图
router.delete('/delete/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.query('DELETE FROM banner WHERE id = ?', [id]);
    
    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除轮播图失败:', error);
    res.json({
      code: 500,
      message: '删除轮播图失败'
    });
  }
});

// 更新轮播图状态
router.post('/status', async (req, res) => {
  try {
    const { id, status } = req.body;
    
    await db.query(
      'UPDATE banner SET status = ? WHERE id = ?',
      [status, id]
    );
    
    res.json({
      code: 0,
      message: '状态更新成功'
    });
  } catch (error) {
    console.error('更新状态失败:', error);
    res.json({
      code: 500,
      message: '更新状态失败'
    });
  }
});

module.exports = router; 
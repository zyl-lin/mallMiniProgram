const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../utils/db');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // 确保这个目录存在
  },
  filename: function (req, file, cb) {
    // 保留原始文件扩展名
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只能上传图片文件!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 获取商品列表
router.get('/list', async (req, res) => {
  try {
    const { page = 1, limit = 20, name, status } = req.query;
    const offset = (page - 1) * limit;
    
    let sql = 'SELECT * FROM goods WHERE 1=1';
    const params = [];
    
    if (name) {
      sql += ' AND name LIKE ?';
      params.push(`%${name}%`);
    }
    
    if (status !== undefined) {
      sql += ' AND status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.query(sql, params);
    const [total] = await db.query('SELECT COUNT(*) as total FROM goods', []);
    
    res.json({
      code: 0,
      data: {
        list: rows,
        total: total[0].total
      }
    });
  } catch (error) {
    console.error('获取商品列表失败:', error);
    res.json({
      code: 500,
      message: '获取商品列表失败'
    });
  }
});

// 添加商品
router.post('/add', async (req, res) => {
  try {
    const { 
      name, 
      category_id, 
      price, 
      stock, 
      image_url, 
      detail, 
      status = 1 
    } = req.body;

    const [result] = await db.query(
      `INSERT INTO goods 
       (name, category_id, price, stock, image_url, detail, status, create_time) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [name, category_id, price, stock, image_url, detail, status]
    );

    res.json({
      code: 0,
      data: {
        id: result.insertId
      },
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加商品失败:', error);
    res.json({
      code: 500,
      message: '添加商品失败'
    });
  }
});

// 获取商品详情
router.get('/detail/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM goods WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.json({
        code: 404,
        message: '商品不存在'
      });
    }

    res.json({
      code: 0,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取商品详情失败:', error);
    res.json({
      code: 500,
      message: '获取商品详情失败'
    });
  }
});

// 更新商品
router.post('/update', async (req, res) => {
  try {
    const { 
      id,
      name,
      category_id,
      price,
      stock,
      image_url,
      detail,
      status,
      is_recommend // 确保接收推荐状态
    } = req.body;

    await db.query(
      `UPDATE goods 
       SET name = ?, category_id = ?, price = ?, stock = ?, 
           image_url = ?, detail = ?, status = ?, is_recommend = ?, update_time = NOW()
       WHERE id = ?`,
      [name, category_id, price, stock, image_url, detail, status, is_recommend, id]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新商品失败:', error);
    res.json({
      code: 500,
      message: '更新商品失败'
    });
  }
});

// 添加文件上传路由
router.post('/upload-image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 1,
        message: '没有上传文件'
      });
    }
    
    // 返回完整的URL路径
    const fileUrl = `http://localhost:3000/uploads/${req.file.filename}`;
    res.json({
      code: 0,
      data: {
        url: fileUrl
      },
      message: '上传成功'
    });
  } catch (error) {
    res.json({
      code: 1,
      message: '上传失败: ' + error.message
    });
  }
});

// 批量上下架
router.put('/batch-status', async (req, res) => {
  try {
    const { ids, status } = req.body;
    
    await db.query(
      'UPDATE goods SET status = ? WHERE id IN (?)',
      [status, ids]
    );

    res.json({
      code: 0,
      message: '批量更新成功'
    });
  } catch (error) {
    console.error('批量更新状态失败:', error);
    res.json({
      code: 500,
      message: '批量更新状态失败'
    });
  }
});

// 更新商品推荐状态
router.put('/recommend', async (req, res) => {
  try {
    const { id, is_recommend } = req.body;
    
    await db.query(
      'UPDATE goods SET is_recommend = ? WHERE id = ?',
      [is_recommend, id]
    );

    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新推荐状态失败:', error);
    res.json({
      code: 500,
      message: '更新推荐状态失败'
    });
  }
});

module.exports = router; 
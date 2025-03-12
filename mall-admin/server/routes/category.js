const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../utils/db');

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/category/') // 分类图片专门的目录
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}.${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上传图片文件!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  }
});

// 获取分类列表
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM category ORDER BY sort DESC');
    res.json({
      code: 0,
      data: rows,
      message: '获取成功'
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.json({
      code: 500,
      message: '获取分类列表失败'
    });
  }
});

// 添加分类
router.post('/add', async (req, res) => {
  try {
    const { name, image_url, sort = 0 } = req.body;
    const [result] = await db.query(
      'INSERT INTO category (name, image_url, sort) VALUES (?, ?, ?)',
      [name, image_url, sort]
    );
    res.json({
      code: 0,
      data: {
        id: result.insertId
      },
      message: '添加成功'
    });
  } catch (error) {
    console.error('添加分类失败:', error);
    res.json({
      code: 1,
      message: '添加分类失败'
    });
  }
});

// 更新分类
router.post('/update', async (req, res) => {
  try {
    const { id, name, image_url, sort } = req.body;
    await db.query(
      'UPDATE category SET name = ?, image_url = ?, sort = ? WHERE id = ?',
      [name, image_url, sort, id]
    );
    res.json({
      code: 0,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新分类失败:', error);
    res.json({
      code: 1,
      message: '更新分类失败'
    });
  }
});

// 删除分类
router.post('/delete', async (req, res) => {
  try {
    const { id } = req.body;
    await db.query('DELETE FROM category WHERE id = ?', [id]);
    res.json({
      code: 0,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除分类失败:', error);
    res.json({
      code: 1,
      message: '删除分类失败'
    });
  }
});

// 添加分类图片上传路由
router.post('/upload-image', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        code: 1,
        message: '没有上传文件'
      });
    }
    
    // 返回完整的URL路径
    const fileUrl = `http://localhost:3000/uploads/category/${req.file.filename}`;
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

module.exports = router; 
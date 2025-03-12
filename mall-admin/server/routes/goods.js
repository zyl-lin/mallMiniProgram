const express = require('express');
const router = express.Router();
const multer = require('multer');

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
router.get('/list', (req, res) => {
  res.json({
    code: 0,
    data: []
  });
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

module.exports = router; 
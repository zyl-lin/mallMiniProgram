const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json()); // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true }));

// Session配置
app.use(session({
  secret: 'mall-admin-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// 确保上传目录存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 静态文件服务 - 前端构建文件
app.use(express.static(path.join(__dirname, 'dist')));

// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API路由
const adminRoutes = require('./server/routes/admin');
const bannerRoutes = require('./server/routes/banner');
const categoryRoutes = require('./server/routes/category');
const goodsRoutes = require('./server/routes/goods');
const orderRoutes = require('./server/routes/order');
const statsRoutes = require('./server/routes/stats');

// API路由
app.use('/api/admin', adminRoutes);
app.use('/api/admin/banner', bannerRoutes);
app.use('/api/admin/category', categoryRoutes);
app.use('/api/admin/goods', goodsRoutes);
app.use('/api/admin/order', orderRoutes);
app.use('/api/admin/stats', statsRoutes);

// 所有其他请求返回前端页面
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin panel available at: http://localhost:8080`);
}); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

// 打印初始环境变量
console.log('Initial NODE_ENV:', process.env.NODE_ENV);

// 确保环境变量设置正确
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log('Current NODE_ENV:', NODE_ENV);

// 根据 NODE_ENV 加载对应的环境变量文件
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
console.log('Loading env file:', envFile);

// 加载环境变量文件
dotenv.config({ path: path.join(__dirname, '..', envFile) });

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 路由配置
const routes = require('./routes');
app.use('/api', routes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('----------------------------------------');
  console.log(`Server is running in ${NODE_ENV} mode`);
  console.log(`Port: ${PORT}`);
  console.log(`Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`API URL: ${process.env.API_URL}`);
  console.log('----------------------------------------');
}); 
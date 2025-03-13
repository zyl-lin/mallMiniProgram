const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// 打印初始环境变量
console.log('Initial NODE_ENV:', process.env.NODE_ENV);

// 确保环境变量设置正确
const NODE_ENV = process.env.NODE_ENV || 'development';
console.log('Current NODE_ENV:', NODE_ENV);

// 根据 NODE_ENV 加载对应的环境变量文件
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';
const envPath = path.resolve(__dirname, envFile);
console.log('Absolute env file path:', envPath);

// 检查文件是否存在
if (fs.existsSync(envPath)) {
  console.log('Env file exists');
  
  // 读取并解析文件内容
  const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
  
  // 手动设置环境变量
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  
  console.log('Loaded environment variables:', {
    PORT: process.env.PORT,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    API_URL: process.env.API_URL
  });
} else {
  console.error('Env file not found at:', envPath);
}

// 创建Express应用
const app = express();

// 中间件配置
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由配置
const routes = require('./src/routes');
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
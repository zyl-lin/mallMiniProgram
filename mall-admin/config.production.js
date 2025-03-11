const baseConfig = require('./config.base')

module.exports = {
  ...baseConfig,
  
  // 数据库配置
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  },

  // 文件存储配置
  storage: {
    type: 'oss',
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET
  },

  // 日志配置
  logger: {
    level: 'info',
    filename: 'logs/app-prod.log'
  },

  // API配置
  apiUrl: 'https://mall-server.guoxu.tech'
} 
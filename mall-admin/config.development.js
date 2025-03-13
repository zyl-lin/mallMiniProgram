const baseConfig = require('./config.base')

module.exports = {
  ...baseConfig,
  
  // 数据库配置
  database: {
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: 'root',
    database: 'mall'
  },

  // 文件存储配置
  storage: {
    type: 'local',
    path: 'uploads'
  },

  // 日志配置
  logger: {
    level: 'debug',
    filename: 'logs/app-dev.log'
  },

  // API配置
  apiUrl: 'http://localhost:3000'
} 
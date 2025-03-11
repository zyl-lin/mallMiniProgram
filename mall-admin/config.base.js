module.exports = {
  // 通用配置
  port: 3000,
  apiPrefix: '/api/v1',
  
  // JWT配置
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiration: '24h',
  
  // 跨域配置
  cors: {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  },
  
  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['image/jpeg', 'image/png']
  }
} 
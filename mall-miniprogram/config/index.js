module.exports = {
  // 微信小程序配置
  wx: {
    appId: 'your-app-id', // 小程序 appId
    appSecret: 'your-app-secret' // 小程序 appSecret
  },
  
  // JWT配置
  jwt: {
    secret: 'your-jwt-secret', // JWT密钥
    expiresIn: '7d'
  },

  db: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mall'
  }
} 
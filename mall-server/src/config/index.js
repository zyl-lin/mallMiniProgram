module.exports = {
  port: process.env.PORT || 4000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mall'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  wxpay: {
    appId: process.env.WX_APP_ID,
    mchId: process.env.WX_MCH_ID,
    apiKey: process.env.WX_API_KEY,
    notifyUrl: process.env.WX_NOTIFY_URL || 'https://your-domain.com/api/order/pay/notify',
    pfx: process.env.WX_PFX_PATH,
    sandbox: process.env.NODE_ENV !== 'production'
  }
}; 
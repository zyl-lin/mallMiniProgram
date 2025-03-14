App({
  onLaunch() {
    // 获取本地存储的用户信息
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
    
    // 执行静默登录
    const { silentLogin } = require('./utils/auth.js')
    silentLogin().catch(err => {
      console.log('静默登录失败:', err)
    })
  },
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:4000'
  }
}) 
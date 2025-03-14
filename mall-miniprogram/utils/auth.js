const app = getApp()

// 获取用户信息
export const getUserInfo = () => {
  return wx.getStorageSync('userInfo')
}

// 检查登录状态
export const checkLogin = () => {
  const token = wx.getStorageSync('token')
  const userInfo = wx.getStorageSync('userInfo')
  return !!(token && userInfo)
}

// 获取token
export const getToken = () => {
  return wx.getStorageSync('token')
}

// 静默登录
export const silentLogin = async () => {
  try {
    const token = wx.getStorageSync('token')
    if (!token) {
      throw new Error('未登录')
    }
    
    // 验证token有效性
    const res = await request({
      url: '/api/user/checkToken',
      method: 'POST',
      data: { token }
    })
    
    if (res.code !== 0) {
      throw new Error('登录已过期')
    }
    
    return true
  } catch (error) {
    console.error('静默登录失败:', error)
    throw error
  }
}

// 退出登录
export const logout = () => {
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
} 
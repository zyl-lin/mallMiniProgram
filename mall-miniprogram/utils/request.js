const app = getApp()

// 修改图片URL协议
const formatImageUrl = (url) => {
  if (url && url.startsWith('http://localhost')) {
    // 开发环境保持HTTP
    return url
  }
  if (url && url.startsWith('http://')) {
    // 生产环境转换为HTTPS
    return url.replace('http://', 'https://')
  }
  return url
}

// 封装请求方法
const request = (options) => {
  // 获取token
  const token = wx.getStorageSync('token')
  console.log('=== API请求 ===')
  console.log('请求地址:', options.url)
  console.log('请求方法:', options.method || 'GET')
  console.log('请求头:', {
    'content-type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  })
  console.log('请求数据:', options.data)
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      success: (res) => {
        console.log('响应数据:', res.data)
        if (res.statusCode !== 200) {
          console.error('请求失败:', res)
          reject(res)
          return
        }
        
        if (res.data.code === 401) {
          // token过期，清除本地存储并跳转到登录页
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.navigateTo({
            url: '/pages/login/index'
          })
          reject(res.data)
        } else {
          if (res.data && Array.isArray(res.data.data)) {
            res.data.data = res.data.data.map(item => {
              if (item.image_url) {
                item.image_url = formatImageUrl(item.image_url)
              }
              if (item.cover) {
                item.cover = formatImageUrl(item.cover)
              }
              return item
            })
          }
          resolve(res.data)
        }
      },
      fail: (err) => {
        console.error('请求失败:', err)
        reject(err)
      }
    })
  })
}

module.exports = {
  request
} 
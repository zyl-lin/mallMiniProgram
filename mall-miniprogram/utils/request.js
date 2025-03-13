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
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 格式化图片URL
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
        } else {
          reject(res)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

module.exports = {
  request
} 
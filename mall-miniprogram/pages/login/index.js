const { request } = require('../../utils/request')

Page({
  data: {
    phone: '',
    password: ''
  },

  // 输入手机号
  onPhoneInput(e) {
    this.setData({
      phone: e.detail.value
    })
  },

  // 输入密码
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 登录
  async login() {
    const { phone, password } = this.data
    
    if (!phone || !password) {
      wx.showToast({
        title: '请输入手机号和密码',
        icon: 'none'
      })
      return
    }

    try {
      const res = await request({
        url: '/api/user/login',
        method: 'POST',
        data: {
          phone,
          password
        }
      })

      if (res.code === 0) {
        // 保存token
        wx.setStorageSync('token', res.data.token)
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('登录失败:', error)
      wx.showToast({
        title: error.data?.message || '登录失败',
        icon: 'none'
      })
    }
  }
}) 
const { request } = require('../../utils/request')

Page({
  data: {
    userInfo: null,
    hasUserInfo: false
  },

  // 获取用户信息并登录
  async getUserProfile() {
    console.log('=== Login Process Started ===')
    try {
      // 1. 获取用户信息
      console.log('Requesting user profile...')
      const profileRes = await wx.getUserProfile({
        desc: '用于完善会员资料'
      })
      console.log('User profile response:', profileRes)
      
      // 2. 获取登录凭证
      console.log('Getting login code...')
      const loginRes = await wx.login()
      console.log('Login code response:', loginRes)
      
      // 3. 发送登录请求
      console.log('Sending login request...')
      const res = await request({
        url: '/api/user/login',
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: {
            nickName: profileRes.userInfo.nickName,
            avatarUrl: profileRes.userInfo.avatarUrl
          }
        }
      })
      console.log('Login API response:', res)

      if (res.code === 0 && res.data.token) {
        console.log('=== Login Success ===')
        console.log('Saving token and userInfo...')
        
        const userInfo = {
          nickname: profileRes.userInfo.nickName,
          avatar_url: profileRes.userInfo.avatarUrl
        }
        
        // 保存token和用户信息
        wx.setStorageSync('token', res.data.token)
        wx.setStorageSync('userInfo', userInfo)
        
        // 更新全局用户信息
        const app = getApp()
        app.globalData.userInfo = userInfo
        console.log('Updated global userInfo:', app.globalData.userInfo)
        
        // 更新当前页面
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 返回上一页
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        throw new Error(res.msg || '登录失败')
      }
    } catch (err) {
      console.error('=== Login Failed ===', err)
      wx.showToast({
        title: err.message || '登录失败',
        icon: 'none'
      })
    }
  }
}) 
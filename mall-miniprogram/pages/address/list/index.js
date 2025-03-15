const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    addressList: [],
    loading: true
  },

  onShow() {
    if (!checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    this.getAddressList()
  },

  // 获取地址列表
  async getAddressList() {
    try {
      const res = await request({
        url: '/api/address/list'
      })
      if (res.code === 0) {
        this.setData({
          addressList: res.data,
          loading: false
        })
      }
    } catch (err) {
      console.error('获取地址列表失败:', err)
      this.setData({ loading: false })
      wx.showToast({
        title: '获取地址列表失败',
        icon: 'none'
      })
    }
  },

  // 新增地址
  addAddress() {
    wx.navigateTo({
      url: '/pages/address/edit/index'
    })
  },

  // 编辑地址
  editAddress(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/address/edit/index?id=${id}`
    })
  },

  // 设为默认地址
  async setDefault(e) {
    const { id } = e.currentTarget.dataset
    try {
      const res = await request({
        url: '/api/address/set-default',
        method: 'POST',
        data: { id }
      })
      if (res.code === 0) {
        wx.showToast({
          title: '设置成功',
          icon: 'success'
        })
        this.getAddressList()
      }
    } catch (err) {
      console.error('设置默认地址失败:', err)
      wx.showToast({
        title: '设置失败',
        icon: 'none'
      })
    }
  },

  // 删除地址
  deleteAddress(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确定要删除该地址吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await request({
              url: '/api/address/delete',
              method: 'POST',
              data: { id }
            })
            if (res.code === 0) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.getAddressList()
            }
          } catch (err) {
            console.error('删除地址失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  }
}) 
const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    addressList: [],
    loading: true,
    fromCart: false
  },

  onLoad(options) {
    // 从参数中获取来源标记
    this.setData({
      fromCart: options.from === 'cart'
    })
    console.log('地址列表页面参数:', options)
    console.log('是否来自购物车:', this.data.fromCart)
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

  // 点击地址项
  handleAddressClick(e) {
    const { id } = e.currentTarget.dataset
    
    // 来自购物车页面，选择地址并返回
    if (this.data.fromCart) {
      const selectedAddress = this.data.addressList.find(item => item.id === id)
      if (selectedAddress) {
        // 获取页面栈
        const pages = getCurrentPages()
        const cartPage = pages[pages.length - 2]
        
        if (cartPage) {
          // 直接调用 setData 更新购物车页面的地址
          cartPage.setData({
            selectedAddress: selectedAddress
          }, () => {
            console.log('已更新购物车页面地址:', selectedAddress)
          })
          
          // 延迟返回确保数据更新完成
          setTimeout(() => {
            wx.navigateBack()
          }, 100)
        } else {
          console.error('未找到购物车页面实例')
          wx.navigateBack()
        }
      }
      return
    }
    
    // 来自其他页面，进入编辑页面
    wx.navigateTo({
      url: `/pages/address/edit/index?id=${id}`
    })
  },

  // 编辑地址
  editAddress(e) {
    const id = e.currentTarget.dataset.id
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
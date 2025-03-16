const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    goods: null,
    loading: true,
    selectedAddress: null
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.getGoodsDetail(id)
      this.getDefaultAddress()
    }
  },

  // 获取商品详情
  async getGoodsDetail(id) {
    try {
      const res = await request({
        url: `/api/goods/detail/${id}`
      })
      
      if (res.code === 0) {
        this.setData({
          goods: res.data,
          loading: false
        })
      }
    } catch (error) {
      console.error('获取商品详情失败:', error)
      wx.showToast({
        title: '获取商品详情失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取默认地址
  async getDefaultAddress() {
    try {
      const res = await request({
        url: '/api/address/default'
      })
      if (res.code === 0 && res.data) {
        console.log('获取默认地址成功:', res.data)
        this.setData({
          selectedAddress: res.data
        })
      }
    } catch (error) {
      console.error('获取默认地址失败:', error)
    }
  },

  // 添加到购物车
  async addToCart() {
    if (!checkLogin()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }

    try {
      const res = await request({
        url: '/api/cart/add',
        method: 'POST',
        data: {
          goodsId: this.data.goods.id,
          quantity: 1
        }
      })
      if (res.code === 0) {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        })
      }
    } catch (error) {
      console.error('添加购物车失败:', error)
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  },

  // 跳转到购物车
  async goToCart() {
    try {
      // 获取购物车列表
      const res = await request({
        url: '/api/cart/list'
      })
      
      if (res.code === 0) {
        wx.switchTab({
          url: '/pages/cart/index'
        })
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error)
      wx.switchTab({
        url: '/pages/cart/index'
      })
    }
  },

  // 立即购买
  async buyNow() {
    if (!checkLogin()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
        }
      })
      return
    }

    wx.showLoading({
      title: '正在创建订单...'
    })

    try {
      // 创建订单
      const res = await request({
        url: '/api/order/create',
        method: 'POST',
        data: {
          addressId: this.data.selectedAddress.id,
          goods: [{
            goodsId: this.data.goods.id,
            quantity: 1
          }]
        }
      })

      console.log('创建订单响应:', res)

      if (res.code === 0 && res.data && res.data.orderNo) {
        wx.showLoading({
          title: '正在发起支付...'
        })

        // 调用支付接口
        const payRes = await request({
          url: '/api/order/pay',
          method: 'POST',
          data: {
            orderNo: res.data.orderNo
          }
        })

        console.log('支付接口响应:', payRes)

        if (payRes.code === 0) {
          wx.hideLoading()
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          })
          // 跳转到订单列表
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/order/list/index'
            })
          }, 1500)
        } else {
          throw new Error(payRes.msg || '支付失败')
        }
      } else {
        throw new Error(res.msg || '创建订单失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    }
  }
}) 
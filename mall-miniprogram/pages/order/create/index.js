const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')
const { wx } = require('../../../config')

Page({
  data: {
    address: null,
    goodsList: [],
    totalPrice: 0,
    totalCount: 0,
    loading: false
  },

  onLoad(options) {
    if (!checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }

    // 从购物车页面获取选中的商品数据
    const pages = getCurrentPages()
    const cartPage = pages[pages.length - 2]
    if (cartPage) {
      const selectedGoods = cartPage.data.cartList.filter(item => item.selected)
      const totalPrice = selectedGoods.reduce((total, item) => total + (item.price * item.quantity), 0)
      const totalCount = selectedGoods.reduce((total, item) => total + item.quantity, 0)

      this.setData({
        goodsList: selectedGoods,
        totalPrice,
        totalCount,
        address: cartPage.data.selectedAddress
      })
    } else {
      wx.showToast({
        title: '获取商品信息失败',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 跳转到地址选择页面
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/list/index?from=order'
    })
  },

  // 提交订单
  async submitOrder() {
    if (!this.data.address) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }

    if (this.data.goodsList.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const res = await request({
        url: '/api/order/create',
        method: 'POST',
        data: {
          addressId: this.data.address.id,
          goods: this.data.goodsList.map(item => ({
            goodsId: item.id,
            quantity: item.quantity
          }))
        }
      })

      if (res.code === 0) {
        // 跳转到支付页面，传递订单ID和商品ID列表
        const goodsIds = this.data.goodsList.map(item => item.id)
        wx.navigateTo({
          url: `/pages/pay/index?orderId=${res.data.orderId}&goodsIds=${goodsIds.join(',')}`
        })
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      wx.showToast({
        title: '创建订单失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
}) 
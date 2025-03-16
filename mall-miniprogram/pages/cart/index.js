const { request } = require('../../utils/request')
const { checkLogin } = require('../../utils/auth')

Page({
  data: {
    cartList: [],
    totalPrice: 0,
    selectedAll: false,
    loading: true,  // 添加loading状态
    selectedAddress: null
  },

  onShow() {
    // 检查登录状态
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

    // 如果没有选择的地址，才获取默认地址
    if (!this.data.selectedAddress) {
      this.getDefaultAddress()
    }

    this.getCartList()
  },

  // 获取购物车列表
  async getCartList() {
    console.log('=== 获取购物车列表 ===')
    this.setData({ loading: true })
    try {
      // 打印请求前的token
      const token = wx.getStorageSync('token')
      console.log('请求头Token:', token)

      const res = await request({
        url: '/api/cart/list'
      })
      
      console.log('购物车列表请求结果:', {
        statusCode: res.statusCode,
        data: res.data,
        headers: res.header
      })

      if (res.code === 0) {
        this.setData({
          cartList: res.data.list.map(item => ({
            ...item,
            image_url: item.image_url || '/assets/images/default-goods.png'
          })),
          totalPrice: res.data.totalPrice,
          loading: false
        })
        this.checkSelectedAll()
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error)
      // 打印更详细的错误信息
      if(error.response) {
        console.error('错误响应:', error.response)
      }
      this.setData({ loading: false })
      wx.showToast({
        title: '获取购物车列表失败',
        icon: 'none'
      })
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

  // 跳转到地址列表
  goToAddress() {
    wx.navigateTo({
      url: '/pages/address/list/index?from=cart'
    })
  },

  // 更新商品数量
  async updateQuantity(e) {
    const { id, quantity } = e.currentTarget.dataset
    if (quantity < 1) return
    
    try {
      const res = await request({
        url: '/api/cart/update',
        method: 'POST',
        data: { id, quantity }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('更新数量失败:', error)
      wx.showToast({
        title: '更新数量失败',
        icon: 'none'
      })
    }
  },

  // 删除商品
  async deleteGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const res = await request({
              url: '/api/cart/delete',
              method: 'POST',
              data: { ids: [id] }
            })
            if (res.code === 0) {
              this.getCartList()
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
            }
          } catch (error) {
            console.error('删除商品失败:', error)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 选择商品
  async selectGoods(e) {
    const { id } = e.currentTarget.dataset
    const selected = !this.data.cartList.find(item => item.id === id).selected
    try {
      const res = await request({
        url: '/api/cart/selected',
        method: 'POST',
        data: { ids: [id], selected }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('选择商品失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 全选/取消全选
  async selectAll() {
    const selected = !this.data.selectedAll
    const ids = this.data.cartList.map(item => item.id)
    try {
      const res = await request({
        url: '/api/cart/selected',
        method: 'POST',
        data: { ids, selected }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('全选/取消全选失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 检查是否全选
  checkSelectedAll() {
    const selectedAll = this.data.cartList.length > 0 && 
      this.data.cartList.every(item => item.selected)
    this.setData({ selectedAll })
  },

  // 结算
  async settlement() {
    const selectedGoods = this.data.cartList.filter(item => item.selected)
    if (selectedGoods.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.selectedAddress) {
      wx.showToast({
        title: '请选择收货地址',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '正在创建订单...'
    })

    try {
      // 创建订单
      console.log('创建订单参数:', {
        addressId: this.data.selectedAddress.id,
        goods: selectedGoods.map(item => ({
          goodsId: item.id,
          quantity: item.quantity
        }))
      })

      const res = await request({
        url: '/api/order/create',
        method: 'POST',
        data: {
          addressId: this.data.selectedAddress.id,
          goods: selectedGoods.map(item => ({
            goodsId: item.id,
            quantity: item.quantity
          }))
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
          // 由于是测试环境，直接模拟支付成功
          wx.hideLoading()
          
          // 支付成功后清空购物车中已购买的商品
          const goodsIds = selectedGoods.map(item => item.id)
          this.removeFromCart(goodsIds)
          
          wx.showToast({
            title: '支付成功',
            icon: 'success'
          })

          // 跳转到订单列表页
          setTimeout(() => {
            wx.navigateTo({
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
      console.error('结算失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: error.message || '结算失败',
        icon: 'none'
      })
    }
  },

  // 从购物车移除商品
  async removeFromCart(goodsIds) {
    try {
      // 调用后端接口删除商品
      const res = await request({
        url: '/api/cart/delete',
        method: 'POST',
        data: {
          ids: goodsIds
        }
      })

      if (res.code === 0) {
        // 更新购物车列表
        this.setData({
          cartList: this.data.cartList.filter(item => !goodsIds.includes(item.id)),
          selectedAll: false  // 重置全选状态
        })

        // 重新计算总价
        const totalPrice = this.data.cartList.reduce((total, item) => {
          if (item.selected) {
            return total + (item.price * item.quantity)
          }
          return total
        }, 0)

        this.setData({ totalPrice })

        console.log('购物车商品删除成功:', goodsIds)
      } else {
        throw new Error(res.msg || '删除商品失败')
      }
    } catch (error) {
      console.error('清空购物车失败:', error)
      wx.showToast({
        title: '清空购物车失败',
        icon: 'none'
      })
    }
  }
}) 
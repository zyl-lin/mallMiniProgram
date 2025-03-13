const { request } = require('../../utils/request')

Page({
  data: {
    cartList: [],
    totalPrice: 0,
    selectedAll: false
  },

  onShow() {
    this.getCartList()
  },

  // 获取购物车列表
  async getCartList() {
    try {
      const res = await request({
        url: '/api/cart/list'
      })
      if (res.code === 0) {
        this.setData({
          cartList: res.data.list,
          totalPrice: res.data.totalPrice
        })
        this.checkSelectedAll()
      }
    } catch (error) {
      console.error('获取购物车列表失败:', error)
    }
  },

  // 更新商品数量
  async updateQuantity(e) {
    const { id, quantity } = e.currentTarget.dataset
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
    }
  },

  // 删除商品
  async deleteGoods(e) {
    const { id } = e.currentTarget.dataset
    try {
      const res = await request({
        url: '/api/cart/delete',
        method: 'POST',
        data: { ids: [id] }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('删除商品失败:', error)
    }
  },

  // 选择商品
  async selectGoods(e) {
    const { id } = e.currentTarget.dataset
    const selected = !this.data.cartList.find(item => item.id === id).selected
    try {
      const res = await request({
        url: '/api/cart/selected',
        method: 'PUT',
        data: { ids: [id], selected }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('选择商品失败:', error)
    }
  },

  // 全选/取消全选
  async selectAll() {
    const selected = !this.data.selectedAll
    const ids = this.data.cartList.map(item => item.id)
    try {
      const res = await request({
        url: '/api/cart/selected',
        method: 'PUT',
        data: { ids, selected }
      })
      if (res.code === 0) {
        this.getCartList()
      }
    } catch (error) {
      console.error('全选/取消全选失败:', error)
    }
  },

  // 检查是否全选
  checkSelectedAll() {
    const selectedAll = this.data.cartList.length > 0 && 
      this.data.cartList.every(item => item.selected)
    this.setData({ selectedAll })
  },

  // 结算
  settlement() {
    const selectedGoods = this.data.cartList.filter(item => item.selected)
    if (selectedGoods.length === 0) {
      wx.showToast({
        title: '请选择商品',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: '/pages/order/create/index'
    })
  }
}) 
const { request } = require('../../utils/request')
const { checkLogin } = require('../../utils/auth')

Page({
  data: {
    cartList: [],
    totalPrice: 0,
    selectedAll: false,
    loading: true  // 添加loading状态
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

    // 检查图片资源是否存在
    try {
      wx.getImageInfo({
        src: '/assets/images/checked.png',
        success: () => {
          console.log('选中图片资源加载成功')
        },
        fail: (error) => {
          console.error('选中图片资源加载失败:', error)
        }
      })
      wx.getImageInfo({
        src: '/assets/images/unchecked.png',
        success: () => {
          console.log('未选中图片资源加载成功')
        },
        fail: (error) => {
          console.error('未选中图片资源加载失败:', error)
        }
      })
    } catch (error) {
      console.error('图片资源检查失败:', error)
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
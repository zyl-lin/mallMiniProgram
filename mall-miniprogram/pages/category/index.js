const { request } = require('../../utils/request')

Page({
  data: {
    categories: []
  },

  onLoad() {
    this.getCategories()
  },

  // 获取分类列表
  async getCategories() {
    try {
      const res = await request({
        url: '/api/category/list'
      })
      if (res.code === 0) {
        this.setData({
          categories: res.data
        })
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  },

  // 跳转到分类商品列表
  goToCategoryGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/list/index?categoryId=${id}`
    })
  }
}) 
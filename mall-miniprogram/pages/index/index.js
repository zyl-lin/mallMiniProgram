const { request } = require('../../utils/request')

Page({
  data: {
    banners: [],
    recommendGoods: [],
    categories: []
  },

  onLoad() {
    this.getBanners()
    this.getRecommendGoods()
    this.getCategories()
  },

  // 获取轮播图
  async getBanners() {
    try {
      const res = await request({
        url: '/api/banner/list'
      })
      if (res.code === 0) {
        this.setData({
          banners: res.data
        })
      }
    } catch (error) {
      console.error('获取轮播图失败:', error)
    }
  },

  // 获取推荐商品
  async getRecommendGoods() {
    try {
      const res = await request({
        url: '/api/goods/recommend'
      })
      if (res.code === 0) {
        this.setData({
          recommendGoods: res.data
        })
      }
    } catch (error) {
      console.error('获取推荐商品失败:', error)
    }
  },

  // 获取分类及商品
  async getCategories() {
    try {
      const res = await request({
        url: '/api/category/home'
      })
      if (res.code === 0) {
        this.setData({
          categories: res.data
        })
      }
    } catch (error) {
      console.error('获取分类商品失败:', error)
    }
  },

  // 跳转到商品详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/detail/index?id=${id}`
    })
  },

  // 跳转到分类商品列表
  goToCategoryGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/list/index?categoryId=${id}`
    })
  }
}) 
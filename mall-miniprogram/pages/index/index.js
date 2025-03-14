const { request } = require('../../utils/request')

Page({
  data: {
    banners: [],
    recommendGoods: [],
    categories: [],
    categoriesGoods: {} // 用于存储每个分类下的商品
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
        console.log('banners:', res.data) // 确认图片URL
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
        console.log('recommendGoods:', res.data) // 确认图片URL
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
        
        // 获取每个分类的商品
        for (const category of res.data) {
          try {
            const goodsRes = await request({
              url: `/api/category/${category.id}/goods`,
              data: {
                page: 1,
                pageSize: 3 // 每个分类只显示3个商品
              }
            })
            
            if (goodsRes.code === 0) {
              // 使用setData更新特定分类的商品
              this.setData({
                [`categoriesGoods.${category.id}`]: goodsRes.data.goods
              })
              console.log(`分类${category.id}商品:`, goodsRes.data.goods) // 调试日志
            }
          } catch (error) {
            console.error(`获取分类${category.id}商品失败:`, error)
          }
        }
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
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
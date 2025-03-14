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
    const { id, name } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/list/index?categoryId=${id}&categoryName=${name}`
    })
  },

  // 添加到购物车
  async addToCart(e) {
    // 检查是否已登录
    const token = wx.getStorageSync('token')
    if (!token) {
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

    const { id } = e.currentTarget.dataset
    try {
      const res = await request({
        url: '/api/cart/add',
        method: 'POST',
        data: {
          goodsId: id,
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
      if (error.statusCode === 401) {
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
      } else {
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        })
      }
    }
  }
}) 
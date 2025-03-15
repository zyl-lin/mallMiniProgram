const { request } = require('../../utils/request')
const { checkLogin } = require('../../utils/auth')

Page({
  data: {
    categories: [],
    currentCategory: null,
    goodsList: [],
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true
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
      if (res.code === 0 && res.data.length > 0) {
        await this.setData({
          categories: res.data,
          currentCategory: res.data[0] // 默认选中第一个分类
        })
        this.getGoodsList()
      } else {
        console.log('没有获取到分类数据')
      }
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category
    if (!category) return
    
    this.setData({
      currentCategory: category,
      goodsList: [],
      page: 1,
      hasMore: true
    }, () => {
      this.getGoodsList()
    })
  },

  // 获取商品列表
  async getGoodsList() {
    if (!this.data.hasMore || this.data.loading || !this.data.currentCategory) return

    this.setData({ loading: true })
    try {
      const res = await request({
        url: `/api/category/${this.data.currentCategory.id}/goods`,
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })
      
      if (res.code === 0) {
        const newList = [...this.data.goodsList, ...res.data.goods]
        this.setData({
          goodsList: newList,
          hasMore: res.data.goods.length === this.data.pageSize,
          page: this.data.page + 1
        })
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载更多
  loadMore() {
    this.getGoodsList()
  },

  // 跳转到商品详情
  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/goods/detail/index?id=${id}`
    })
  },

  // 添加到购物车
  async addToCart(e) {
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
      wx.showToast({
        title: '添加失败',
        icon: 'none'
      })
    }
  }
}) 
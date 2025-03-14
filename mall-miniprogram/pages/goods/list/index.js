const { request } = require('../../../utils/request')

Page({
  data: {
    categoryId: '',
    categoryName: '',
    goodsList: [],
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad(options) {
    const { categoryId, categoryName } = options
    this.setData({
      categoryId,
      categoryName
    })
    wx.setNavigationBarTitle({
      title: categoryName
    })
    this.getGoodsList()
  },

  async getGoodsList() {
    if (!this.data.hasMore) return
    
    try {
      const res = await request({
        url: `/api/category/${this.data.categoryId}/goods`,
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })
      
      if (res.code === 0) {
        const newList = [...this.data.goodsList, ...res.data.goods]
        this.setData({
          goodsList: newList,
          hasMore: res.data.goods.length === this.data.pageSize
        })
      }
    } catch (error) {
      console.error('获取商品列表失败:', error)
    }
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.setData({
        page: this.data.page + 1
      })
      this.getGoodsList()
    }
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
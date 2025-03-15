Page({
  data: {
    currentTab: 0,
    orderList: [],
    pageNum: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad(options) {
    // 获取传入的状态参数
    const status = parseInt(options.status || 0)
    this.setData({ currentTab: status })
    this.loadOrderList()
  },

  // 切换tab
  switchTab(e) {
    const index = e.currentTarget.dataset.index
    if(this.data.currentTab === index) return
    this.setData({
      currentTab: index,
      orderList: [],
      pageNum: 1,
      hasMore: true
    })
    this.loadOrderList()
  },

  // 加载订单列表
  async loadOrderList() {
    if(!this.data.hasMore) return
    
    try {
      wx.showLoading({title: '加载中...'})
      const res = await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'getOrderList',
          data: {
            status: this.data.currentTab,
            pageNum: this.data.pageNum,
            pageSize: this.data.pageSize
          }
        }
      })
      
      const { list, total } = res.result
      
      // 处理订单状态文案
      const orderList = list.map(item => {
        item.statusText = this.getStatusText(item.status)
        return item
      })

      this.setData({
        orderList: [...this.data.orderList, ...orderList],
        hasMore: this.data.orderList.length < total
      })
    } catch(err) {
      console.error('获取订单列表失败', err)
      wx.showToast({
        title: '获取订单列表失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  // 获取状态文案
  getStatusText(status) {
    const statusMap = {
      0: '全部',
      1: '待付款',
      2: '待发货',
      3: '待收货', 
      4: '已完成',
      5: '已取消'
    }
    return statusMap[status] || ''
  },

  // 取消订单
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      await wx.showModal({
        title: '提示',
        content: '确认取消该订单吗？'
      })
      
      await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'cancelOrder',
          data: { orderId }
        }
      })

      wx.showToast({
        title: '取消成功'
      })
      
      // 刷新订单列表
      this.setData({
        orderList: [],
        pageNum: 1
      })
      this.loadOrderList()
    } catch(err) {
      console.error('取消订单失败', err) 
      wx.showToast({
        title: '取消失败',
        icon: 'none'
      })
    }
  },

  // 支付订单
  async payOrder(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      // 调用支付接口
      await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'payOrder',
          data: { orderId }
        }
      })
      
      wx.showToast({
        title: '支付成功'
      })

      // 刷新订单列表
      this.setData({
        orderList: [],
        pageNum: 1
      })
      this.loadOrderList()
    } catch(err) {
      console.error('支付失败', err)
      wx.showToast({
        title: '支付失败',
        icon: 'none'
      })
    }
  },

  // 确认收货
  async confirmReceive(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      await wx.showModal({
        title: '提示',
        content: '确认已收到商品吗？'
      })
      
      await wx.cloud.callFunction({
        name: 'order',
        data: {
          action: 'confirmReceive',
          data: { orderId }
        }
      })

      wx.showToast({
        title: '确认成功'
      })

      // 刷新订单列表
      this.setData({
        orderList: [],
        pageNum: 1
      })
      this.loadOrderList()
    } catch(err) {
      console.error('确认收货失败', err)
      wx.showToast({
        title: '确认失败',
        icon: 'none'
      })
    }
  },

  // 上拉加载更多
  onReachBottom() {
    if(this.data.hasMore) {
      this.setData({
        pageNum: this.data.pageNum + 1
      })
      this.loadOrderList()
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    this.setData({
      orderList: [],
      pageNum: 1,
      hasMore: true
    })
    await this.loadOrderList()
    wx.stopPullDownRefresh()
  }
}) 
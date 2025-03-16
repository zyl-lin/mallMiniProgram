const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    orderList: [],
    loading: true,
    currentTab: 0,  // 当前选中的标签
    tabs: [
      { id: '', name: '全部' },      // 对应 status: ''
      { id: '0', name: '待付款' },   // 对应 status: '0'
      { id: '1', name: '待发货' },   // 对应 status: '1'
      { id: '2', name: '待收货' },   // 对应 status: '2'
      { id: '3', name: '已完成' }    // 对应 status: '3'
    ],
    // 添加状态文本映射
    statusTextMap: {
      0: '待付款',
      1: '待发货',
      2: '待收货',
      3: '已完成'
    },
    // 添加分页相关数据
    page: 1,
    pageSize: 10,
    hasMore: true
  },

  onLoad(options) {
    // 如果有传入状态参数，则切换到对应标签
    if (options.status !== undefined) {
      const tabIndex = this.data.tabs.findIndex(tab => tab.id === options.status)
      if (tabIndex !== -1) {
        this.setData({ currentTab: tabIndex })
      }
    }

    if (!checkLogin()) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    this.loadOrderList()
  },

  // 切换标签
  switchTab(e) {
    const tabIndex = e.currentTarget.dataset.index
    if (this.data.currentTab === tabIndex) return
    
    this.setData({ 
      currentTab: tabIndex,
      loading: true,
      page: 1,
      hasMore: true
    }, () => {
      this.loadOrderList()
    })
  },

  // 获取当前状态对应的状态值
  getStatusValue(tabIndex) {
    const statusMap = {
      0: '',        // 全部
      1: '0',       // 待付款
      2: '1',       // 待发货
      3: '2',       // 待收货
      4: '3'        // 已完成
    }
    return statusMap[tabIndex]
  },

  // 加载订单列表
  async loadOrderList() {
    try {
      const status = this.data.tabs[this.data.currentTab].id
      console.log('请求订单列表，状态:', status)

      const res = await request({
        url: '/api/order/list',
        method: 'GET',
        data: { 
          status,
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      })

      console.log('订单列表响应:', res)

      if (res.code === 0) {
        // 处理订单数据，添加状态文本
        const newOrders = (res.data.list || []).map(order => {
          const goods = order.goods || []
          return {
            ...order,
            goods,
            statusText: this.data.statusTextMap[order.status],
            totalCount: goods.reduce((sum, item) => sum + (item.quantity || 0), 0),
            totalAmount: (order.total_amount || 0)
          }
        })

        // 更新订单列表,判断是否还有更多数据
        this.setData({
          orderList: this.data.page === 1 ? newOrders : [...this.data.orderList, ...newOrders],
          loading: false,
          hasMore: newOrders.length === this.data.pageSize
        })
      } else {
        throw new Error(res.msg || '获取订单列表失败')
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      wx.showToast({
        title: '获取订单列表失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 取消订单
  async cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      const res = await request({
        url: '/api/order/cancel',
        method: 'POST',
        data: { orderId }
      })

      if (res.code === 0) {
        wx.showToast({
          title: '取消成功',
          icon: 'success'
        })
        this.loadOrderList()
      } else {
        throw new Error(res.msg || '取消订单失败')
      }
    } catch (error) {
      console.error('取消订单失败:', error)
      wx.showToast({
        title: error.message || '取消订单失败',
        icon: 'none'
      })
    }
  },

  // 确认收货
  async confirmReceive(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      const res = await request({
        url: '/api/order/confirm',
        method: 'POST',
        data: { orderId }
      })

      if (res.code === 0) {
        wx.showToast({
          title: '确认收货成功',
          icon: 'success'
        })
        this.loadOrderList()
      } else {
        throw new Error(res.msg || '确认收货失败')
      }
    } catch (error) {
      console.error('确认收货失败:', error)
      wx.showToast({
        title: error.message || '确认收货失败',
        icon: 'none'
      })
    }
  },

  // 去支付
  async payOrder(e) {
    const orderId = e.currentTarget.dataset.id
    try {
      const res = await request({
        url: '/api/order/pay',
        method: 'POST',
        data: { orderId }
      })

      if (res.code === 0) {
        // 由于是测试环境，直接模拟支付成功
        wx.showToast({
          title: '支付成功',
          icon: 'success'
        })
        this.loadOrderList()
      } else {
        throw new Error(res.msg || '支付失败')
      }
    } catch (error) {
      console.error('支付失败:', error)
      wx.showToast({
        title: error.message || '支付失败',
        icon: 'none'
      })
    }
  },

  // 添加页面上拉触底事件
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      }, () => {
        this.loadOrderList()
      })
    }
  }
}) 
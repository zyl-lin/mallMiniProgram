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
    ]
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
    const tabIndex = e.currentTarget.dataset.index // 使用索引而不是status值
    if (this.data.currentTab === tabIndex) return
    
    this.setData({ 
      currentTab: tabIndex,
      loading: true 
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
      const status = this.data.tabs[this.data.currentTab].id // 直接使用tab的id作为status
      console.log('请求订单列表，状态:', status)

      const res = await request({
        url: '/api/order/list',
        method: 'GET',
        data: {
          status: status
        }
      })

      console.log('订单列表响应:', res)

      if (res.code === 0) {
        this.setData({
          orderList: res.data.list || [],
          loading: false
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
  }
}) 
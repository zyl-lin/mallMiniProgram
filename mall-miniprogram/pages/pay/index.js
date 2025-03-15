// 支付成功后的处理
async handlePaySuccess() {
  try {
    // 清空购物车中对应的商品
    const goodsIds = this.data.goodsIds.split(',')
    await request({
      url: '/api/cart/remove',
      method: 'POST',
      data: {
        ids: goodsIds
      }
    })

    // 更新购物车页面数据
    const pages = getCurrentPages()
    const cartPage = pages.find(p => p.route === 'pages/cart/index')
    if (cartPage) {
      cartPage.setData({
        cartList: cartPage.data.cartList.filter(item => !goodsIds.includes(item.id))
      })
    }

    wx.showToast({
      title: '支付成功',
      icon: 'success'
    })

    // 跳转到订单列表页
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/order/list/index'
      })
    }, 1500)
  } catch (error) {
    console.error('清空购物车失败:', error)
  }
} 
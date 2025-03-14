// pages/user/index.js
const { request } = require('../../utils/request')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,
        orderCount: {
            unpaid: 0,
            undelivered: 0,
            delivered: 0
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('=== User Page onLoad ===')
        console.log('Global userInfo:', getApp().globalData.userInfo)
        console.log('Local Storage userInfo:', wx.getStorageSync('userInfo'))
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        console.log('=== User Page onShow ===')
        // 获取用户信息
        const userInfo = wx.getStorageSync('userInfo')
        console.log('Local Storage userInfo in onShow:', userInfo)
        
        if (userInfo && userInfo.nickname && userInfo.avatar_url) {
            console.log('Setting userInfo to:', userInfo)
            this.setData({ 
                userInfo: {
                    nickname: userInfo.nickname,
                    avatar_url: userInfo.avatar_url
                }
            })
            this.getOrderCount()
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },

    // 检查登录状态
    checkLogin() {
        const userInfo = wx.getStorageSync('userInfo')
        const token = wx.getStorageSync('token')
        if (userInfo && token) {
            this.setData({ userInfo })
        }
    },

    // 跳转到登录页
    login() {
        wx.navigateTo({
            url: '/pages/login/index'
        })
    },

    // 获取订单数量
    async getOrderCount() {
        console.log('=== Requesting Order Count ===')
        try {
            const res = await request({
                url: '/api/order/count',
                method: 'GET'
            })
            console.log('Order count response:', res)
            
            if (res.code === 0) {
                this.setData({
                    orderCount: res.data
                })
            }
        } catch (err) {
            console.error('Get order count failed:', err)
        }
    },

    // 跳转到订单列表
    goToOrderList(e) {
        if (!this.data.userInfo) {
            this.login()
            return
        }
        const { type } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/order/list/index?type=${type}`
        })
    },

    // 跳转到收货地址
    goToAddress() {
        if (!this.data.userInfo) {
            this.login()
            return
        }
        wx.navigateTo({
            url: '/pages/address/list/index'
        })
    },

    // 联系客服
    contactService() {
        wx.makePhoneCall({
            phoneNumber: '400-123-4567'
        })
    },

    // 跳转到意见反馈
    goToFeedback() {
        if (!this.data.userInfo) {
            this.login()
            return
        }
        wx.navigateTo({
            url: '/pages/feedback/index'
        })
    },

    // 跳转到关于我们
    goToAbout() {
        wx.navigateTo({
            url: '/pages/about/index'
        })
    }
})
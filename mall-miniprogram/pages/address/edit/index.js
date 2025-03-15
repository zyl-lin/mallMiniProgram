// pages/address/edit/index.js
const { request } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        id: null,
        address: {
            receiver_name: '',
            receiver_phone: '',
            province: '',
            city: '',
            district: '',
            detail_address: '',
            is_default: false
        },
        region: ['请选择省市区'],
        loading: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.id) {
            this.setData({ id: options.id })
            this.getAddressDetail()
        }
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

    // 获取地址详情
    async getAddressDetail() {
        try {
            const res = await request({
                url: '/api/address/detail',
                data: { id: this.data.id }
            })
            if (res.code === 0) {
                const { province, city, district, ...rest } = res.data
                this.setData({
                    address: res.data,
                    region: [province, city, district]
                })
            }
        } catch (err) {
            console.error('获取地址详情失败:', err)
            wx.showToast({
                title: '获取地址详情失败',
                icon: 'none'
            })
        }
    },

    // 输入框变化
    onInput(e) {
        const { field } = e.currentTarget.dataset
        this.setData({
            [`address.${field}`]: e.detail.value
        })
    },

    // 地区选择器变化
    bindRegionChange(e) {
        const [province, city, district] = e.detail.value
        this.setData({
            region: e.detail.value,
            'address.province': province,
            'address.city': city,
            'address.district': district
        })
    },

    // 默认地址开关变化
    onSwitchChange(e) {
        this.setData({
            'address.is_default': e.detail.value
        })
    },

    // 保存地址
    async saveAddress() {
        const { address } = this.data
        
        // 表单验证
        if (!address.receiver_name.trim()) {
            wx.showToast({
                title: '请输入收货人姓名',
                icon: 'none'
            })
            return
        }
        if (!/^1\d{10}$/.test(address.receiver_phone)) {
            wx.showToast({
                title: '请输入正确的手机号',
                icon: 'none'
            })
            return
        }
        if (!address.province || !address.city || !address.district) {
            wx.showToast({
                title: '请选择省市区',
                icon: 'none'
            })
            return
        }
        if (!address.detail_address.trim()) {
            wx.showToast({
                title: '请输入详细地址',
                icon: 'none'
            })
            return
        }

        this.setData({ loading: true })
        try {
            const url = this.data.id ? '/api/address/update' : '/api/address/add'
            const res = await request({
                url,
                method: 'POST',
                data: this.data.id ? { ...address, id: this.data.id } : address
            })
            if (res.code === 0) {
                wx.showToast({
                    title: '保存成功',
                    icon: 'success'
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
            }
        } catch (err) {
            console.error('保存地址失败:', err)
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            })
        }
        this.setData({ loading: false })
    }
})
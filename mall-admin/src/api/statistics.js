import request from '@/utils/request'

// 获取销售统计数据
export function getSalesStats() {
  return request({
    url: '/api/admin/stats/sales',
    method: 'get'
  })
}

// 获取销售趋势数据
export function getSalesTrend() {
  return request({
    url: '/api/admin/stats/sales-trend',
    method: 'get'
  })
}

// 获取热销商品数据
export function getHotGoods() {
  return request({
    url: '/api/admin/stats/hot-goods',
    method: 'get'
  })
}

// 获取订单统计数据
export function getOrderStats() {
  return request({
    url: '/api/admin/stats/orders',
    method: 'get'
  })
}

// 获取转化率统计数据
export function getConversionStats() {
  return request({
    url: '/api/admin/stats/conversion',
    method: 'get'
  })
} 